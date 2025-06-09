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
import { loadGoogleMapsScript, createMapInstance, cleanupMapInstance, isValidMapInstance } from "../../utils/googleMapsLoader";

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
  "Uncollected Garbage or Trash": garbageIcon,
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
  const [error, setError] = useState(null);
  const [barangayData, setBarangayData] = useState(null);
  const [breedingSites, setBreedingSites] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const { data: barangaysList } = useGetBarangaysQuery();
  const { data: posts } = useGetPostsQuery();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  const [infoWindow, setInfoWindow] = useState(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (mapInstance.current) {
        overlaysRef.current.forEach(o => o.setMap(null));
        overlaysRef.current = [];
        cleanupMapInstance(mapInstance.current);
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!isMountedRef.current) return;
      try {
        const barangayResponse = await fetch("/quezon_barangays_boundaries.geojson");
        if (!barangayResponse.ok) throw new Error('Failed to load barangay data');
        const barangayGeoJson = await barangayResponse.json();
        if (isMountedRef.current) {
          setBarangayData(barangayGeoJson);
        }
        if (posts) {
          const validPosts = Array.isArray(posts?.posts) ? posts.posts : (Array.isArray(posts) ? posts : []);
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
    let map, overlays = [];
    setMapLoaded(false);
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
          window.google.maps.event.addListenerOnce(mapInstance.current, 'tilesloaded', () => {
            setMapLoaded(true);
          });
        } catch (err) {
          if (isMountedRef.current) {
            setError('Failed to initialize map');
          }
          return;
        }
      } else {
        window.google.maps.event.addListenerOnce(mapInstance.current, 'tilesloaded', () => {
          setMapLoaded(true);
        });
      }
      map = mapInstance.current;
      if (!map || !barangayData || !barangaysList) {
        return;
      }

      // Clear existing overlays
      overlays.forEach(overlay => overlay.setMap(null));
      overlays.length = 0;

      // Create polygons for each barangay
      barangayData.features.forEach((feature) => {
        const geometry = feature.geometry;
        const coordsArray = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];
        
        let barangayObj = barangaysList?.find(b => normalizeBarangayName(b.name) === normalizeBarangayName(feature.properties.name));

        let patternType = (barangayObj?.status_and_recommendation?.pattern_based?.status || feature.properties.patternType || feature.properties.pattern_type || 'none').toLowerCase();
        if (!patternType || patternType === '') patternType = 'none';
        const patternColor = PATTERN_COLORS[patternType] || PATTERN_COLORS.default;
        const patternColorDark = PATTERN_COLORS_DARK[patternType] || PATTERN_COLORS_DARK.default;

        // Check if this feature is the selected barangay
        const isSelected = selectedBarangay && 
          normalizeBarangayName(feature.properties.name) === normalizeBarangayName(selectedBarangay.properties?.name);

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

          // Add click listener
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

          marker.addListener('click', () => {
            // Close existing info window if open
            if (infoWindow) {
              infoWindow.close();
            }

            // Pan to marker position and zoom in
            if (mapInstance.current) {
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

            infoWindow.setContent(content);
            infoWindow.setPosition({
              lat: site.specific_location.coordinates[1],
              lng: site.specific_location.coordinates[0],
            });

            infoWindow.open(map, marker);
          });

          return marker;
        });
        overlays.push(...breedingMarkers);
      }

      // Draw intervention markers
      if (showInterventions && interventions.length > 0 && window.google.maps.marker) {
        const { AdvancedMarkerElement, PinElement } = window.google.maps.marker;
        const interventionMarkers = interventions
          .filter(intervention => {
            const status = intervention.status?.toLowerCase();
            return status === 'ongoing' || status === 'scheduled';
          })
          .map((intervention) => {
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
              // Close existing info window if open
              if (infoWindow) {
                infoWindow.close();
              }

              // Pan to marker position and zoom in
              if (mapInstance.current) {
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
              infoWindow.setPosition({
                lat: intervention.specific_location.coordinates[1],
                lng: intervention.specific_location.coordinates[0],
              });

              infoWindow.open(map, marker);
            });

            return marker;
          });
        overlays.push(...interventionMarkers);
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
  }, [barangayData, barangaysList, selectedBarangay, onBarangaySelect]);

  // Add this effect to initialize the info window
  useEffect(() => {
    if (window.google && window.google.maps) {
      const newInfoWindow = new window.google.maps.InfoWindow({
        maxWidth: 500,
      });
      setInfoWindow(newInfoWindow);
    }
  }, []);

  // Add debug for selectedBarangay changes
  useEffect(() => {
    // console.log('[DEBUG] Selected barangay changed:', selectedBarangay);
  }, [selectedBarangay]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', minHeight: 300, ...style }}>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        id="map-only"
      />
      {error && <ErrorMessage error={error} className="absolute top-2 left-2 z-20" />}
    </div>
  );
});

export default MapOnly; 