import React, { useEffect, useState } from 'react';
import tracker from 'mark/api/tracker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';


const TrackedEntityDetails = () => {
  const location = useLocation();
  const { trackedEntity } = location.state; // Access the tracked entity instance ID from the navigation state
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);





  useEffect(() => {
      console.log(trackedEntity)

      const getTrackedEntityByID = tracker.useLegacyTrackerApi ?
        tracker.legacy.GetTrackedEntityByID : tracker.GetTrackedEntityByID;

      const trackedEntityID = tracker.useLegacyTrackerApi ?
        trackedEntity.trackedEntityInstance : trackedEntity.trackedEntity;


        getTrackedEntityByID(trackedEntityID, {fields:"*"})
        .then((httpResponse)=>{
          setDetails(httpResponse.data)
          console.log(httpResponse.data);
        })
        .catch (error => {
          console.error('Fetch error:', error);
          setError('Failed to fetch instance details');
        })
        .finally(()=> {
          setIsLoading(false);
        });
  }, [trackedEntity]);







  if (isLoading)
  {
    // Loading state
    return <div>Loading instance details...</div>;

  }else
  if(error)
  {
    // Render error message if any
    return <div>Error: {error}</div>;

  }else
  {
    // Render the instance details as JSON

    return (
      <div>
        <h1>Instance Details</h1>
        {details ? (
          <pre>{JSON.stringify(details.enrollments, null, 2)}</pre>
        ) : (
          <p>No details found for this instance.</p>
        )}
      </div>
    );
  }
};

export default TrackedEntityDetails;