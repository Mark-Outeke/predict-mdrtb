import React, { createContext, useContext, useState, useMemo } from 'react';
import { List } from 'immutable';

const TrackedEntityContext = createContext();

export const TrackedEntityProvider = ({ children }) => {
  const [trackedEntityData, setTrackedEntityData] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null); // New state for prediction
  const [processedData, setProcessedData] = useState(List());

  const updateTrackedEntity = (newData) => {
    setTrackedEntityData(prevData => {
      return {
        ...prevData,
        ...newData
      };
    });
    if (newData.predictions) {
      setPredictionResult(newData.predictions);
    }
  };
  const value = useMemo(() => ({
    trackedEntityData,
    setTrackedEntityData,
    predictionResult,
    setPredictionResult,
    updateTrackedEntity,
    processedData,
    setProcessedData,
  }), [trackedEntityData, predictionResult, processedData]); // Memoize provider value
  return (
    <TrackedEntityContext.Provider value={value}>
      {children}
    </TrackedEntityContext.Provider>
  );
};

export const useTrackedEntity = () => {
  const context = useContext(TrackedEntityContext);
  if (!context) {
    throw new Error("useTrackedEntity must be used within a TrackedEntityProvider");
  }
  return context;
};
