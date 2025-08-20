import { useState, useEffect } from 'react';

export const useInterventions = (allInterventionsData) => {
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    console.log("[DEBUG] Processing interventions data:", allInterventionsData);
    if (allInterventionsData) {
      const validInterventions = allInterventionsData.filter((i) => {
        const isValid =
          i.specific_location &&
          Array.isArray(i.specific_location.coordinates) &&
          i.specific_location.coordinates.length === 2;
        if (!isValid) {
          console.log("[DEBUG] Invalid intervention:", i);
        }
        return isValid;
      });
      console.log("[DEBUG] Valid interventions:", validInterventions);
      setInterventions(validInterventions);
    } else {
      console.log("[DEBUG] No interventions data available");
      setInterventions([]);
    }
  }, [allInterventionsData]);

  return { interventions };
};
