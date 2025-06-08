import { useEffect, useRef, useState, useMemo } from 'react';
import { useGetPostsQuery } from '../api/dengueApi';
import stagnantIcon from "../assets/icons/stagnant_water.svg";
import standingIcon from "../assets/icons/standing_water.svg";
import garbageIcon from "../assets/icons/garbage.svg";
import othersIcon from "../assets/icons/others.svg";
import foggingIcon from "../assets/icons/fogging.svg";
import trappingIcon from "../assets/icons/trapping.svg";
import cleanUpIcon from "../assets/icons/cleanup.svg";
import educationIcon from "../assets/icons/education.svg";
import * as turf from '@turf/turf';
import { MapPinLine, Circle } from "phosphor-react";
import { loadGoogleMapsScript, createMapInstance, cleanupMapInstance, isValidMapInstance } from "../utils/googleMapsLoader";

// Color utilities for map patterns
const PATTERN_COLORS = {
  spike: {
    fill: '#FF0000',
    stroke: '#CC0000',
    hover: '#FF3333'
  },
  cluster: {
    fill: '#FFA500',
    stroke: '#CC8400',
    hover: '#FFB733'
  },
  scattered: {
    fill: '#FFFF00',
    stroke: '#CCCC00',
    hover: '#FFFF33'
  },
  stable: {
    fill: '#00FF00',
    stroke: '#00CC00',
    hover: '#33FF33'
  },
  default: {
    fill: '#808080',
    stroke: '#666666',
    hover: '#999999'
  }
};

const getPatternColor = (patternType, type = 'fill') => {
  const pattern = PATTERN_COLORS[patternType?.toLowerCase()] || PATTERN_COLORS.default;
  return pattern[type] || pattern.fill;
};

const QC_CENTER = { lat: 14.5995, lng: 120.9842 };

