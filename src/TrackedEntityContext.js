import React, { createContext, useContext, useState } from 'react';

const TrackedEntityContext = createContext();

export const TrackedEntityProvider = ({ children }) => {
  const [trackedEntityData, setTrackedEntityData] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null); // New state for prediction

  return (
    <TrackedEntityContext.Provider value={{ trackedEntityData, setTrackedEntityData, predictionResult, setPredictionResult }}>
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
