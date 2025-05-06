import React from "react";
import { useGetPatternRecognitionResultsQuery } from "./api/dengueApi";
import AlertCard from "./AlertCard";

const PatternRecognitionResults = () => {
  const {
    data: alerts,
    isLoading,
    isError,
  } = useGetPatternRecognitionResultsQuery();

  if (isLoading) {
    return <p>Loading pattern recognition results...</p>;
  }

  if (isError) {
    return <p>Error loading pattern recognition results.</p>;
  }

  return (
    <div>
      {alerts?.data?.map((alert, index) => (
        <AlertCard
          key={index}
          title={alert.name}
          messages={[
            { label: "Risk Level: ", text: alert.risk_level },
            { label: "Alert: ", text: alert.alert || "No alert message" },
          ]}
          borderColor="border-error" // You can customize this based on alert severity
          bgColor="bg-warning" // Customize background color if necessary
        />
      ))}
    </div>
  );
};

export default PatternRecognitionResults;
