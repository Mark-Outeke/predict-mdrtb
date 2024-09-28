import React, { useEffect, useState } from 'react';
import tracker from 'mark/api/tracker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTrackedEntity } from 'TrackedEntityContext'; // Import the context

const TrackedEntityDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackedEntity } = location.state;
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTrackedEntityData } = useTrackedEntity(); // Use the context

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
        setTrackedEntityData(httpResponse.data); // Store data in context
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError('Failed to fetch instance details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [trackedEntity, setTrackedEntityData]);

  // Calculate the total number of data elements
  const dataElementCount = () => {
    let count = 0;
    
    if (details.enrollments) {
      details.enrollments.forEach(enrollment => {
        if (enrollment.events) {
          enrollment.events.forEach(event => {
            count += event.dataValues.length; // Increment count by the number of dataValues
          });
        }
      });
    }

    return count;
  };

  const totalDataElements = dataElementCount(); // Get the total number of data elements

  if (isLoading) {
    return <div className="alert alert-info">Loading instance details...</div>;
  } else if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  } else {
    return (
      <div className="container mt-4">
        <h1>Patients Dashboard</h1>
        <p>Total Data Elements: {totalDataElements}</p> {/* Display total number of data elements */}
        <button className="btn btn-primary mb-3" onClick={() => navigate('/predictionProcessor/')}>MDRTB Prediction Score</button>
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
                            <td>{dataValue.dataElement}</td>
                            <td>{dataValue.value}</td>
                          </>
                        ) : (
                          <React.Fragment>
                            <td>{dataValue.dataElement}</td>
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
