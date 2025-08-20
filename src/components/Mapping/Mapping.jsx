import React, { useState, useEffect } from 'react';
import { useGetBarangaysQuery, useGetPostsQuery, useGetAllInterventionsQuery } from '../../api/dengueApi';
import { useBarangayData } from '../../hooks/useBarangayData';
import MapControls from './MapControls';
import MapContainer from './MapContainer';
import { panToWithOffset } from '../../utils/mapOverlays';
import { SmileySad } from 'phosphor-react';

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
  const { data: barangaysList, error: barangaysError, isLoading: barangaysLoading } = useGetBarangaysQuery();
  const { data: posts } = useGetPostsQuery();
  const { data: allInterventionsData } = useGetAllInterventionsQuery
    ? useGetAllInterventionsQuery()
    : { data: [] };

  // Get barangay GeoJSON data
  const { barangayData, loading: barangayDataLoading } = useBarangayData(barangaysList, posts);

  // Show error if barangays API fails
  if (barangaysError) {
    return (
      <div className="fixed left-0 right-0 bottom-0 w-full overflow-hidden z-[1] bg-[#f0f0f0] flex items-center justify-center"
           style={{ top: "58px", height: "calc(100vh - 58px)" }}>
        <div className="bg-white flex flex-col items-center rounded-lg shadow-xl p-8 max-w-md mx-4 text-center">
          <SmileySad className='self-center mb-3' size={40}/>
          <p className="text-2xl font-bold text-gray-800 mb-4">Something went wrong.</p>
          <p className="text-gray-600 mb-6">
            We couldn't load the barangay information needed to display the map. This might be due to a network issue or server problem.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show loading if barangays are still loading
  if (barangaysLoading) {
    return (
      <div className="fixed left-0 right-0 bottom-0 w-full overflow-hidden z-[1] bg-[#f0f0f0] flex items-center justify-center"
           style={{ top: "58px", height: "calc(100vh - 58px)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading barangay data...</p>
        </div>
      </div>
    );
  }

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
