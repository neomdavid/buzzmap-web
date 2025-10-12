import { useState, useEffect } from "react";

export const useInterventions = (allInterventionsData) => {
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    if (allInterventionsData) {
      const validInterventions = allInterventionsData.filter((i) => {
        const isValid =
          i.specific_location &&
          Array.isArray(i.specific_location.coordinates) &&
          i.specific_location.coordinates.length === 2;
        if (!isValid) {
        }
        return isValid;
      });
      setInterventions(validInterventions);
    } else {
      setInterventions([]);
    }
  }, [allInterventionsData]);

  return { interventions };
};
