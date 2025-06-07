import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useGetBarangaysQuery, useGetPostsQuery } from "../../api/dengueApi";
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

// Add darker versions of pattern colors
const PATTERN_COLORS_DARK = {
  spike: "#c53030",      // Darker red
  gradual_rise: "#c05621", // Darker orange
  decline: "#2f855a",    // Darker green
  stability: "#2c5282",  // Darker blue
  none: "#4a5568",      // Darker gray
  default: "#4a5568",   // Darker gray
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
  console.log('[DEBUG] Loading Google Maps script...');
  if (window.google && window.google.maps && window.google.maps.Map) {
    console.log('[DEBUG] Google Maps already loaded');
    return Promise.resolve();
  }
  if (googleMapsScriptLoadingPromise) {
    console.log('[DEBUG] Google Maps script already loading');
    return googleMapsScriptLoadingPromise;
  }
  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    if (document.getElementById('google-maps-script')) {
      console.log('[DEBUG] Google Maps script tag exists, waiting for load...');
      const check = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('[DEBUG] Google Maps loaded from existing script');
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }
    console.log('[DEBUG] Creating new Google Maps script tag');
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=beta`;
    script.onload = () => {
      console.log('[DEBUG] Google Maps script loaded successfully');
      const checkMarkerLibrary = () => {
        if (window.google?.maps?.marker) {
          console.log('[DEBUG] Marker library is available');
          resolve();
        } else {
          console.log('[DEBUG] Waiting for marker library...');
          setTimeout(checkMarkerLibrary, 50);
        }
      };
      checkMarkerLibrary();
    };
    script.onerror = (err) => {
      console.error('[DEBUG] Error loading Google Maps script:', err);
      reject(err);
    };
    document.body.appendChild(script);
  });
  return googleMapsScriptLoadingPromise;
}

const MapOnly = forwardRef(({
  showBreedingSites = true,
  showInterventions = false,
  style = {},
  className = "",
  selectedBarangay = null,
  onBarangaySelect = null,
  interventions = [],
  onMarkerClick = null,
}, ref) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const overlaysRef = useRef([]);
  const isMountedRef = useRef(true);
  const infoWindowRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barangayData, setBarangayData] = useState(null);
  const [breedingSites, setBreedingSites] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { data: barangaysList } = useGetBarangaysQuery();
  const { data: posts } = useGetPostsQuery();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  console.log('[DEBUG] Google Maps API Key:', apiKey);
  console.log('[DEBUG] Google Maps Map ID:', mapId);
  const [infoWindow, setInfoWindow] = useState(null);

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
        console.log('[DEBUG] Fetching barangay data...');
        const barangayResponse = await fetch("/quezon_barangays_boundaries.geojson");
        if (!barangayResponse.ok) throw new Error('Failed to load barangay data');
        const barangayGeoJson = await barangayResponse.json();
        if (isMountedRef.current) {
          console.log('[DEBUG] Barangay data loaded successfully');
          setBarangayData(barangayGeoJson);
        }
        if (posts) {
          console.log('[DEBUG] Processing posts data:', posts);
          const validPosts = Array.isArray(posts?.posts) ? posts.posts : (Array.isArray(posts) ? posts : []);
          console.log('[DEBUG] Valid posts array:', validPosts);
          const validatedSites = validPosts.filter(post => {
            const isValid = post.status === "Validated" && 
                           post.specific_location && 
                           Array.isArray(post.specific_location.coordinates) && 
                           post.specific_location.coordinates.length === 2;
            if (!isValid) {
              console.log('[DEBUG] Invalid post:', {
                id: post._id,
                status: post.status,
                hasLocation: !!post.specific_location,
                coordinates: post.specific_location?.coordinates
              });
            }
            return isValid;
          });
          console.log('[DEBUG] Validated breeding sites:', validatedSites);
          if (isMountedRef.current) {
            setBreedingSites(validatedSites);
          }
        } else {
          console.log('[DEBUG] No posts data available');
          if (isMountedRef.current) {
            setBreedingSites([]);
          }
        }
      } catch (err) {
        console.error('[DEBUG] Error fetching data:', err);
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

  useImperativeHandle(ref, () => ({
    panTo: (position) => {
      if (mapInstance.current) {
        mapInstance.current.panTo(position);
      }
    },
    setZoom: (zoom) => {
      if (mapInstance.current) {
        mapInstance.current.setZoom(zoom);
      }
    },
    showInfoWindow: (content, position) => {
      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow({
          maxWidth: 500,
        });
      }
      infoWindowRef.current.setContent(content);
      infoWindowRef.current.setPosition(position);
      infoWindowRef.current.open(mapInstance.current);
    }
  }), []);

  useEffect(() => {
    if (loading || error || !barangayData || !isMountedRef.current) {
      return;
    }
    let map, overlays = [];
    setMapLoaded(false);
    console.log('[DEBUG] Starting map initialization...');
    console.log('[DEBUG] Current props:', {
      showBreedingSites,
      showInterventions,
      breedingSitesCount: breedingSites.length,
      interventionsCount: interventions.length
    });
    loadGoogleMapsScript(apiKey).then(() => {
      if (!isMountedRef.current) return;
      console.log('[DEBUG] Google Maps script loaded, initializing map...');
      console.log('[DEBUG] Marker library available:', !!window.google?.maps?.marker);
      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];
      if (!mapInstance.current) {
        try {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: QC_CENTER,
            zoom: 12,
            mapId: mapId,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          console.log('[DEBUG] Map instance created successfully');
          window.google.maps.event.addListenerOnce(mapInstance.current, 'tilesloaded', () => {
            setMapLoaded(true);
          });
        } catch (error) {
          console.error('[DEBUG] Error creating map instance:', error);
          setError('Failed to initialize map');
          return;
        }
      } else {
        window.google.maps.event.addListenerOnce(mapInstance.current, 'tilesloaded', () => {
          setMapLoaded(true);
        });
      }
      map = mapInstance.current;
      barangayData.features.forEach((feature) => {
        const geometry = feature.geometry;
        const coordsArray = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
        let barangayObj = barangaysList?.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(feature.properties.name));
        let patternType = (barangayObj?.status_and_recommendation?.pattern_based?.status || feature.properties.patternType || feature.properties.pattern_type || 'none').toLowerCase();
        if (!patternType || patternType === '') patternType = 'none';
        const patternColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
        const patternColorDark = PATTERN_COLORS_DARK[patternType] || PATTERN_COLORS_DARK.default;
        const selectedDisplayName = selectedBarangay?.properties?.displayName || selectedBarangay?.properties?.name;
        const featureDisplayName = feature.properties?.displayName || feature.properties?.name;
        const isSelected = selectedBarangay && normalizeBarangayName(featureDisplayName) === normalizeBarangayName(selectedDisplayName);
        coordsArray.forEach((polygonCoords) => {
          const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
          const polygon = new window.google.maps.Polygon({
            paths: path,
            strokeColor: isSelected ? patternColorDark : patternColor,
            strokeOpacity: isSelected ? 1 : 0.7,
            strokeWeight: isSelected ? 6 : 1,
            fillOpacity: 0.5,
            fillColor: patternColor,
            map,
            zIndex: isSelected ? 10 : 1,
          });
          polygon.addListener('click', () => {
            if (onBarangaySelect) {
              const selectedFeature = {
                ...feature,
                properties: {
                  ...feature.properties,
                  displayName: feature.properties.name,
                  patternType,
                  color: patternColor,
                  status_and_recommendation: barangayObj?.status_and_recommendation,
                  risk_level: barangayObj?.risk_level,
                  pattern_data: barangayObj?.pattern_data
                }
              };
              console.log('Barangay selected:', selectedFeature);
              onBarangaySelect(selectedFeature);
            }
          });
          overlays.push(polygon);
        });
      });
      let breedingMarkers = [];
      if (showBreedingSites && breedingSites.length > 0 && window.google.maps.marker) {
        console.log('[DEBUG] Creating breeding site markers...');
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

          const position = {
            lat: parseFloat(site.latitude || site.specific_location?.coordinates[1]),
            lng: parseFloat(site.longitude || site.specific_location?.coordinates[0]),
          };

          console.log('[DEBUG] Creating marker at position:', position);

          const marker = new AdvancedMarkerElement({
            map,
            position,
            content: pin.element,
            title: site.report_type || 'Breeding Site',
          });

          marker.addListener('click', () => {
            console.log('[DEBUG] Marker clicked:', {
              type: 'report',
              site: site,
              position: position
            });
            
            // Close existing info window if open
            if (infoWindowRef.current) {
              console.log('[DEBUG] Closing existing info window');
              infoWindowRef.current.close();
            }

            // Create new info window
            infoWindowRef.current = new window.google.maps.InfoWindow({
              maxWidth: 500,
            });

            // Pan to marker position and zoom in
            if (mapInstance.current) {
              console.log('[DEBUG] Panning to marker position');
              mapInstance.current.panTo(position);
              mapInstance.current.setZoom(17);
            }

            // Use a div with Tailwind classes for InfoWindow content
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

            infoWindowRef.current.setContent(content);
            infoWindowRef.current.setPosition(position);
            infoWindowRef.current.open(mapInstance.current);
          });

          return marker;
        });
      }

      let interventionMarkers = [];
      if (showInterventions && interventions.length > 0 && window.google.maps.marker) {
        console.log('[DEBUG] Creating intervention markers...');
        const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
        interventionMarkers = interventions.map((intervention) => {
          const iconUrl = INTERVENTION_TYPE_ICONS[intervention.intervention_type] || INTERVENTION_TYPE_ICONS.default;
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
            background: "#4CAF50",
            borderColor: "#4CAF50",
            scale: 1.5,
          });

          const position = {
            lat: parseFloat(intervention.latitude || intervention.specific_location?.coordinates[1]),
            lng: parseFloat(intervention.longitude || intervention.specific_location?.coordinates[0]),
          };

          console.log('[DEBUG] Creating intervention marker at position:', position);

          const marker = new AdvancedMarkerElement({
            map,
            position,
            content: pin.element,
            title: intervention.intervention_type || 'Intervention',
          });

          marker.addListener('click', () => {
            console.log('[DEBUG] Intervention marker clicked:', {
              type: 'intervention',
              intervention: intervention,
              position: position
            });
            
            // Close existing info window if open
            if (infoWindowRef.current) {
              console.log('[DEBUG] Closing existing info window');
              infoWindowRef.current.close();
            }

            // Create new info window
            infoWindowRef.current = new window.google.maps.InfoWindow({
              maxWidth: 500,
            });

            // Pan to marker position and zoom in
            if (mapInstance.current) {
              console.log('[DEBUG] Panning to marker position');
              mapInstance.current.panTo(position);
              mapInstance.current.setZoom(17);
            }

            // Use a div with Tailwind classes for InfoWindow content
            const content = document.createElement('div');
            content.innerHTML = `
              <div class="bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]">
                <p class="font-bold text-4xl font-extrabold mb-4 text-primary">
                  ${intervention.intervention_type || 'Intervention'}
                </p>
                <div class="flex flex-col items-center mt-2 space-y-1 font-normal text-center">
                  <p class="text-xl">
                    <span class="font-bold">Barangay:</span> ${intervention.barangay || ''}
                  </p>
                  <p class="text-xl">
                    <span class="font-bold">Conducted by:</span> ${intervention.user?.username || ''}
                  </p>
                  <p class="text-xl">
                    <span class="font-bold">Date:</span> ${intervention.date_and_time ? new Date(intervention.date_and_time).toLocaleDateString() : ''}
                  </p>
                  <p class="text-xl">
                    <span class="font-bold">Description:</span> ${intervention.description || ''}
                  </p>
                  ${(intervention.images && intervention.images.length > 0) ? `<div class='mt-2 flex justify-center gap-2'>${intervention.images.map(img => `<img src='${img}' class='w-35 h-25 object-cover rounded border'/>`).join('')}</div>` : ''}
                </div>
                <button class="mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold" onclick="window.location.href='/mapping/${intervention._id}'">View Details</button>
              </div>
            `;

            infoWindowRef.current.setContent(content);
            infoWindowRef.current.setPosition(position);
            infoWindowRef.current.open(mapInstance.current);
          });

          return marker;
        });
      }

      overlaysRef.current = [...overlays, ...breedingMarkers, ...interventionMarkers];
      setMapLoaded(true);
    }).catch((error) => {
      console.error('[DEBUG] Error loading Google Maps:', error);
      setError('Failed to load Google Maps');
    });

    return () => {
      if (overlaysRef.current) {
        overlaysRef.current.forEach(o => o.setMap(null));
        overlaysRef.current = [];
      }
    };
  }, [loading, error, barangayData, showBreedingSites, showInterventions, breedingSites, interventions, selectedBarangay, onBarangaySelect]);

  // Add this effect to initialize the info window
  useEffect(() => {
    if (window.google && window.google.maps) {
      const newInfoWindow = new window.google.maps.InfoWindow({
        maxWidth: 500,
      });
      setInfoWindow(newInfoWindow);
    }
  }, []);

  // Add back the effect for updating overlays
  useEffect(() => {
    if (!mapInstance.current || !barangayData || !isMountedRef.current) return;
    
    const map = mapInstance.current;
    let overlays = [];
    
    // Clear existing overlays
    overlaysRef.current.forEach(o => o.setMap(null));
    overlaysRef.current = [];

    // Draw barangay polygons
    barangayData.features.forEach((feature) => {
      const geometry = feature.geometry;
      const coordsArray = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
      let barangayObj = barangaysList?.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(feature.properties.name));
      let patternType = (barangayObj?.status_and_recommendation?.pattern_based?.status || feature.properties.patternType || feature.properties.pattern_type || 'none').toLowerCase();
      if (!patternType || patternType === '') patternType = 'none';
      const patternColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
      const patternColorDark = PATTERN_COLORS_DARK[patternType] || PATTERN_COLORS_DARK.default;
      const selectedDisplayName = selectedBarangay?.properties?.displayName || selectedBarangay?.properties?.name;
      const featureDisplayName = feature.properties?.displayName || feature.properties?.name;
      const isSelected = selectedBarangay && normalizeBarangayName(featureDisplayName) === normalizeBarangayName(selectedDisplayName);
      
      coordsArray.forEach((polygonCoords) => {
        const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
        const polygon = new window.google.maps.Polygon({
          paths: path,
          strokeColor: isSelected ? patternColorDark : patternColor,
          strokeOpacity: isSelected ? 1 : 0.7,
          strokeWeight: isSelected ? 6 : 1,
          fillOpacity: 0.5,
          fillColor: patternColor,
          map,
          zIndex: isSelected ? 10 : 1,
        });
        polygon.addListener('click', () => {
          if (onBarangaySelect) {
            const selectedFeature = {
              ...feature,
              properties: {
                ...feature.properties,
                displayName: feature.properties.name,
                patternType,
                color: patternColor,
                status_and_recommendation: barangayObj?.status_and_recommendation,
                risk_level: barangayObj?.risk_level,
                pattern_data: barangayObj?.pattern_data
              }
            };
            onBarangaySelect(selectedFeature);
          }
        });
        overlays.push(polygon);
      });
    });

    // Add breeding site markers
    if (showBreedingSites && breedingSites.length > 0 && window.google.maps.marker) {
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
      breedingSites.forEach((site) => {
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
        marker.addListener('click', () => {
          console.log('[DEBUG] Marker clicked:', {
            type: 'report',
            site: site,
            coordinates: site.specific_location.coordinates
          });
          
          // Close existing info window if open
          if (infoWindow) {
            console.log('[DEBUG] Closing existing info window');
            infoWindow.close();
          }

          // Pan to marker position and zoom in
          if (mapInstance.current) {
            console.log('[DEBUG] Panning to marker position');
            mapInstance.current.panTo({
              lat: site.specific_location.coordinates[1],
              lng: site.specific_location.coordinates[0],
            });
            mapInstance.current.setZoom(17);
          }

          // Use a div with Tailwind classes for InfoWindow content
          const content = document.createElement('div');
          content.innerHTML = `
            <div class=\"bg-white p-4 rounded-lg text-primary text-center max-w-120 w-[50vw]\">
              <p class=\"font-bold text-4xl font-extrabold mb-4 text-primary\">
                ${site.report_type || 'Breeding Site'}
              </p>
              <div class=\"flex flex-col items-center mt-2 space-y-1 font-normal text-center\">
                <p class=\"text-xl\">
                  <span class=\"font-bold\">Barangay:</span> ${site.barangay || ''}
                </p>
                <p class=\"text-xl\">
                  <span class=\"font-bold\">Reported by:</span> ${site.user?.username || ''}
                </p>
                <p class=\"text-xl\">
                  <span class=\"font-bold\">Date:</span> ${site.date_and_time ? new Date(site.date_and_time).toLocaleDateString() : ''}
                </p>
                <p class=\"text-xl\">
                  <span class=\"font-bold\">Description:</span> ${site.description || ''}
                </p>
                ${(site.images && site.images.length > 0) ? `<div class='mt-2 flex justify-center gap-2'>${site.images.map(img => `<img src='${img}' class='w-35 h-25 object-cover rounded border'/>`).join('')}</div>` : ''}
              </div>
              <button class=\"mt-4 px-4 py-2 bg-primary w-[40%] text-white rounded-lg shadow hover:bg-primary/80 hover:cursor-pointer font-bold\" onclick=\"window.location.href='/mapping/${site._id}'\">View Details</button>
            </div>
          `;
          console.log('[DEBUG] Created info window content');

          console.log('[DEBUG] Setting info window content and position');
          infoWindow.setContent(content);
          infoWindow.setPosition({
            lat: site.specific_location.coordinates[1],
            lng: site.specific_location.coordinates[0],
          });

          console.log('[DEBUG] Opening info window');
          infoWindow.open(map, marker);
        });
        overlays.push(marker);
      });
    }

    // Add intervention markers
    if (showInterventions && interventions.length > 0 && window.google.maps.marker) {
      const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
      interventions.forEach((intervention) => {
        const iconUrl = INTERVENTION_TYPE_ICONS[intervention.intervention_type] || INTERVENTION_TYPE_ICONS.default;
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
          title: intervention.intervention_type || 'Intervention',
        });
        marker.addListener('click', () => {
          console.log('[DEBUG] Intervention marker clicked:', {
            type: 'intervention',
            intervention: intervention,
            coordinates: intervention.specific_location.coordinates
          });

          // Close existing info window if open
          if (infoWindow) {
            console.log('[DEBUG] Closing existing info window');
            infoWindow.close();
          }

          // Pan to marker position and zoom in
          if (mapInstance.current) {
            console.log('[DEBUG] Panning to marker position');
            mapInstance.current.panTo({
              lat: intervention.specific_location.coordinates[1],
              lng: intervention.specific_location.coordinates[0],
            });
            mapInstance.current.setZoom(17);
          }

          // Use a div with Tailwind classes for InfoWindow content
          const content = document.createElement('div');
          content.innerHTML = `
            <div class="p-3 flex flex-col items-center gap-1 font-normal bg-white text-center rounded-md shadow-md text-primary">
              <p class="text-4xl font-extrabold text-primary mb-2">${intervention.intervention_type || 'Intervention'}</p>
              <div class="text-lg flex items-center gap-2">
                <span class="font-bold">Barangay:</span>
                <span class="px-3 py-1 rounded-full text-white font-bold text-sm" style="background-color:#FF6347;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                  ${intervention.barangay || ''}
                </span>
              </div>
              <p class="text-lg text-center"><span class="font-bold">Conducted by:</span> ${intervention.user?.username || ''}</p>
              ${intervention.address ? `<p class="text-lg text-center"><span class="font-bold text-center">Address:</span> ${intervention.address}</p>` : ''}
              <p class="text-lg"><span class="font-bold">Date:</span> ${intervention.date ? new Date(intervention.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}</p>
              <p class="text-lg"><span class="font-bold">Description:</span> ${intervention.description || ''}</p>
            </div>
          `;
          console.log('[DEBUG] Created info window content');

          console.log('[DEBUG] Setting info window content and position');
          infoWindow.setContent(content);
          infoWindow.setPosition({
            lat: intervention.specific_location.coordinates[1],
            lng: intervention.specific_location.coordinates[0],
          });

          console.log('[DEBUG] Opening info window');
          infoWindow.open(map, marker);
        });
        overlays.push(marker);
      });
    }

    overlaysRef.current = overlays;
  }, [barangayData, showBreedingSites, breedingSites, showInterventions, interventions, selectedBarangay, onBarangaySelect, barangaysList, infoWindow]);

  if (loading) return <LoadingSpinner size={32} className="h-full" message="Loading map..." />;
  if (error) return <ErrorMessage error={error} className="m-4" />;

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 300, ...style }}>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        id="map-only"
      />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <LoadingSpinner size={40} message="Loading map..." />
        </div>
      )}
      {error && <ErrorMessage error={error} className="absolute top-2 left-2 z-20" />}
    </div>
  );
});

export default MapOnly; 