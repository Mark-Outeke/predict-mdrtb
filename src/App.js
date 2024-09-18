// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InstanceTable from './InstanceTable';
import InstanceDetails from './InstanceDetails';
import {fetchTrackedEntityInstancesAndOrgUnits} from './api';



const App = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const instances = await fetchTrackedEntityInstancesAndOrgUnits();
          setData(instances.trackedEntityInstances);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { trackedEntityInstances } = await fetchTrackedEntityInstancesAndOrgUnits();
        setData(trackedEntityInstances); // Set the combined instances data
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchData();
  }, []);
  


return (
  <Router>
    <Routes>
      {/* Route to show InstanceTable with data */}
      <Route path="/" element={<InstanceTable data={data} />} />
      
      {/* Route for details page */}
      <Route path="/instanceDetails/:id" element={<InstanceDetails />} />
    </Routes>
  </Router>
);
};

export default App;
