import React, { useEffect, useState } from 'react';
import tracker from 'mark/api/tracker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation } from 'react-router-dom';

const TrackedEntityDetails = () => {
  const location = useLocation();
  const { trackedEntity } = location.state;
  const [details, setDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setError('Failed to fetch instance details');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [trackedEntity]);

  if (isLoading) {
    return <div className="alert alert-info">Loading instance details...</div>;
  } else if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  } else {
    return (
     
        <div className="container mt-4">
          <h1>Instance Details</h1>
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
                          {dataIndex === 0 ? ( // Check if it is the first dataValue for the row
                            <>
                              <td rowSpan={event.dataValues.length}>{enrollment.trackedEntityInstance}</td> {/* Add tracked entity instance ID here */}
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