const DengueMap = ({
  showLegends = true,
  defaultTab = 'cases',
  initialFocusBarangayName = null,
  searchQuery = '',
  selectedBarangay = null,
  activeInterventions = [],
  isLoadingInterventions = false,
  barangaysList = [],
  onBarangaySelect = () => {},
  onInfoWindowClose = null,
  showBreedingSites = true,
  showInterventions = false,
  onToggleBreedingSites = () => {},
  onToggleInterventions = () => {},
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polygonsRef = useRef([]);
  const { data: posts } = useGetPostsQuery();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [geojsonBarangays, setGeojsonBarangays] = useState([]);
  const infoWindowRef = useRef(null);
  const [selectedBarangayFeature, setSelectedBarangayFeature] = useState(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const [breedingSites, setBreedingSites] = useState([]);
  const [selectedBreedingSite, setSelectedBreedingSite] = useState(null);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  // Load GeoJSON for barangay boundaries
  useEffect(() => {
    fetch('/quezon_barangays_boundaries.geojson')
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          setGeojsonBarangays(data.features);
        } else {
          setGeojsonBarangays([]);
        }
      })
      .catch(() => setGeojsonBarangays([]));
  }, []);

  // Load Google Maps script if not already loaded
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,marker`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('[DengueMap DEBUG] Google Maps script loaded');
        if (!mapInstanceRef.current && mapRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: QC_CENTER,
            zoom: 12,
            mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
            styles: [
              { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
              { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
              { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
              { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
              { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
              { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
              { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
            ],
            mapTypeControl: false,
          });
          setMapLoaded(true);
        }
      };
      document.head.appendChild(script);
    } else {
      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: QC_CENTER,
          zoom: 12,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
          styles: [
            { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'on' }] },
            { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
            { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
            { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
            { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
          ],
          mapTypeControl: false,
        });
        setMapLoaded(true);
      }
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Initialize breeding sites from posts
  useEffect(() => {
    if (posts) {
      const postsArray = Array.isArray(posts.posts) ? posts.posts : (Array.isArray(posts) ? posts : []);
      const breedingSitesFromPosts = postsArray.filter(post => {
        const isValid = post.status === "Validated" && 
          post.specific_location?.coordinates &&
          (post.report_type === "Stagnant Water" || 
           post.report_type === "Standing Water" || 
           post.report_type === "Uncollected Garbage or Trash" ||
           post.report_type === "Others");
        return isValid;
      });
      setBreedingSites(breedingSitesFromPosts);
    } else {
      setBreedingSites([]);
    }
  }, [posts]);

  // Pattern color mapping
  const PATTERN_COLORS = {
    spike: "#e53e3e",        // red (error)
    gradual_rise: "#dd6b20", // orange (warning)
    decline: "#38a169",      // green (success)
    stability: "#3182ce",    // blue (info)
    none: "#718096",         // gray (default for no pattern)
    default: "#718096",      // gray (fallback)
  };

  // Breeding site type icon mapping
  const BREEDING_SITE_TYPE_ICONS = {
    "Stagnant Water": stagnantIcon,
    "Standing Water": standingIcon,
    "Uncollected Garbage or Trash": garbageIcon,
    "Others": othersIcon,
    "default": stagnantIcon,
  };

  // Intervention type icon mapping
  const INTERVENTION_TYPE_ICONS = {
    "Fogging": foggingIcon,
    "Ovicidal-Larvicidal Trapping": trappingIcon,
    "Clean-up Drive": cleanUpIcon,
    "Education Campaign": educationIcon,
    "default": foggingIcon,
  };

  function normalizeBarangayName(name) {
    if (!name || typeof name !== 'string') return '';
    return name.toLowerCase()
      .replace(/barangay\s+/i, '') // Remove "Barangay" prefix
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[^a-z0-9]/g, ''); // Remove special characters
  }

  // Merge pattern/status from barangaysList into geojsonBarangays
  const mergedBarangays = useMemo(() => {
    return geojsonBarangays.map(feature => {
      const geoName = normalizeBarangayName(feature.properties?.name);
      const apiBarangay = barangaysList.find(b => normalizeBarangayName(b.name) === geoName);
      return {
        ...feature,
        patternType: apiBarangay?.status_and_recommendation?.pattern_based?.status || feature.properties?.patternType || 'none',
        status_and_recommendation: apiBarangay?.status_and_recommendation || feature.properties?.status_and_recommendation || {},
        risk_level: apiBarangay?.risk_level || feature.properties?.risk_level || 'unknown',
        pattern_data: apiBarangay?.pattern_data || feature.properties?.pattern_data || {},
        apiBarangayName: apiBarangay?.name,
        properties: {
          ...feature.properties,
          displayName: feature.properties?.name || feature.properties?.displayName
        }
      };
    });
  }, [geojsonBarangays, barangaysList]);

  // Draw polygons and markers
  useEffect(() => {
    if (!mapLoaded || !mergedBarangays.length) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    polygonsRef.current.forEach(polygon => polygon.setMap(null));
    polygonsRef.current = [];
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const selectedNorm = normalizeBarangayName(searchQuery || '');

    mergedBarangays.forEach(barangay => {
      if (!barangay.geometry?.coordinates) return;
      let patternType = (barangay.patternType || barangay.properties?.patternType || 'none').toLowerCase();
      if (!patternType || patternType === '') patternType = 'none';
      const fillColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
      const barangayNorm = normalizeBarangayName(barangay.properties?.name || '');
      const isSelected = barangayNorm === selectedNorm;
      let coordsArray = [];
      if (barangay.geometry.type === 'Polygon') {
        coordsArray = [barangay.geometry.coordinates];
      } else if (barangay.geometry.type === 'MultiPolygon') {
        coordsArray = barangay.geometry.coordinates;
      } else {
        return;
      }
      coordsArray.forEach((polygonCoords) => {
        if (!Array.isArray(polygonCoords[0])) return;
        const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
        const polygon = new window.google.maps.Polygon({
          paths: path,
          strokeColor: isSelected ? '#222' : fillColor,
          strokeOpacity: isSelected ? 1 : 0.7,
          strokeWeight: isSelected ? 3 : 1,
          fillColor,
          fillOpacity: 0.5,
          map: map,
          zIndex: isSelected ? 6 : 1,
        });
        // Create a feature object with all necessary properties at top-level
        const feature = {
          type: 'Feature',
          geometry: barangay.geometry,
          properties: {
            ...barangay.properties,
            displayName: barangay.properties?.name
          },
          patternType: barangay.patternType,
          status_and_recommendation: barangay.status_and_recommendation,
          risk_level: barangay.risk_level,
          pattern_data: barangay.pattern_data,
          apiBarangayName: barangay.apiBarangayName,
        };
        polygon.addListener('click', () => {
          let latSum = 0, lngSum = 0, count = 0;
          polygonCoords[0].forEach(([lng, lat]) => {
            latSum += lat;
            lngSum += lng;
            count++;
          });
          const center = { lat: latSum / count, lng: lngSum / count };
          if (showInterventions || showBreedingSites) {
            if (showInterventions) {
              setSelectedIntervention(null);
              setSelectedBarangayFeature(feature);
              setInfoWindowPosition(center);
            } else if (showBreedingSites) {
              setSelectedBreedingSite(null);
              setSelectedBarangayFeature(feature);
              setInfoWindowPosition(center);
            }
          } else {
            setSelectedBarangayFeature(feature);
            setInfoWindowPosition(null);
          }
          handlePolygonClick(feature);
        });
        polygonsRef.current.push(polygon);
      });
    });

    // Add markers based on toggles
    if (showBreedingSites && breedingSites.length > 0 && window.google.maps.marker) {
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;

      breedingSites.forEach(site => {
        if (site.specific_location?.coordinates) {
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
              lng: site.specific_location.coordinates[0]
            },
            content: pin.element,
            title: site.report_type || 'Breeding Site'
          });

          marker.addListener('click', () => {
            setSelectedBreedingSite(site);
            setSelectedBarangayFeature(null);
            setSelectedIntervention(null);
            setInfoWindowPosition({
              lat: site.specific_location.coordinates[1],
              lng: site.specific_location.coordinates[0]
            });
          });

          markersRef.current.push(marker);
        }
      });
    }

    if (showInterventions && Array.isArray(activeInterventions) && window.google.maps.marker) {
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
      activeInterventions.forEach(intervention => {
        if (intervention.specific_location?.coordinates) {
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
          marker.addListener('click', () => {
            setSelectedIntervention(intervention);
            setSelectedBreedingSite(null);
            setSelectedBarangayFeature(null);
            setInfoWindowPosition({
              lat: intervention.specific_location.coordinates[1],
              lng: intervention.specific_location.coordinates[0]
            });
          });
          markersRef.current.push(marker);
        }
      });
    }
  }, [mapLoaded, mergedBarangays, searchQuery, posts, activeInterventions, onBarangaySelect, breedingSites, showBreedingSites, showInterventions]);

  // Only fit/zoom the map when the selected barangay changes
  useEffect(() => {
    if (!mapLoaded || !mergedBarangays.length || !searchQuery) return;
    const map = mapInstanceRef.current;
    if (!map) return;
    const selectedNorm = normalizeBarangayName(searchQuery);
    const selectedBarangay = mergedBarangays.find(
      barangay => normalizeBarangayName(barangay.properties?.name) === selectedNorm
    );
    if (selectedBarangay && selectedBarangay.geometry?.coordinates) {
      let bounds = new window.google.maps.LatLngBounds();
      let coordsArray = [];
      if (selectedBarangay.geometry.type === 'Polygon') {
        coordsArray = [selectedBarangay.geometry.coordinates];
      } else if (selectedBarangay.geometry.type === 'MultiPolygon') {
        coordsArray = selectedBarangay.geometry.coordinates;
      }
      coordsArray.forEach((polygonCoords) => {
        polygonCoords[0].forEach(([lng, lat]) => {
          bounds.extend({ lat, lng });
        });
      });
      map.fitBounds(bounds);
    }
  }, [mapLoaded, mergedBarangays, searchQuery]);

  // Show InfoWindow for selected barangay
  useEffect(() => {
    if (!selectedBarangayFeature || !infoWindowPosition || !mapInstanceRef.current) return;
    
    console.log('[DengueMap DEBUG] InfoWindow Creation - Full Selected Feature:', selectedBarangayFeature);
    console.log('[DengueMap DEBUG] InfoWindow Creation - Properties:', selectedBarangayFeature.properties);
    
    // Get patternType and status_and_recommendation from top-level or properties
    const patternType = selectedBarangayFeature.patternType?.toLowerCase() || 
                       selectedBarangayFeature.properties?.patternType?.toLowerCase() || 
                       selectedBarangayFeature.status_and_recommendation?.pattern_based?.status?.toLowerCase() || 
                       'none';
    
    const props = selectedBarangayFeature.properties || {};
    const status_and_recommendation = selectedBarangayFeature.status_and_recommendation || props.status_and_recommendation || {};
    const lastAnalysisTime = selectedBarangayFeature.last_analysis_time || 
                            props.last_analysis_time ||
                            status_and_recommendation?.last_analysis_time;
    
    const patternBased = status_and_recommendation?.pattern_based || {};
    const reportBased = status_and_recommendation?.report_based || {};
    const deathPriority = status_and_recommendation?.death_priority || {};

    // Detailed debug logs
    console.log('[DengueMap DEBUG] InfoWindow Data Access:', {
      patternType,
      status_and_recommendation,
      lastAnalysisTime,
      patternBased,
      reportBased,
      deathPriority
    });
    
    console.log('[DengueMap DEBUG] Pattern Based Details:', {
      status: patternBased.status,
      alert: patternBased.alert,
      admin_recommendation: patternBased.admin_recommendation,
      user_recommendation: patternBased.user_recommendation
    });
    
    console.log('[DengueMap DEBUG] Report Based Details:', {
      count: reportBased.count,
      alert: reportBased.alert,
      recommendation: reportBased.recommendation
    });
    
    console.log('[DengueMap DEBUG] Death Priority Details:', {
      count: deathPriority.count,
      alert: deathPriority.alert,
      recommendation: deathPriority.recommendation
    });

    // If we don't have the required data, don't create the InfoWindow
    if (!patternType || !status_and_recommendation || !patternBased.status) {
      console.log('[DengueMap DEBUG] Missing required data, skipping InfoWindow creation');
      return;
    }

    // Color for report-based alert
    const reportStatus = (reportBased.status || "unknown").toLowerCase();
    const REPORT_STATUS_COLORS = {
      low: "border-success bg-success/5",
      medium: "border-warning bg-warning/5",
      high: "border-error bg-error/5",
      unknown: "border-gray-400 bg-gray-100"
    };
    const reportCardColor = REPORT_STATUS_COLORS[reportStatus] || REPORT_STATUS_COLORS.unknown;

    const content = document.createElement('div');
    content.innerHTML = `
      <div class="bg-white p-4 rounded-lg text-center h-auto w-[50vw] max-w-[500px] min-w-[320px] break-words overflow-x-auto">
        <p class="text-4xl font-[900]" style="color: ${PATTERN_COLORS[patternType] || PATTERN_COLORS.default}">
          Barangay ${props.displayName || props.name}
        </p>
        <div class="mt-3 flex flex-col gap-3 text-black">
          <!-- Pattern Card -->
          <div class="p-3 rounded-lg border-2 ${
            patternType === 'spike'
              ? 'border-error bg-error/5'
              : patternType === 'gradual_rise'
              ? 'border-warning bg-warning/5'
              : patternType === 'decline'
              ? 'border-success bg-success/5'
              : patternType === 'stability'
              ? 'border-info bg-info/5'
              : 'border-gray-400 bg-gray-100'
          }">
            <div>
              <p class="text-sm font-medium text-gray-600 uppercase">Pattern</p>
              <div class="flex justify-center mt-1">
                <span class="px-3 py-1 rounded-full text-white font-semibold text-md" style="background-color: ${PATTERN_COLORS[patternType] || PATTERN_COLORS.default}">
                  ${patternType === 'none'
                    ? 'No pattern detected'
                    : patternType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
              ${patternBased.alert ? `
                <p class="text-base text-gray-700 mt-2">${patternBased.alert}</p>
              ` : ''}
            </div>
          </div>
          <!-- Pattern-Based Alert Card -->
          ${patternBased.alert && patternBased.alert !== "None" && patternBased.status ? `
            <div class="p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
              <div>
                <p class="text-sm font-medium text-gray-600 uppercase">Pattern-Based Alert</p>
                <p class="text-lg font-semibold">${patternBased.alert}</p>
              </div>
            </div>
          ` : ''}
          <!-- Report-Based Alert Card -->
          ${reportBased.alert && reportBased.alert !== "None" && reportBased.count > 0 ? `
            <div class="p-3 rounded-lg border-2 ${reportCardColor}">
              <div>
                <p class="text-sm font-medium text-gray-600 uppercase">Report-Based Alert</p>
                <p class="text-lg font-semibold">${reportBased.alert}</p>
              </div>
            </div>
          ` : ''}
          <!-- Death Priority Alert Card -->
          ${deathPriority.alert && deathPriority.alert !== "None" && deathPriority.count > 0 ? `
            <div class="p-3 rounded-lg border-2 border-primary/30 bg-primary/5">
              <div>
                <p class="text-sm font-medium text-gray-600 uppercase">Death Priority Alert</p>
                <p class="text-lg font-semibold">${deathPriority.alert}</p>
              </div>
            </div>
          ` : ''}
          <!-- Last Analyzed Card -->
          <div class="p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
            <div class="flex flex-col items-center">
              <p class="text-sm font-medium text-gray-600">Last Analyzed</p>
              <p class="text-lg font-semibold">
                ${lastAnalysisTime
                  ? (isNaN(new Date(lastAnalysisTime).getTime())
                      ? 'Invalid date'
                      : new Date(lastAnalysisTime).toLocaleString())
                  : 'No recent analysis'}
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({ maxWidth: 500 });
    }
    const infoWindow = infoWindowRef.current;
    infoWindow.setContent(content);
    infoWindow.setPosition(infoWindowPosition);
    infoWindow.open(mapInstanceRef.current);
    infoWindow.addListener('closeclick', () => {
      setSelectedBarangayFeature(null);
      setInfoWindowPosition(null);
      if (onInfoWindowClose) onInfoWindowClose();
    });
  }, [selectedBarangayFeature, infoWindowPosition, onInfoWindowClose]);

  // Show InfoWindow for breeding site
  useEffect(() => {
    if (!selectedBreedingSite || !infoWindowPosition || !mapInstanceRef.current) return;
    const site = selectedBreedingSite;
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
        <p class="font-bold text-4xl font-extrabold mb-4 text-primary">
          ${site.report_type || 'Breeding Site'}
        </p>
        <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
          <p class="text-xl">
            <span class="font-bold">Barangay:</span> ${site.barangay || ''}
          </p>
          <p class="text-xl">
            <span class="font-bold">Reported by:</span> ${site.user?.username || ''}
          </p>
          <p class="text-xl">
            <span class="font-bold">Date:</span> ${site.date_and_time ? new Date(site.date_and_time).toLocaleDateString() : ''}
          </p>
          <p class="text-xl">
            <span class="font-bold">Description:</span> ${site.description || ''}
          </p>
          ${(site.images && site.images.length > 0) ? `<div class='mt-2 flex justify-center gap-2'>${site.images.map(img => `<img src='${img}' class='w-35 h-25 object-cover rounded border'/>`).join('')}</div>` : ''}
        </div>
        <button class="mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold" onclick="window.location.href='/mapping/${site._id}'">View Details</button>
      </div>
    `;
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({ maxWidth: 500 });
    }
    const infoWindow = infoWindowRef.current;
    infoWindow.setContent(content);
    infoWindow.setPosition(infoWindowPosition);
    infoWindow.open(mapInstanceRef.current);
    infoWindow.addListener('closeclick', () => {
      setSelectedBreedingSite(null);
      setInfoWindowPosition(null);
    });
  }, [selectedBreedingSite, infoWindowPosition]);

  // Show InfoWindow for intervention
  useEffect(() => {
    if (!selectedIntervention || !infoWindowPosition || !mapInstanceRef.current) return;
    const intervention = selectedIntervention;
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-3 flex flex-col items-center gap-1 font-normal bg-white rounded-md shadow-md w-64 text-primary w-[50vw]">
        <p class="text-4xl font-extrabold text-primary mb-2">${intervention.interventionType}</p>
        <div class="text-lg flex items-center gap-2">
          <span class="font-bold">Status:</span>
          <span class="px-3 py-1 rounded-full text-white font-bold text-sm" style="background-color:#8b5cf6;box-shadow:0 1px 4px rgba(0,0,0,0.08);">${intervention.status}</span>
        </div>
        <p class="text-lg"><span class="font-bold">Barangay:</span> ${intervention.barangay}</p>
        ${intervention.address ? `<p class="text-lg"><span class="font-bold">Address:</span> ${intervention.address}</p>` : ''}
        <p class="text-lg"><span class="font-bold">Date:</span> ${new Date(intervention.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
        <p class="text-lg"><span class="font-bold">Personnel:</span> ${intervention.personnel || ''}</p>
      </div>
    `;
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow({ maxWidth: 500 });
    }
    const infoWindow = infoWindowRef.current;
    infoWindow.setContent(content);
    infoWindow.setPosition(infoWindowPosition);
    infoWindow.open(mapInstanceRef.current);
    infoWindow.addListener('closeclick', () => {
      setSelectedIntervention(null);
      setInfoWindowPosition(null);
    });
  }, [selectedIntervention, infoWindowPosition]);

  // Update the polygon click handler to include pattern data
  const handlePolygonClick = (feature) => {
    if (!mapInstanceRef.current) return;
    const center = turf.center(feature.geometry);
    const { coordinates } = center.geometry;
    const [lng, lat] = coordinates;
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.panTo({ lat, lng });
      
      // Find the matching barangay in the API data
      const geoName = normalizeBarangayName(feature.properties?.name);
      console.log('[DengueMap DEBUG] Normalized Barangay Name:', geoName);
      
      const apiBarangay = barangaysList.find(b => normalizeBarangayName(b.name) === geoName);
      console.log('[DengueMap DEBUG] Found API Barangay:', apiBarangay);
      console.log('[DengueMap DEBUG] Original Feature:', feature);
      
      // Create a feature object with all necessary properties
      const enhancedFeature = {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          ...feature.properties,
          displayName: feature.properties?.name,
          // Include API data in properties as well for redundancy
          patternType: apiBarangay?.status_and_recommendation?.pattern_based?.status || feature.patternType || 'none',
          status_and_recommendation: apiBarangay?.status_and_recommendation || feature.status_and_recommendation || {},
          risk_level: apiBarangay?.risk_level || feature.risk_level || 'unknown',
          pattern_data: apiBarangay?.pattern_data || feature.pattern_data || {},
          last_analysis_time: apiBarangay?.last_analysis_time
        },
        // Top-level properties for direct access
        patternType: apiBarangay?.status_and_recommendation?.pattern_based?.status || feature.patternType || 'none',
        status_and_recommendation: apiBarangay?.status_and_recommendation || feature.status_and_recommendation || {},
        risk_level: apiBarangay?.risk_level || feature.risk_level || 'unknown',
        pattern_data: apiBarangay?.pattern_data || feature.pattern_data || {},
        apiBarangayName: apiBarangay?.name,
        last_analysis_time: apiBarangay?.last_analysis_time
      };

      // Detailed debug logs
      console.log('[DengueMap DEBUG] Enhanced Feature Properties:', enhancedFeature.properties);
      console.log('[DengueMap DEBUG] Enhanced Feature Top Level:', {
        patternType: enhancedFeature.patternType,
        status_and_recommendation: enhancedFeature.status_and_recommendation,
        risk_level: enhancedFeature.risk_level,
        pattern_data: enhancedFeature.pattern_data,
        apiBarangayName: enhancedFeature.apiBarangayName,
        last_analysis_time: enhancedFeature.last_analysis_time
      });
      
      // Update the state with the enhanced feature
      setSelectedBarangayFeature(enhancedFeature);
      setInfoWindowPosition({ lat, lng });
      if (onBarangaySelect) onBarangaySelect(enhancedFeature);
    }
  };

  // Add effect to handle selected barangay changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedBarangay || !geojsonBarangays.length) return;

    // Find the matching barangay feature
    const matchingFeature = geojsonBarangays.find(feature => 
      normalizeBarangayName(feature.properties.name) === normalizeBarangayName(selectedBarangay)
    );

    if (matchingFeature) {
      // Find the matching barangay in the API data
      const apiBarangay = barangaysList.find(b => 
        normalizeBarangayName(b.name) === normalizeBarangayName(selectedBarangay)
      );

      // Create a feature object with all necessary properties
      const enhancedFeature = {
        type: 'Feature',
        geometry: matchingFeature.geometry,
        properties: {
          ...matchingFeature.properties,
          displayName: matchingFeature.properties?.name,
          patternType: apiBarangay?.status_and_recommendation?.pattern_based?.status || matchingFeature.properties?.patternType || 'none',
          status_and_recommendation: apiBarangay?.status_and_recommendation || matchingFeature.properties?.status_and_recommendation || {},
          risk_level: apiBarangay?.risk_level || matchingFeature.properties?.risk_level || 'unknown',
          pattern_data: apiBarangay?.pattern_data || matchingFeature.properties?.pattern_data || {},
          last_analysis_time: apiBarangay?.last_analysis_time
        },
        patternType: apiBarangay?.status_and_recommendation?.pattern_based?.status || matchingFeature.properties?.patternType || 'none',
        status_and_recommendation: apiBarangay?.status_and_recommendation || matchingFeature.properties?.status_and_recommendation || {},
        risk_level: apiBarangay?.risk_level || matchingFeature.properties?.risk_level || 'unknown',
        pattern_data: apiBarangay?.pattern_data || matchingFeature.properties?.pattern_data || {},
        apiBarangayName: apiBarangay?.name,
        last_analysis_time: apiBarangay?.last_analysis_time
      };

      setSelectedBarangayFeature(enhancedFeature);

      // Center the map on the selected barangay
      const center = turf.center(matchingFeature.geometry);
      const { coordinates } = center.geometry;
      const [lng, lat] = coordinates;
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        mapInstanceRef.current.panTo({ lat, lng });
        mapInstanceRef.current.setZoom(15);
        setInfoWindowPosition({ lat, lng });
      }
    }
  }, [selectedBarangay, geojsonBarangays, barangaysList]);

  // Add effect to handle polygon styling based on selection
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsRef.current.length) return;

    // Reset all polygons to default style
    polygonsRef.current.forEach(polygon => {
      const patternType = polygon.feature?.properties?.patternType || 'none';
      polygon.setOptions({
        strokeColor: getPatternColor(patternType, 'stroke'),
        strokeWeight: 1,
        fillOpacity: 0.5,
        zIndex: 1
      });
    });

    // Highlight selected polygon if exists
    if (selectedBarangayFeature) {
      const selectedPolygon = polygonsRef.current.find(polygon => 
        normalizeBarangayName(polygon.feature?.properties?.name) === normalizeBarangayName(selectedBarangayFeature.properties.name)
      );

      if (selectedPolygon) {
        const patternType = selectedBarangayFeature.properties?.patternType || 'none';
        selectedPolygon.setOptions({
          strokeColor: getPatternColor(patternType, 'stroke'),
          strokeWeight: 4,
          fillOpacity: 0.7,
          zIndex: 2
        });
      }
    }
  }, [selectedBarangayFeature, polygonsRef.current]);

  const getPatternColor = (patternType) => {
    const patternTypeLower = patternType?.toLowerCase();
    if (patternTypeLower === 'spike') return "#ef4444"; // red
    if (patternTypeLower === 'gradual_rise') return "#f97316"; // orange
    if (patternTypeLower === 'stability') return "#3b82f6"; // blue (info)
    if (patternTypeLower === 'decline') return "#22c55e"; // green
    if (patternTypeLower === 'low_level_activity') return "#9ca3af"; // gray
    return "#9ca3af"; // gray
  };

  // Update the pattern levels in the legend
  const patternLevels = [
    { label: "Spike", color: "#ef4444" },
    { label: "Gradual Rise", color: "#f97316" },
    { label: "Stability", color: "#3b82f6" },
    { label: "Decline", color: "#22c55e" },
    { label: "Low Level Activity", color: "#9ca3af" }
  ];

  return (
    <div className="relative w-full h-full">
      {/* Toggle Buttons */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={onToggleBreedingSites}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            showBreedingSites
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MapPinLine size={18} weight="fill" className="text-red-600" />
          {showBreedingSites ? 'Hide Breeding Sites' : 'Show Breeding Sites'}
        </button>
        <button
          onClick={onToggleInterventions}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            showInterventions
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MapPinLine size={18} weight="fill" className="text-blue-600" />
          {showInterventions ? 'Hide Interventions' : 'Show Interventions'}
        </button>
      </div>
      <div ref={mapRef} className="w-full h-full" />
      {showLegends && (
        <div className="absolute bottom-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg">
          <div className="space-y-2">
            {showBreedingSites && (
              <>
                <p className="text-sm font-medium text-gray-600 mb-2">Breeding Site Types</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <img src={stagnantIcon} alt="Stagnant Water" className="w-6 h-6" />
                    <span className="text-sm">Stagnant Water</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={standingIcon} alt="Standing Water" className="w-6 h-6" />
                    <span className="text-sm">Standing Water</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={garbageIcon} alt="Garbage" className="w-6 h-6" />
                    <span className="text-sm">Garbage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={othersIcon} alt="Others" className="w-6 h-6" />
                    <span className="text-sm">Others</span>
                  </div>
                </div>
              </>
            )}
            {showInterventions && (
              <>
                <p className="text-sm font-medium text-gray-600 mb-2">Intervention Types</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <img src={foggingIcon} alt="Fogging" className="w-6 h-6" />
                    <span className="text-sm">Fogging</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={trappingIcon} alt="Ovicidal-Larvicidal Trapping" className="w-6 h-6" />
                    <span className="text-sm">Ovicidal-Larvicidal Trapping</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={cleanUpIcon} alt="Clean-up Drive" className="w-6 h-6" />
                    <span className="text-sm">Clean-up Drive</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <img src={educationIcon} alt="Education Campaign" className="w-6 h-6" />
                    <span className="text-sm">Education Campaign</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DengueMap;
