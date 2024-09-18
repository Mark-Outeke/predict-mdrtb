// src/components/InstanceDetails.js

import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Ensure you have axios installed
import { useLocation } from 'react-router-dom';

const InstanceDetails = () => {
  const location = useLocation();
  const { trackedEntityInstance } = location.state; // Access the tracked entity instance ID from the navigation state
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstanceDetails = async () => {
      try {
        // Make a GET request to your API to fetch instance details
        const response = await axios.get(`/api/instance-details/${trackedEntityInstance}`);
        setDetails(response.data); // Set the fetched data to the local state
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to fetch instance details'); // Set error message
      } finally {
        setIsLoading(false); // Set loading to false after fetch attempt
      }
    };

    fetchInstanceDetails();
  }, [trackedEntityInstance]); // Fetch details when trackedEntityInstance changes

  if (isLoading) {
    return <div>Loading instance details...</div>; // Loading state
  }

  if (error) {
    return <div>Error: {error}</div>; // Render error message if any
  }

  return (
    <div>
      <h1>Instance Details</h1>
      {details.length > 0 ? (
        <pre>{JSON.stringify(details, null, 2)}</pre> // Render the instance details as JSON
      ) : (
        <p>No details found for this instance.</p>
      )}
    </div>
  );
};

export default InstanceDetails;
