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
 