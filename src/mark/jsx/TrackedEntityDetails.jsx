import React, { useEffect, useState } from 'react';
import tracker from 'mark/api/tracker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTrackedEntity } from 'TrackedEntityContext';
import Header from './Header';

// import visualization library here if needed (e.g., Chart.js, D3.js)

const TrackedEntityDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trackedEntity } = location.state;
  const [details, setDetails] = useState(null); // Store details as an object
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataElementDisplayNames, setDataElementDisplayNames] = useState({});
  const [predictions, setPredictions] = useState('');
  const [baselineData, setBaselineData] = useState([]); // State for baseline data
  const [sortedAveragedIGValues, setSortedAveragedIGValues] = useState([]); // State for sorted IG values

  const { setTrackedEntityData, } = useTrackedEntity();
  const { predictionResult } = useTrackedEntity(); 

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

        setDataElementDisplayNames(displayNameMapping);
      } catch (error) {
        console.error('Error fetching data element display names:', error);
        setError('Failed to fetch data element display names');
      }
    };

    fetchDataElementDisplayNames();
  }, []);

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
        setDetails(httpResponse.data); // Store the entire details object
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
    if (trackedEntity && trackedEntity.trackedEntityInstance) {
      const fetchPredictions = async () => {
        try {
          const response = await fetch(`/PredictionComponent/${trackedEntity.trackedEntityInstance}`);
          const predictionResult = await response.json();
          setPredictions(`Patient has a prediction percentage of ${predictionResult.percentage}% to develop MDR-TB, 
                                      and has a classification of ${predictionResult.class}.`);
            if (sortedAveragedIGValues) {
              setSortedAveragedIGValues(sortedAveragedIGValues.sort((a, b) =>
                 b.contribution - a.contribution));
            }
           } catch (error) {
          console.error('Error fetching predictions:', error);
          setPredictions('Error fetching predictions.');
        }
      };

      fetchPredictions();
    }
  }, [trackedEntity, sortedAveragedIGValues]);

  useEffect(() => {
    if (details && details.enrollments && details.enrollments.length > 0) {
      const enrollment = details.enrollments[0]; // Get the first enrollment
      if (enrollment.events && enrollment.events.length > 0) {
        const firstEvent = enrollment.events[0]; // Get the first event
        const baselineEntries = [];
        firstEvent.dataValues.forEach(dataValue => {
          const displayName = dataElementDisplayNames[dataValue.dataElement];

          // Check if the corresponding display name contains "baseline"
          if (displayName && displayName.toLowerCase().includes('baseline')) {
              baselineEntries.push({
                dataElement:dataElementDisplayNames[ dataValue.dataElement],
                value: dataValue.value,
              });
            }
          });
          console.log('Baseline entries found:', baselineEntries); // Log found entries
      setBaselineData(baselineEntries);
    } else {
      console.warn('No events found in the first enrollment.');
    }
  } else {
    console.warn('No enrollments found in details:', details);
  }
  }, [details,dataElementDisplayNames]);


  if (isLoading) {
    return <div className="alert alert-info">Loading instance details...</div>;
  } else if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  } else {
    let patientAge = '';
    let patientSex = '';
    let tbRegistrationNumber = '';
    let patientName = '';
    let givenName ='';
    let familyName = '';
    if (details.enrollments && details.enrollments.length > 0) {
      const enrollment = details.enrollments[0]; // Assuming you want the first enrollment
      if (enrollment.attributes && Array.isArray(enrollment.attributes)) {
      enrollment.attributes.forEach(attribute => {
        if (attribute.displayName === 'NTLP-01: Patient Name') {
          patientName = attribute.value;
        }
        if (attribute.displayName === 'GEN - Family name') {
          familyName = attribute.value;
        }
       
        if (attribute.displayName === 'GEN - Given name') {
          givenName = attribute.value;
        }
               if (attribute.displayName === 'NTLP-02: Age in years') {
          patientAge = attribute.value;
        }
        if (attribute.displayName === 'NTLP-04: Sex') {
          patientSex = attribute.value;
        }
        if (attribute.displayName === 'DSATR-002: Unit TB No/DR TB No/Leprosy N') {
          tbRegistrationNumber = attribute.value;
        }
      });
    } else {
      console.error('dataValues is not defined or not an array:', enrollment);
    }
  } else {
    console.error('No enrollments found in details:', details);
  };



    return (
      <div className="App_mainCenterCanva">
        <Header />
        <h1>Patient's Dashboard</h1>
        
        <button className="btn btn-primary mb-3" onClick={() => navigate('/predictionProcessor/')}>
          Click to view MDRTB Prediction Score
        </button>
        
        {predictions && (
          <div className="alert alert-info">
            {predictions}</div>)}

            {predictionResult && (
        <div className="alert alert-info">
          Predictions: {JSON.stringify(predictionResult)}
        </div>
      )}
        
        {/* Visualization logic goes here */}
        {/* Example: You can pass 'details' to a chart component */}
        <div className="row">
        <div className="col-sm-3">
            <div className="card mb-3" >
              <div className="card-body">
                <h5 className="card-title">Patient Name</h5>
                <p className="card-text"><strong>{patientName} {givenName} {familyName}</strong></p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card mb-3" >
              <div className="card-body">
                <h5 className="card-title">Patient Age</h5>
                <p className="card-text"><strong>{patientAge}</strong> years</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Patient Sex</h5>
                <p className="card-text"><strong>{patientSex}</strong></p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">TB Registration Number</h5>
                <p className="card-text"><strong>{tbRegistrationNumber}</strong></p>
              </div>
            </div>
          </div>
        </div>
        {/* Card for Baseline Data */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Baseline Data</h5>
            {baselineData.length > 0 ? (
              <table className="table table-bordered table-striped">
                <thead>
                  <tr>
                    <th>Data Element</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {baselineData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.dataElement}</td>
                      <td>{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No baseline data found.</p>
            )}
          </div>
        </div>
        <div className="card mb-3">
        <div className="card-body">
          <h5 className="card-title">Filtered Integrated Gradients Values</h5>
          <h6>These explain the contribution by the features to the prediction for this patient</h6>
          {sortedAveragedIGValues.length > 0 ? (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Data Element</th>
                  <th>Contribution</th>
                </tr>
              </thead>
              <tbody>
                {sortedAveragedIGValues.map((item, index) => (
                  <tr key={index}>
                    {/* Assuming item has properties `dataElement` and `contribution` */}
                    <td>{item.dataElement}</td> 
                    <td>{item.contribution}</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No integrated gradients values found.</p> 
          )}
        </div>
      </div>

      </div>
    );
  }
};

export default TrackedEntityDetails;