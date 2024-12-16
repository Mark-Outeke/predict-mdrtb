// src/App.js
import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { TrackedEntityProvider } from 'mark/jsx/TrackedEntityContext'; // Import the context provider
import TrackedEntitiesTable from 'mark/jsx/TrackedEntitiesTable';
import TrackedEntityDetails from 'mark/jsx/TrackedEntityDetails';
import PredictionComponent from 'mark/jsx/predictionProcessor'; // Import the prediction component
import PredictionModelDescription from 'mark/jsx/PredictionModelDescription'; // Import the new description
import tracker from 'mark/api/tracker';


axios.defaults.baseURL = 'http://localhost:8080/dhis2-stable-40.4.1';

axios.defaults.headers.common['Authorization'] = 'Basic ' + btoa('admin:district');
axios.defaults.headers.common['Accept'] = "application/json";

const orgUnits = ["yApOnywci25", "Q6qNTXu3yRx","GuJvMV22ihs"];


tracker.useLegacyTrackerApi = true;






const App = () => {
  return (
    <TrackedEntityProvider> {/* Wrap Routes with the context provider */}
      <Router>
        <Routes>
          {/* Route to show TrackedEntitiesTable with data */}
          <Route path="/" element={<TrackedEntitiesTable orgUnits={orgUnits} trackedEntityType="MCPQUTHX1Ze" />} />
          {/* Route for details page */}
          <Route path="/TrackedEntityDetails/" element={<TrackedEntityDetails />} />
          {/* Route for prediction processor page */}
          <Route path="/predictionProcessor/" element={<PredictionComponent />} /> {/* Add prediction route */}
          {/* New route for predictionModelDescription*/}
          <Route path="/predictionModelDescription/" element={<PredictionModelDescription />} />
        </Routes>
      </Router>
    </TrackedEntityProvider>
  );
};

export default App;