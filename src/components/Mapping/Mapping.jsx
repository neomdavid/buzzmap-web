import React, { useState, useEffect } from 'react';
import { useGetBarangaysQuery, useGetPostsQuery, useGetAllInterventionsQuery } from '../../api/dengueApi';
import { useBarangayData } from '../../hooks/useBarangayData';
import MapControls from './MapControls';
import MapContainer from './MapContainer';
import { panToWithOffset } from '../../utils/mapOverlays';

const Mapping = () => {
  // UI state
  const [showBreedingSites, setShowBreedingSites] = useState(true);
  const [showInterventions, setShowInterventions] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [selectedBarangayFeature, setSelectedBarangayFeature] = useState(null);
  const [selectedBreedingSite, setSelectedBreedingSite] = useState(null);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const [selectedBarangayCenter, setSelectedBarangayCenter] = useState(null);
  const [showLegends, setShowLegends] = useState(true);

  // Fetch data
  const { data: barangaysList } = useGetBarangaysQuery();
  const { data: posts } = useGetPostsQuery();
  const { data: allInterventionsData } = useGetAllInterventionsQuery
    ? useGetAllInterventionsQuery()
    : { data: [] };

  // Get barangay GeoJSON data
  const { barangayData, loading: barangayDataLoading } = useBarangayData(barangaysList, posts);

  // Helper to close InfoWindows
  const closeInfoWindows = () => {
    setSelectedBreedingSite(null);
    setSelectedIntervention(null);
  };

  // Handle barangay selection
  const handleBarangaySelect = (event) => {
    const selectedName = event.target.value;
    if (selectedName) {
      // Find the selected barangay feature
      const selectedFeature = barangaysList?.find(
        (barangay) => barangay.name === selectedName
      );

      if (selectedFeature) {
        // Find the corresponding GeoJSON feature
        // This would need to be implemented based on your data structure
        console.log("Selected barangay:", selectedFeature);
        
        // You can add logic here to pan to the selected barangay
        // For now, just log the selection
      }
    }
  };

  // Handle breeding site selection
  const handleBreedingSiteSelect = (site) => {
    setSelectedBreedingSite(site);
    setSelectedBarangayFeature(null);
    setSelectedIntervention(null);
  };

  // Handle intervention selection
  const handleInterventionSelect = (intervention) => {
    setSelectedIntervention(intervention);
    setSelectedBarangayFeature(null);
    setSelectedBreedingSite(null);
  };

  // Handle barangay feature selection
  const handleBarangayFeatureSelect = (feature) => {
    setSelectedBarangayFeature(feature);
    setSelectedBreedingSite(null);
    setSelectedIntervention(null);
  };

  return (
    <div
      className="fixed left-0 right-0 bottom-0 w-full overflow-hidden z-[1] bg-[#f0f0f0]"
      style={{ top: "58px", height: "calc(100vh - 58px)" }}
    >
      {/* Floating Control Panel */}
      <MapControls
        showControlPanel={showControlPanel}
        setShowControlPanel={setShowControlPanel}
        showBreedingSites={showBreedingSites}
        setShowBreedingSites={setShowBreedingSites}
        showInterventions={showInterventions}
        setShowInterventions={setShowInterventions}
        selectedBarangay={selectedBarangay}
        handleBarangaySelect={handleBarangaySelect}
        barangayData={barangayData}
        selectedIntervention={selectedIntervention}
        setSelectedIntervention={setSelectedIntervention}
      />

      {/* Map Container */}
      <MapContainer
        barangaysList={barangaysList}
        posts={posts}
        allInterventionsData={allInterventionsData}
        barangayData={barangayData}
        loading={barangayDataLoading}
        showBreedingSites={showBreedingSites}
        showInterventions={showInterventions}
        selectedBarangayFeature={selectedBarangayFeature}
        setSelectedBarangayFeature={handleBarangayFeatureSelect}
        setShowControlPanel={setShowControlPanel}
      />
    </div>
  );
};

export default Mapping;
