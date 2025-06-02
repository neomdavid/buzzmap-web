import React, { useEffect, useRef, useState } from "react";
import { useGetPatternRecognitionResultsQuery, useGetBarangaysQuery, useGetPostsQuery, useGetAllInterventionsQuery } from "../../api/dengueApi";
import * as turf from "@turf/turf";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { toastWarn } from "../../utils.jsx";
import { CaretLeft, CaretRight, MapPin } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import cleanUpIcon from "../../assets/icons/cleanup.svg";
import foggingIcon from "../../assets/icons/fogging.svg";
import educationIcon from "../../assets/icons/education.svg";
import trappingIcon from "../../assets/icons/trapping.svg";

import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import standingIcon from '../../assets/icons/standing_water.svg';
import garbageIcon from '../../assets/icons/garbage.svg';
import othersIcon from '../../assets/icons/others.svg';

// Color constants (move to top for global scope)
const REPORT_STATUS_COLORS = {
  low: "border-success bg-success/5",
  medium: "border-warning bg-warning/5",
  high: "border-error bg-error/5",
  unknown: "border-gray-400 bg-gray-100"
};

const PATTERN_COLORS = {
  spike: "#e53e3e",        // red (error)
  gradual_rise: "#dd6b20", // orange (warning)
  decline: "#38a169",      // green (success)
  stability: "#3182ce",    // blue (info)
  none: "#718096",         // gray (default for no pattern)
  default: "#718096",      // gray (fallback)
};

// Intervention status color mapping
const INTERVENTION_STATUS_COLORS = {
  scheduled: "#8b5cf6", // Purple-500
  ongoing: "#f59e0b",   // Amber-500
  default: "#6b7280",  // Gray-500 (for other statuses like 'pending' or if status is missing)
  // Add 'completed' if you ever decide to show them, though current logic filters them out
  // completed: "#10b981", // Emerald-500 
};

// Intervention type icon mapping
const INTERVENTION_TYPE_ICONS = {
  "Fogging": foggingIcon,
  "Ovicidal-Larvicidal Trapping": trappingIcon,
  "Clean-up Drive": cleanUpIcon,
  "Education Campaign": educationIcon,
  "default": foggingIcon // fallback icon
};

// Breeding site type icon mapping
const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": stagnantIcon,
  "Standing Water": standingIcon,
  "Garbage": garbageIcon,
  "Others": othersIcon,
  "default": stagnantIcon // fallback
};

// Helper function to normalize barangay names for comparison
function normalizeBarangayName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\bsr\.?\b/g, '') // Remove sr. or sr
    .replace(/\bjr\.?\b/g, '') // Remove jr. or jr
    // Add more replacements if needed, e.g., for Roman numerals or other common variations
    .replace(/[.\-']/g, '')    // Remove periods, hyphens, apostrophes
    .replace(/\s+/g, ' ')      // Normalize multiple spaces to single space
    .trim();
}

// Helper function to pan to a position with offset
function panToWithOffset(map, position, offsetY = 0.15) {
  if (!map || !position) return;
  const bounds = map.getBounds && map.getBounds();
    if (!bounds) {
      map.panTo(position);
      return;
    }
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const latSpan = ne.lat() - sw.lat();
    const newLat = position.lat + latSpan * offsetY;
    map.panTo({ lat: newLat, lng: position.lng });
}

const QC_CENTER = { lat: 14.676, lng: 121.0437 };

// Utility to load Google Maps JS API ONCE
let googleMapsScriptLoadingPromise = null;
function loadGoogleMapsScript(apiKey) {
  console.log('loadGoogleMapsScript called with API key:', apiKey ? 'Present' : 'Missing');
  
  if (window.google && window.google.maps && window.google.maps.Map) {
    console.log('Google Maps already loaded');
    return Promise.resolve();
  }
  
  if (googleMapsScriptLoadingPromise) {
    console.log('Google Maps script already loading');
    return googleMapsScriptLoadingPromise;
  }
  
  console.log('Creating new script element for Google Maps');
  googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
    if (document.getElementById('google-maps-script')) {
      console.log('Script element already exists, waiting for load...');
      const check = () => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          console.log('Google Maps loaded from existing script');
          resolve();
            } else {
          console.log('Waiting for Google Maps to load...');
          setTimeout(check, 50);
        }
      };
      check();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.onload = () => {
      console.log('Google Maps script loaded successfully');
      resolve();
    };
    script.onerror = (err) => {
      console.error('Error loading Google Maps script:', err);
      reject(err);
    };
    console.log('Appending Google Maps script to document');
    document.body.appendChild(script);
  });
  
  return googleMapsScriptLoadingPromise;
}

