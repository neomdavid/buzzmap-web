import React, { useEffect, useRef, useState } from "react";
import { useGetBarangaysQuery, useGetPostsQuery, useGetAllInterventionsQuery } from "../../api/dengueApi";
import * as turf from "@turf/turf";
import LoadingSpinner from "../ui/LoadingSpinner";
import ErrorMessage from "../ui/ErrorMessage";
import cleanUpIcon from "../../assets/icons/cleanup.svg";
import foggingIcon from "../../assets/icons/fogging.svg";
import educationIcon from "../../assets/icons/education.svg";
import trappingIcon from "../../assets/icons/trapping.svg";
import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import standingIcon from '../../assets/icons/standing_water.svg';
import garbageIcon from '../../assets/icons/garbage.svg';
import othersIcon from '../../assets/icons/others.svg';

const PATTERN_COLORS = {
  spike: "#e53e3e",
  gradual_rise: "#dd6b20",
  decline: "#38a169",
  stability: "#3182ce",
  none: "#718096",
  default: "#718096",
};
const INTERVENTION_TYPE_ICONS = {
  "Fogging": foggingIcon,
  "Ovicidal-Larvicidal Trapping": trappingIcon,
  "Clean-up Drive": cleanUpIcon,
  "Education Campaign": educationIcon,
  "default": foggingIcon
};
const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": stagnantIcon,
  "Standing Water": standingIcon,
  "Garbage": garbageIcon,
  "Others": othersIcon,
  "default": stagnantIcon
};
function normalizeBarangayName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\bsr\.?\b/g, '')
    .replace(/\bjr\.?\b/g, '')
    .replace(/[.\-']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
const QC_CENTER = { lat: 14.676, lng: 121.0437 };
let googleMapsScriptLoadingPromise = null;
function loadGoogleMapsScript(apiKey) {
  if (window.google && window.google.maps && window.google.maps.Map) {
    return Promise.resolve();
  }
  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }
  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    if (document.getElementById('google-maps-script')) {
      const check = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
  return googleMapsScriptLoadingPromise;
}

const MapOnly = ({ showBreedingSites = true, showInterventions = false, style = {}, className = "" }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const overlaysRef = useRef([]);
  const isMountedRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barangayData, setBarangayData] = useState(null);
  const [breedingSites, setBreedingSites] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const { data: barangaysList } = useGetBarangaysQuery();
  const { data: posts } = useGetPostsQuery();
  const { data: allInterventionsData } = useGetAllInterventionsQuery ? useGetAllInterventionsQuery() : { data: [] };
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (mapInstance.current) {
        overlaysRef.current.forEach(o => o.setMap(null));
        overlaysRef.current = [];
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isMountedRef.current) return;
      try {
        setLoading(true);
        setError(null);
        const barangayResponse = await fetch("/quezon_barangays_boundaries.geojson");
        if (!barangayResponse.ok) throw new Error('Failed to load barangay data');
        const barangayGeoJson = await barangayResponse.json();
        if (isMountedRef.current) {
          setBarangayData(barangayGeoJson);
        }
        if (posts) {
          const validPosts = Array.isArray(posts) ? posts : posts.posts || [];
          const validatedSites = validPosts.filter(post => post.status === "Validated" && post.specific_location && Array.isArray(post.specific_location.coordinates) && post.specific_location.coordinates.length === 2);
          if (isMountedRef.current) {
            setBreedingSites(validatedSites);
          }
        } else {
          if (isMountedRef.current) {
            setBreedingSites([]);
          }
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [barangaysList, posts]);

  useEffect(() => {
    if (allInterventionsData) {
      setInterventions(
        allInterventionsData.filter(i => i.specific_location && Array.isArray(i.specific_location.coordinates) && i.specific_location.coordinates.length === 2)
      );
    }
  }, [allInterventionsData]);

  useEffect(() => {
    if (loading || error || !barangayData || !isMountedRef.current) {
      return;
    }
    let map, overlays = [];
    loadGoogleMapsScript(apiKey).then(() => {
      if (!isMountedRef.current) return;
      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];
      if (!mapInstance.current) {
        try {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: QC_CENTER,
            zoom: 13,
            mapId: mapId || undefined,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
        } catch (err) {
          if (isMountedRef.current) {
            setError('Failed to initialize map');
          }
          return;
        }
      }
      map = mapInstance.current;
      barangayData.features.forEach((feature) => {
        const geometry = feature.geometry;
        const coordsArray = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
        let barangayObj = barangaysList?.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(feature.properties.name));
        let patternType = (barangayObj?.status_and_recommendation?.pattern_based?.status || feature.properties.patternType || feature.properties.pattern_type || 'none').toLowerCase();
        if (!patternType || patternType === '') patternType = 'none';
        const patternColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
        coordsArray.forEach((polygonCoords) => {
          const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
          const polygon = new window.google.maps.Polygon({
            paths: path,
            strokeColor: patternColor,
            strokeOpacity: 0.7,
            strokeWeight: 1,
            fillOpacity: 0.5,
            fillColor: patternColor,
            map,
            zIndex: 1,
          });
          overlays.push(polygon);
        });
      });
      let breedingMarkers = [];
      if (showBreedingSites && breedingSites.length > 0 && window.google.maps.marker) {
        const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
        breedingMarkers = breedingSites.map((site) => {
          const iconUrl = BREEDING_SITE_TYPE_ICONS[site.report_type] || BREEDING_SITE_TYPE_ICONS.default;
          const glyphImg = document.createElement("img");
          glyphImg.src = iconUrl;
          glyphImg.style.width = "28px";
          glyphImg.style.height = "28px";
          glyphImg.style.objectFit = "contain";
          glyphImg.style.backgroundColor = "#FFFFFF";
          glyphImg.style.borderRadius = "100%";
          glyphImg.style.padding = "2px";
          const pin = new PinElement({
            glyph: glyphImg,
            background: "#FF6347",
            borderColor: "#FF6347",
            scale: 1.5,
          });
          const marker = new AdvancedMarkerElement({
            map,
            position: {
              lat: site.specific_location.coordinates[1],
              lng: site.specific_location.coordinates[0],
            },
            content: pin.element,
            title: site.report_type || 'Breeding Site',
          });
          return marker;
        });
        breedingMarkers.forEach(m => m.setMap(map));
        overlays.push(...breedingMarkers);
      }
      if (showInterventions && interventions.length > 0 && window.google.maps.marker) {
        const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
        interventions.forEach((intervention) => {
          const iconUrl = INTERVENTION_TYPE_ICONS[intervention.interventionType] || INTERVENTION_TYPE_ICONS.default;
          const glyphImg = document.createElement("img");
          glyphImg.src = iconUrl;
          glyphImg.style.width = "28px";
          glyphImg.style.height = "28px";
          glyphImg.style.objectFit = "contain";
          glyphImg.style.backgroundColor = "#FFFFFF";
          glyphImg.style.borderRadius = "100%";
          glyphImg.style.padding = "2px";
          const pin = new PinElement({
            glyph: glyphImg,
            background: "#1893F8",
            borderColor: "#1893F8",
            scale: 1.5,
          });
          const marker = new AdvancedMarkerElement({
            map,
            position: {
              lat: intervention.specific_location.coordinates[1],
              lng: intervention.specific_location.coordinates[0],
            },
            content: pin.element,
            title: intervention.interventionType,
          });
          overlays.push(marker);
        });
      }
      overlaysRef.current = overlays;
    }).catch(err => {
      if (isMountedRef.current) {
        setError('Failed to load Google Maps');
      }
    });
    return () => {
      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [loading, error, barangayData, breedingSites, showBreedingSites, showInterventions, interventions, apiKey, mapId]);

  if (loading) return <LoadingSpinner size={32} className="h-full" message="Loading map..." />;
  if (error) return <ErrorMessage error={error} className="m-4" />;

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: 300, ...style }}
      id="map-only"
    />
  );
};

export default MapOnly; 