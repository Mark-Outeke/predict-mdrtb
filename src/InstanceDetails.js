import React, { useEffect, useState } from 'react';
import { fetchInstanceDetails } from './api'; // Import the API function
import { useLocation } from 'react-router-dom';

const InstanceDetails = () => {
  const location = useLocation();
  const { instance } = location.state;
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedDetails = await fetchInstanceDetails(instance.trackedEntityInstance);
        setDetails(fetchedDetails);
        console.log(fetchedDetails)
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [instance]);

  if (isLoading) {
    return <div>Loading instance details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div>
      <h2>Instance Details</h2>
      {details.enrollments.map((enrollment, index) => (
        <div key={index}>
          {enrollment.events.map((event, eventIndex) => (
            <div key={eventIndex}>
              <strong>Data Element:</strong> {event.dataValues.map((dataValue, dataValueIndex) => (
                <div key={dataValueIndex}>
                  {dataValue.dataElement} - {dataValue.value}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default InstanceDetails;