const Mapping = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [barangayData, setBarangayData] = useState(null);
  const [breedingSites, setBreedingSites] = useState([]);
  const [showBreedingSites, setShowBreedingSites] = useState(true);
  const [showInterventions, setShowInterventions] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [interventions, setInterventions] = useState([]);
  // Store marker and polygon references for cleanup
  const overlaysRef = useRef([]);
  const isMountedRef = useRef(true);
  const [selectedBreedingSite, setSelectedBreedingSite] = useState(null);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  // Add refs for InfoWindows
  const infoWindowRef = useRef(null);
  const markerClusterRef = useRef(null);
  const [selectedBarangayFeature, setSelectedBarangayFeature] = useState(null);
  const [selectedBarangayCenter, setSelectedBarangayCenter] = useState(null);

  // Fetch data
  const { data: barangaysList } = useGetBarangaysQuery();
  const { data: posts } = useGetPostsQuery();
  const { data: allInterventionsData } = useGetAllInterventionsQuery ? useGetAllInterventionsQuery() : { data: [] };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

  console.log('=== Map Debug Info ===');
  console.log('API Key:', apiKey ? 'Present' : 'Missing');
  console.log('Map ID:', mapId || 'Not set');
  console.log('Map Ref:', mapRef.current ? 'Initialized' : 'Not initialized');
  console.log('Map Instance:', mapInstance.current ? 'Created' : 'Not created');
  console.log('Loading:', loading);
  console.log('Error:', error);
  console.log('Barangay Data:', barangayData ? 'Loaded' : 'Not loaded');
  console.log('Breeding Sites:', breedingSites.length);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Mapping component unmounting...');
      isMountedRef.current = false;
      if (mapInstance.current) {
        console.log('Cleaning up map instance...');
        overlaysRef.current.forEach(o => o.setMap(null));
        overlaysRef.current = [];
        mapInstance.current = null;
      }
    };
  }, []);

  // Fetch and process geojson and posts
  useEffect(() => {
    const fetchData = async () => {
      if (!isMountedRef.current) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching barangay data...');
        // Fetch barangay geojson
        const barangayResponse = await fetch("/quezon_barangays_boundaries.geojson");
        if (!barangayResponse.ok) throw new Error('Failed to load barangay data');
        const barangayGeoJson = await barangayResponse.json();
        console.log('Barangay data loaded:', barangayGeoJson.features?.length || 0, 'features');
        if (isMountedRef.current) {
          setBarangayData(barangayGeoJson);
        }
        // Process breeding sites
        if (posts) {
          const validPosts = Array.isArray(posts) ? posts : posts.posts || [];
          const validatedSites = validPosts.filter(post => post.status === "Validated" && post.specific_location && Array.isArray(post.specific_location.coordinates) && post.specific_location.coordinates.length === 2);
          console.log('Valid breeding sites found:', validatedSites.length);
          if (isMountedRef.current) {
          setBreedingSites(validatedSites);
          }
        } else {
          console.log('No posts data available');
          if (isMountedRef.current) {
          setBreedingSites([]);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
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

  // Fetch interventions (dummy fetch, replace with your API if needed)
  useEffect(() => {
    if (allInterventionsData) {
      setInterventions(
        allInterventionsData.filter(i => i.specific_location && Array.isArray(i.specific_location.coordinates) && i.specific_location.coordinates.length === 2)
      );
    }
  }, [allInterventionsData]);

  // Initialize map and draw polygons/markers after script is loaded
  useEffect(() => {
    if (loading || error || !barangayData || !isMountedRef.current) {
      console.log('Skipping map initialization:', { 
        loading, 
        error: error?.message, 
        hasBarangayData: !!barangayData,
        isMounted: isMountedRef.current 
      });
      return;
    }

    console.log('Starting map initialization...');
    let map, overlays = [];
    loadGoogleMapsScript(apiKey).then(() => {
      if (!isMountedRef.current) return;
      
      console.log('Google Maps script loaded');
      // Clean up previous overlays
      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];
      
      // Only create map if not already created
      if (!mapInstance.current) {
        console.log('Creating new map instance...');
        try {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: QC_CENTER,
            zoom: 13,
            mapId: mapId || undefined,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          console.log('Map instance created successfully');
        } catch (err) {
          console.error('Error creating map instance:', err);
          if (isMountedRef.current) {
            setError('Failed to initialize map');
          }
          return;
        }
      }
      
      map = mapInstance.current;
      console.log('Drawing barangay polygons...');
      // --- InfoWindow instance (only one open at a time) ---
      if (!infoWindowRef.current) {
        infoWindowRef.current = new window.google.maps.InfoWindow({
          maxWidth: 500,
        });
      }
      const infoWindow = infoWindowRef.current;
      infoWindow.close();

      // --- Draw barangay polygons ---
      barangayData.features.forEach((feature) => {
        const geometry = feature.geometry;
        const coordsArray = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
        // Find matching barangay in barangaysList
        let barangayObj = barangaysList?.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(feature.properties.name));
        let patternType = (barangayObj?.status_and_recommendation?.pattern_based?.status || feature.properties.patternType || feature.properties.pattern_type || 'none').toLowerCase();
            if (!patternType || patternType === '') patternType = 'none';
            const patternColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
        coordsArray.forEach((polygonCoords) => {
          const path = polygonCoords[0].map(([lng, lat]) => ({ lat, lng }));
          // Highlight if selected
          const isSelected = selectedBarangayFeature && normalizeBarangayName(selectedBarangayFeature.properties.name) === normalizeBarangayName(feature.properties.name);
          const polygon = new window.google.maps.Polygon({
            paths: path,
            strokeColor: isSelected ? patternColor : '#333',
                    strokeOpacity: isSelected ? 1 : 0.6,
            strokeWeight: isSelected ? 4 : 1,
                    fillOpacity: 0.5,
                    fillColor: patternColor,
            map,
            zIndex: isSelected ? 2 : 1,
          });
          polygon.addListener('click', (e) => {
            // Center of polygon
                    const center = turf.center(feature.geometry);
            const [lng, lat] = center.geometry.coordinates;
            if (mapInstance.current) {
              mapInstance.current.panTo({ lat, lng });
              mapInstance.current.setZoom(15);
            }
            // Hide control panel on md screens and lower
            if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
                      setShowControlPanel(false);
                    }
            setSelectedBarangayFeature(feature); // highlight
            let barangayObj = barangaysList?.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(feature.properties.name));
            let patternBased = barangayObj?.status_and_recommendation?.pattern_based;
              let patternType = (patternBased?.status || feature.properties.patternType || "none").toLowerCase();
              if (!patternType || patternType === "") patternType = "none";
              const patternCardColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
            let reportBased = barangayObj?.status_and_recommendation?.report_based;
            let reportAlert = reportBased?.alert;
            let reportStatus = (reportBased?.status || "unknown").toLowerCase();
            let reportCardColor = REPORT_STATUS_COLORS[reportStatus] || REPORT_STATUS_COLORS.unknown;
            // Use a div with Tailwind classes for InfoWindow content
            const content = document.createElement('div');
            content.innerHTML = `
              <div class="bg-white p-4 rounded-lg text-center h-auto">
                <p class="text-4xl font-[900]" style="color:${patternCardColor}">Barangay ${feature.properties.displayName || feature.properties.name || 'Unknown Barangay'}</p>
                <div class="mt-3 flex flex-col gap-3 text-black">
                  <div class="p-3 rounded-lg border-2" style="border-color:${patternCardColor}">
                        <div>
                      <p class="text-sm font-medium text-gray-600 uppercase">Pattern</p>
                      <p class="text-lg font-semibold">
                        ${patternType === 'none'
                              ? 'No pattern detected'
                              : patternType.charAt(0).toUpperCase() + patternType.slice(1).replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                  <div class="p-3 rounded-lg border-2 ${reportCardColor}">
                        <div>
                      <p class="text-sm font-medium text-gray-600 uppercase">Breeding Site Reports</p>
                      <p class="text-lg font-semibold">
                        ${(reportAlert && reportAlert.toLowerCase() !== "none")
                              ? reportAlert
                              : "No breeding site reported in this barangay."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
            `;
            infoWindow.setContent(content);
            infoWindow.setPosition({ lat, lng });
            infoWindow.open(map);
            // Remove highlight and InfoWindow when closed
            infoWindow.addListener('closeclick', () => {
              setSelectedBarangayFeature(null);
            });
          });
          overlays.push(polygon);
        });
      });

      // --- Draw breeding site markers with clustering ---
      let breedingMarkers = [];
      if (showBreedingSites && breedingSites.length > 0 && window.google.maps.marker) {
        const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
        breedingMarkers = breedingSites.map((site) => {
          // Use the correct SVG icon for the breeding site type
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
            // Pan to marker position and zoom in
            if (mapInstance.current) {
              mapInstance.current.panTo({
                lat: site.specific_location.coordinates[1],
                lng: site.specific_location.coordinates[0],
              });
              mapInstance.current.setZoom(17);
            }
            // Hide control panel on md screens and lower
            if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
              setShowControlPanel(false);
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
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });
          return marker;
        });
        // Cluster the markers
        if (window.markerClusterer && window.markerClusterer.MarkerClusterer) {
          if (markerClusterRef.current) markerClusterRef.current.setMap(null);
          markerClusterRef.current = new window.markerClusterer.MarkerClusterer({ markers: breedingMarkers, map });
        } else {
          // fallback: just show markers
          breedingMarkers.forEach(m => m.setMap(map));
        }
        overlays.push(...breedingMarkers);
      }

      // --- Draw intervention markers ---
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
            background: "#1893F8", // intervention marker background is white
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
            // Pan to marker position and zoom in
            if (mapInstance.current) {
              mapInstance.current.panTo({
                lat: intervention.specific_location.coordinates[1],
                lng: intervention.specific_location.coordinates[0],
              });
              mapInstance.current.setZoom(17);
            }
            // Hide control panel on md screens and lower
            if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
                        setShowControlPanel(false);
                      }
            // Use a div with Tailwind classes for InfoWindow content
            const content = document.createElement('div');
            content.innerHTML = `
              <div class="p-3 flex flex-col items-center gap-1 font-normal bg-white text-center rounded-md shadow-md text-primary">
                <p class="text-4xl font-extrabold text-primary mb-2">${intervention.interventionType || 'Intervention'}</p>
                <div class="text-lg flex items-center gap-2">
                  <span class="font-bold">Status:</span>
                  <span class="px-3 py-1 rounded-full text-white font-bold text-sm" style="background-color:#FF6347;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                    ${intervention.status || ''}
                  </span>
                </div>
                <p class="text-lg text-center"><span class="font-bold">Barangay:</span> ${intervention.barangay || ''}</p>
                ${intervention.address ? `<p class="text-lg text-center"><span class="font-bold text-center">Address:</span> ${intervention.address}</p>` : ''}
                <p class="text-lg"><span class="font-bold">Date:</span> ${intervention.date ? new Date(intervention.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}</p>
                <p class="text-lg"><span class="font-bold">Personnel:</span> ${intervention.personnel || ''}</p>
              </div>
            `;
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });
          overlays.push(marker);
        });
      }
      overlaysRef.current = overlays;
    }).catch(err => {
      console.error('Error loading Google Maps script:', err);
      if (isMountedRef.current) {
        setError('Failed to load Google Maps');
      }
    });

    // Cleanup overlays on unmount or data change
    return () => {
      console.log('Cleaning up map overlays...');
      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [loading, error, barangayData, breedingSites, showBreedingSites, showInterventions, interventions, apiKey, mapId, selectedBarangayFeature]);

  // Show InfoWindow when selectedBarangayFeature changes
  useEffect(() => {
    if (!selectedBarangayFeature || !barangaysList || !window.google || !window.google.maps || !mapInstance.current) return;
    // Delay opening InfoWindow until overlays are redrawn
    setTimeout(() => {
      const feature = selectedBarangayFeature;
      const center = turf.center(feature.geometry);
      const [lng, lat] = center.geometry.coordinates;
      let barangayObj = barangaysList.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(feature.properties.name));
      let patternBased = barangayObj?.status_and_recommendation?.pattern_based;
              let patternType = (patternBased?.status || feature.properties.patternType || "none").toLowerCase();
              if (!patternType || patternType === "") patternType = "none";
              const patternCardColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
      let reportBased = barangayObj?.status_and_recommendation?.report_based;
      let reportAlert = reportBased?.alert;
      let reportStatus = (reportBased?.status || "unknown").toLowerCase();
      let reportCardColor = REPORT_STATUS_COLORS[reportStatus] || REPORT_STATUS_COLORS.unknown;
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="bg-white p-4 rounded-lg text-center h-auto">
          <p class="text-4xl font-[900]" style="color:${patternCardColor}">Barangay ${feature.properties.displayName || feature.properties.name || 'Unknown Barangay'}</p>
          <div class="mt-3 flex flex-col gap-3 text-black">
            <div class="p-3 rounded-lg border-2" style="border-color:${patternCardColor}">
                        <div>
                <p class="text-sm font-medium text-gray-600 uppercase">Pattern</p>
                <p class="text-lg font-semibold">
                  ${patternType === 'none'
                              ? 'No pattern detected'
                              : patternType.charAt(0).toUpperCase() + patternType.slice(1).replace('_', ' ')}
                          </p>
                        </div>
                      </div>
            <div class="p-3 rounded-lg border-2 ${reportCardColor}">
                        <div>
                <p class="text-sm font-medium text-gray-600 uppercase">Breeding Site Reports</p>
                <p class="text-lg font-semibold">
                  ${(reportAlert && reportAlert.toLowerCase() !== "none")
                              ? reportAlert
                              : "No breeding site reported in this barangay."}
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
      infoWindow.setPosition({ lat, lng });
      infoWindow.open(mapInstance.current);
      infoWindow.addListener('closeclick', () => {
        setSelectedBarangayFeature(null);
      });
    }, 0);
  }, [selectedBarangayFeature, barangaysList]);

  // Add barangay select pan logic
  const handleBarangaySelect = (e) => {
    const selectedBarangayName = e.target.value;

    if (!selectedBarangayName || !barangayData) return;

    const matchingBarangay = barangayData.features.find(feature => 
      normalizeBarangayName(feature.properties.name) === normalizeBarangayName(selectedBarangayName)
    );

    if (matchingBarangay) {
      const center = turf.center(matchingBarangay.geometry);
      const { coordinates } = center.geometry;
      const [lng, lat] = coordinates;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        panToWithOffset(mapInstance.current, { lat, lng }, 0.15);
        mapInstance.current?.setZoom(15);
        setSelectedBarangayFeature(matchingBarangay);
        setSelectedBarangayCenter({ lat, lng });
        setShowControlPanel(false);
        // Show InfoWindow for the selected barangay
        // Find matching barangayObj for pattern/report info
        let barangayObj = barangaysList?.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(matchingBarangay.properties.name));
        let patternBased = barangayObj?.status_and_recommendation?.pattern_based;
        let patternType = (patternBased?.status || matchingBarangay.properties.patternType || "none").toLowerCase();
        if (!patternType || patternType === "") patternType = "none";
        const patternCardColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
        let reportBased = barangayObj?.status_and_recommendation?.report_based;
        let reportAlert = reportBased?.alert;
        let reportStatus = (reportBased?.status || "unknown").toLowerCase();
        let reportCardColor = REPORT_STATUS_COLORS[reportStatus] || REPORT_STATUS_COLORS.unknown;
        // Use a div with Tailwind classes for InfoWindow content
        const content = document.createElement('div');
        content.innerHTML = `
          <div class=\"bg-white p-4 rounded-lg text-center h-auto\">
            <p class=\"text-4xl font-[900]\" style=\"color:${patternCardColor}\">Barangay ${matchingBarangay.properties.displayName || matchingBarangay.properties.name || 'Unknown Barangay'}</p>
            <div class=\"mt-3 flex flex-col gap-3 text-black\">
              <div class=\"p-3 rounded-lg border-2\" style=\"border-color:${patternCardColor}\">
                <div>
                  <p class=\"text-sm font-medium text-gray-600 uppercase\">Pattern</p>
                  <p class="text-lg font-semibold">
                    ${patternType === 'none'
                      ? 'No pattern detected'
                      : patternType.charAt(0).toUpperCase() + patternType.slice(1).replace('_', ' ')}
                  </p>
      </div>
              </div>
              <div class=\"p-3 rounded-lg border-2 ${reportCardColor}\">
                <div>
                  <p class=\"text-sm font-medium text-gray-600 uppercase\">Breeding Site Reports</p>
                  <p class=\"text-lg font-semibold\">
                    ${(reportAlert && reportAlert.toLowerCase() !== "none")
                      ? reportAlert
                      : "No breeding site reported in this barangay."}
                  </p>
                    </div>
                </div>
              </div>
          </div>
        `;
        if (window.google && window.google.maps && mapInstance.current) {
          if (!infoWindowRef.current) {
            infoWindowRef.current = new window.google.maps.InfoWindow({ maxWidth: 500 });
          }
          const infoWindow = infoWindowRef.current;
          infoWindow.setContent(content);
          infoWindow.setPosition({ lat, lng });
          infoWindow.open(mapInstance.current);
          infoWindow.addListener('closeclick', () => {
            setSelectedBarangayFeature(null);
          });
        }
      }
    }
  };

  // Helper to close InfoWindows
  const closeInfoWindows = () => {
    setSelectedBreedingSite(null);
    setSelectedIntervention(null);
  };

  if (loading) {
    console.log('Rendering loading spinner...');
    return <LoadingSpinner size={32} className="h-screen" message="Getting your location..." />;
  }
  if (error) {
    console.log('Rendering error message:', error);
    return <ErrorMessage error={error} className="m-4" />;
  }

  console.log('Rendering map container...');
  return (
    <div
      className="fixed left-0 right-0 bottom-0 w-full overflow-hidden z-[1] bg-[#f0f0f0]"
      style={{ top: "58px", height: "calc(100vh - 58px)" }}
    >
      {/* Floating Control Panel */}
      <div
        className="absolute top-6 left-0 md:left-10 z-10 w-full md:w-auto flex justify-center md:block"
      >
        {showControlPanel && (
          <div 
            className="relative bg-white/60 backdrop-blur-md rounded-lg shadow-xl p-6 w-[70vw] sm:w-[70vw] md:w-[400px] text-primary transition-all duration-300 ease-in-out transform"
          >
            <button
              onClick={() => setShowControlPanel(false)}
              className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-gray-200 text-primary rounded-full w-8 h-8 flex items-center justify-center shadow"
              aria-label="Close panel"
            >
              <span className="text-2xl font-bold">&times;</span>
            </button>
            <p className="text-3xl font-extrabold text-primary mb-2">Check your place</p>
            <p className="text-sm text-primary mb-4">
              Stay Protected. Look out for Dengue Outbreaks.
            </p>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBreedingSites(!showBreedingSites)}
                  className={`w-full px-4 py-2 hover:cursor-pointer rounded-md shadow transition-colors ${
                    showBreedingSites
                      ? "bg-primary text-white"
                      : "bg-white text-primary hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {showBreedingSites ? "Hide Breeding Sites" : "Show Breeding Sites"}
                </button>
                <button
                  onClick={() => {
                    setShowInterventions(!showInterventions);
                    if (showInterventions) setSelectedIntervention(null);
                  }}
                  className={`w-full px-4 hover:cursor-pointer py-2 rounded-md shadow transition-colors ${
                    showInterventions
                      ? "bg-primary text-white"
                      : "bg-white text-primary hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  {showInterventions ? "Hide Interventions" : "Show Interventions"}
                </button>
              </div>

              {/* Barangay Select */}
              <select
                value={selectedBarangay}
                onChange={handleBarangaySelect}
                className="w-full px-4 py-2 hover:cursor-pointer rounded-md shadow bg-transparent text-primary border border-primary/20 focus:border-primary focus:outline-none"
              >
                <option value="">Select a barangay</option>
                {barangayData?.features.map(f => (
                  <option key={f.properties.name} value={f.properties.name}>{f.properties.name}</option>
                ))}
              </select>

              {/* Legends */}
              <div className="flex flex-col gap-3">
                {/* Pattern Types Legend */}
                <div className="bg-white rounded-md shadow px-4 py-3 border border-gray-200">
                  <p className="font-semibold mb-2 text-primary">Pattern Types</p>
                  <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
                    {Object.entries(PATTERN_COLORS)
                      .filter(([key]) => key !== 'default')
                      .sort(([aKey], [bKey]) => { 
                        const order = { none: 0, stability: 1, decline: 2, gradual_rise: 3, spike: 4 };
                        return order[aKey] - order[bKey];
                      })
                      .map(([pattern, color]) => (
                        <div key={pattern} className="flex items-center gap-1">
                          <span
                            style={{ backgroundColor: color, width: '12px', height: '12px' }}
                            className="inline-block"
                          />
                          <span className="text-xs text-primary">
                            {pattern.charAt(0).toUpperCase() + pattern.slice(1).replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Marker Legend */}
                <div className="bg-white rounded-md shadow px-4 py-3 border border-gray-200">
                  <p className="font-semibold mb-2 text-primary">Marker Legend</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Breeding Site Marker */}
                    <div className="flex items-center gap-2">
                      <MapPin size={22} weight="fill" color="#FF6347" />
                      <span className="text-xs text-primary">Breeding Site</span>
                    </div>
                    {/* Intervention Marker */}
                    <div className="flex items-center gap-2">
                      <MapPin size={22} weight="fill" color="#1893F8" />
                      <span className="text-xs text-primary">Intervention</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!showControlPanel && (
        <button
            onClick={() => setShowControlPanel(true)}
            className="fixed top-30 left-4 z-50 hover:cursor-pointer bg-white/90 hover:bg-gray-200 text-primary rounded-full p-2 shadow-lg border border-primary"
            aria-label="Show panel"
          >
            <CaretRight size={28} weight="bold" />
        </button>
        )}
      </div>
      {/* Map container */}
      <div 
        ref={mapRef} 
        id="map" 
        style={{ 
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />
    </div>
  );
};

export default Mapping;
