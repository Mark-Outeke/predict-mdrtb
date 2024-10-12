import React, { useEffect, useState } from 'react';
import tracker from 'mark/api/tracker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTrackedEntity } from 'TrackedEntityContext';

const TrackedEntityDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackedEntity } = location.state;
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataElementDisplayNames, setDataElementDisplayNames] = useState({});
  const [predictions, setPredictions] = useState(''); // State for predictions

  const { setTrackedEntityData } = useTrackedEntity(); // Use the context

  // Fetch display names for data elements when the component mounts
  useEffect(() => {
    const fetchDataElementDisplayNames = async () => {
      try {
        const response = await tracker.legacy.GetDataElementsNameByID({ paging: false });
        const dataElements = response.data.dataElements;

        if (!Array.isArray(dataElements)) {
          throw new Error('Expected dataElements to be an array');
        }

        const displayNameMapping = {};
        dataElements.forEach(element => {
          displayNameMapping[element.id] = element.displayName;
        });

        setDataElementDisplayNames(displayNameMapping); // Store the mapping in state
      } catch (error) {
        console.error('Error fetching data element display names:', error);
        setError('Failed to fetch data element display names');
      }
    };

    fetchDataElementDisplayNames();
  }, []); // Only run on mount

  // Fetch entity details
  useEffect(() => {
    const getTrackedEntityByID = tracker.useLegacyTrackerApi
      ? tracker.legacy.GetTrackedEntityByID 
      : tracker.GetTrackedEntityByID;

    const trackedEntityID = tracker.useLegacyTrackerApi
      ? trackedEntity.trackedEntityInstance 
      : trackedEntity.trackedEntity;

    getTrackedEntityByID(trackedEntityID, { fields: "*" })
      .then((httpResponse) => {
        setDetails(httpResponse.data);
        console.log(httpResponse.data);
        setTrackedEntityData(httpResponse.data);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError('Failed to fetch instance details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [trackedEntity, setTrackedEntityData]);

  // Fetch predictions when entity details are loaded
  useEffect(() => {
    if (details && details.trackedEntityInstance) {
      const fetchPredictions = async () => {
        try {
          // Replace with your actual prediction fetching logic
          const response = await fetch(`/api/predictions/${details.trackedEntityInstance}`);
          const predictionResult = await response.json();
          setPredictions(`Patient has a prediction percentage of ${predictionResult.percentage}% to develop MDR-TB, ${predictionResult.class}.`);
        } catch (error) {
          console.error('Error fetching predictions:', error);
          setPredictions('Error fetching predictions.');
        }
      };

      fetchPredictions();
    }
  }, [details]); // Run this effect when details change

  if (isLoading) {
    return <div className="alert alert-info">Loading instance details...</div>;
  } else if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  } else {
    return (
      <div className="container mt-4">
        <h1>Patient's Dashboard</h1>
        
        <button className="btn btn-primary mb-3" onClick={() => navigate('/predictionProcessor/')}>MDRTB Prediction Score</button>
        {predictions && <div className="alert alert-info">{predictions}</div>} {/* Render predictions message */}
        {details.enrollments && details.enrollments.length > 0 ? (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Tracked Entity Instance ID</th>
                <th>Enrollment ID</th>
                <th>Event ID</th>
                <th>Data Element</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {details.enrollments.map((enrollment, enrollmentIndex) => (
                enrollment.events && enrollment.events.length > 0 ? (
                  enrollment.events.map((event, eventIndex) => (
                    event.dataValues.map((dataValue, dataIndex) => (
                      <tr key={`${enrollmentIndex}-${eventIndex}-${dataIndex}`}>
                        {dataIndex === 0 ? (
                          <>
                            <td rowSpan={event.dataValues.length}>{enrollment.trackedEntityInstance}</td>
                            <td rowSpan={event.dataValues.length}>{enrollment.enrollment}</td>
                            <td rowSpan={event.dataValues.length}>{event.event}</td>
                            <td>{dataElementDisplayNames[dataValue.dataElement] || dataValue.dataElement}</td>
                            <td>{dataValue.value}</td>
                          </>
                        ) : (
                          <React.Fragment>
                            <td>{dataElementDisplayNames[dataValue.dataElement] || dataValue.dataElement}</td>
                            <td>{dataValue.value}</td>
                          </React.Fragment>
                        )}
                      </tr>
                    ))
                  ))
                ) : (
                  <tr key={enrollmentIndex}>
                    <td colSpan="5">No events found for Enrollment ID: {enrollment.enrollment}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        ) : (
          <p>No details found for this instance.</p>
        )}
      </div>
    );
  }
};

export default TrackedEntityDetails;
