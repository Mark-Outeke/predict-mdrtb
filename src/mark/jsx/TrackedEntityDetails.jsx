import React, { useEffect, useState, useRef } from 'react';
import tracker from 'mark/api/tracker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTrackedEntity } from 'TrackedEntityContext';
import Header from './Header';
import { Chart, registerables } from 'chart.js'; 
import * as d3 from 'd3';
import PredictionComponent from 'predictionProcessor';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, } from 'react-leaflet'; // Import Leaflet components
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet';
import personIcon from './person.png';
import HotspotProcessor from './HotspotData';
import 'leaflet.heat'; // Import the heatmap plugin




delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
Chart.register(...registerables); // Register all necessary chart component

// import visualization library here if needed (e.g., Chart.js, D3.js)



const TrackedEntityDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {trackedEntity} = location.state;
  const [details, setDetails] = useState(null); // Store details as an object
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataElementDisplayNames, setDataElementDisplayNames] = useState({});
  const [predictions, setPredictions] = useState('');
  const [baselineData, setBaselineData] = useState([]); // State for baseline data
  const [sortedAveragedIGValues, setSortedAveragedIGValues] = useState([]); // State for sorted IG values
  const {setTrackedEntityData} = useTrackedEntity();
  const [combinedData, setCombinedData] = useState([]); // State for combined weight, BMI, and MUAC data
  const [orgUnitDetails, setOrgUnitDetails] = useState([]); // State to store organization unit details
  const [districts, setDistricts] = useState([]); // State for district boundaries
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [currentOrgUnit, setCurrentOrgUnit] = useState(null);
  const [matchedOrgUnitGeofeature, setMatchedOrgUnitGeofeature] = useState(null);
  const [gisCoordinates, setGisCoordinates] = useState(null); // State for GIS coordinates
 
  const [distanceToOrgUnit, setDistanceToOrgUnit] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [testResults, setTestResults] = useState([]); 
  const [parishes, setParishes] = useState(null); // State for parish GeoJSON
  
  


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


// Extract GIS Coordinates when details change
  useEffect(() => {
    if (details && details.enrollments && details.enrollments.length > 0) {
      const enrollment = details.enrollments[0];
      enrollment.attributes.forEach(attr => {
        if (attr.displayName === 'GIS Coordinates') {
          try {
            const coords = JSON.parse(attr.value); // Assuming value is a stringified JSON
            setGisCoordinates([parseFloat(coords[1]), parseFloat(coords[0])]); // [lat, lng]
          } catch (error) {
            console.error('Error parsing GIS Coordinates:', error);
          }
        }
      });
    }
  }, [details]);
  //console.log('gisCoordinates', gisCoordinates);

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
          setPredictions('');
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
          //console.log('Baseline entries found:', baselineEntries); // Log found entries
      setBaselineData(baselineEntries);
    } else {
      //console.warn('No events found in the first enrollment.');
    }
  } else {
    //console.warn('No enrollments found in details:', details);
  }
  }, [details,dataElementDisplayNames]);





  
  useEffect(() => {
    if (details && details.enrollments && details.enrollments.length > 0) {
      const enrollment = details.enrollments[0]; // Get the first enrollment
      if (enrollment.events && enrollment.events.length > 0) {
        const weightData = [];
        const bmiData = [];
        const muacData = [];
  
        enrollment.events.forEach(event => {
          event.dataValues.forEach(dataValue => {
            const displayName = dataElementDisplayNames[dataValue.dataElement];
  
            // Collect data based on identified display names
            if (displayName) {
              if (displayName.toLowerCase().includes('weight')) {
                weightData.push({
                  date: event.eventDate, // Use your event date as the X-axis
                  value: parseFloat(dataValue.value) // Ensure numeric value
                });
              } else if (displayName.toLowerCase().includes('bmi')) {
                bmiData.push({
                  date: event.eventDate,
                  value: parseFloat(dataValue.value)
                });
              } else if (displayName.toLowerCase().includes('muac')) {
                muacData.push({
                  date: event.eventDate,
                  value: parseFloat(dataValue.value)
                });
              }
            }
          });
        });
  
        // Combine collected data into a single object
        const combined = weightData.map((w, index) => ({
          date: w.date,
          weight: w.value,
          bmi: bmiData[index]?.value || null, // Using null for missing values
          muac: muacData[index]?.value || null // Using null for missing values
        }));
  
        setCombinedData(combined); // Store combined data for visualization
        //console.log('Combined data for line chart:', combined); // For debugging
      } else {
        console.warn('No events found in the first enrollment.');
      }
    } else {
      console.warn('No enrollments found in details:', details);
    }
  }, [details, dataElementDisplayNames]);





  const LineChart = ({ data }) => {
    useEffect(() => {
      const filteredData = data.filter(d => d.weight !== null || d.bmi !== null || d.muac !== null);
      const svgWidth = 1000;
      const svgHeight = 650;
      const margin = { top: 20, right: 30, bottom: 50, left: 50 };
  
      // Clear any existing SVG
      d3.select("#line-chart").select("svg").remove();
  
      const svg = d3.select("#line-chart")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
  
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)))
        .range([margin.left, svgWidth - margin.right]);
  
      const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => Math.max(d.weight || 0, d.bmi || 0, d.muac || 0))])
        .range([svgHeight - margin.bottom, margin.top]);
  
      // Create axes
      const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y-%m-%d")); 
      const yAxis = d3.axisLeft(y);
  
      svg.append("g")
        .attr("transform", `translate(0,${svgHeight - margin.bottom})`)
        .call(xAxis)
        .selectAll("text") // Select all text in the x-axis
        .style("font-size", "14px") // Increase font size for x-axis labels
        .style("text-anchor", "middle"); // Center text if needed

  
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .selectAll("text") // Select all text in the y-axis
        .style("font-size", "14px"); // Increase font size for y-axis labels;
  
      // Line generators
      const lineWeight = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.weight));
      
      const lineBMI = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.bmi));
      
      const lineMUAC = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.muac));
  
      // Append lines to the SVG
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", lineWeight);
  
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .attr("d", lineBMI);
      
      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 1.5)
        .attr("d", lineMUAC);

        // Append circles for each data point on the lines
    data.forEach(d => {
      // Weight points
      if (d.weight !== null) {
        svg.append("circle")
          .attr("cx", x(new Date(d.date)))
          .attr("cy", y(d.weight))
          .attr("r", 4)
          .attr("fill", "steelblue");
      }

      // BMI points
      if (d.bmi !== null) {
        svg.append("circle")
          .attr("cx", x(new Date(d.date)))
          .attr("cy", y(d.bmi))
          .attr("r", 4)
          .attr("fill", "orange");
      }

      // MUAC points
      if (d.muac !== null) {
        svg.append("circle")
          .attr("cx", x(new Date(d.date)))
          .attr("cy", y(d.muac))
          .attr("r", 4)
          .attr("fill", "green");
      }
    });
      // Create the legend at the bottom
    const legend = svg.append("g")
    .attr("transform", `translate(${svgWidth / 2}, ${svgHeight - margin.bottom + 20})`); // Position it at the bottom

      // Legend items
    legend.append("rect").attr("x", -60).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", "steelblue");
    legend.append("text").attr("x", -45).attr("y", 10).text("Weight").attr("fill", "steelblue");
    
    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", "orange");
    legend.append("text").attr("x", 15).attr("y", 10).text("BMI").attr("fill", "orange");
    
    legend.append("rect").attr("x", 60).attr("y", 0).attr("width", 10).attr("height", 10).attr("fill", "green");
    legend.append("text").attr("x", 75).attr("y", 10).text("MUAC").attr("fill", "green");

  
    }, [data]);
  
    return (
      <div id="line-chart" style={{ marginBottom: '20px',  }}></div>
    );
  };
  
  // Function to get severe data along with its display name
const getSevereData = (details, dataElementDisplayNames) => {
  const severeEntries = [];

  if (details && details.enrollments && details.enrollments.length > 0) {
    const enrollment = details.enrollments[0]; // Get the first enrollment
    if (enrollment.events && enrollment.events.length > 0) {
      enrollment.events.forEach(event => {
        event.dataValues.forEach(dataValue => {
          // Check if the value is "severe"
          if (dataValue.value.toLowerCase() === 'severe') {
            severeEntries.push({
              eventDate: event.eventDate,
              dataElement: dataValue.dataElement, // ID
              displayName: dataElementDisplayNames[dataValue.dataElement] || 'Unknown', // Get display name
              value: dataValue.value,
            });
          }
        });
      });
    }
  }

  return severeEntries;
};


// Getting test results data from each event to monitor for improvement.

useEffect(() => {
  if (details && details.enrollments && details.enrollments.length > 0) {
    const enrollment = details.enrollments[0]; // Get the first enrollment
    if (enrollment.events && enrollment.events.length > 0) {
      const results = [];

      enrollment.events.forEach(event => {
        event.dataValues.forEach(dataValue => {
          if (dataValue.dataElement === 'WTz4HSqoE5E') { // Check for follow-up test data element
            results.push({
              eventDate: event.eventDate,
              result: dataValue.value, // Store the test result
            });
          }
        });
      });

      setTestResults(results);
    }
  }
}, [details]);

// Usage within your component
useEffect(() => {
  if (details) {
    const severeData = getSevereData(details, dataElementDisplayNames);
    console.log('Severe Entries:', severeData); // Log or store the severe data
  }
}, [details, dataElementDisplayNames]); // Add dataElementDisplayNames to the dependency array




useEffect(() => {
  const fetchOrgUnitDetails = async () => {
    try {
      const ouIds = 'ou:Q6qNTXu3yRx;yApOnywci25;GuJvMV22ihs'; // Correctly formatted IDs as a single string
      const response = await tracker.legacy.GetOrganizationUnitsGeoFeatures(ouIds);
      
      // Logging the fetched organization units for investigation
      console.log('Fetched Organization Units:', response.data); // Check structure here
      
      // Assuming the response is structured as expected
      const units = response.data; // Adjust if your API response is nested
      
      // Process the fetched data to set the state
      const processedUnits = units.map(unit => {
        // Assuming "co" contains the coordinate string that needs to be parsed
        const coordinates = JSON.parse(unit.co); // Parse string to array
        return {
          id: unit.id,
          displayName: unit.na, // Use `na` for display name
          latitude: coordinates[1], // Latitude is at index 1 in the returned array
          longitude: coordinates[0], // Longitude is at index 0 in the returned array
        };
      });

      setOrgUnitDetails(processedUnits);
     
    } catch (error) {
      console.error('Error fetching organization units:', error);
      setError('Failed to fetch organization units');
    }
  };

  fetchOrgUnitDetails();
}, []);
//console.log(' fetched geo details',orgUnitDetails);



useEffect(() => {
  if (details && details.enrollments && details.enrollments.length > 0) {
    const enrollment = details.enrollments[0]; // Get the first enrollment
    if (enrollment.orgUnit) {
      const unitId = enrollment.orgUnit; // Assuming this field has the org unit ID
      const unitName = enrollment.orgUnitName; // Map the ID to the display name
      setCurrentOrgUnit({ id: unitId, name: unitName });
    }
  } 
}, [details, dataElementDisplayNames]);
//console.log('current orgUnit:', currentOrgUnit );

//match currentorgunit with its geofeatures from the orgunitdetails


const fetchDistrictsGeoJSON = async () => {
  try {
    const response = await fetch('/Districts_UG.geojson'); // Adjust path if needed
    const DistrictGeoJsonData = await response.json();
    setDistricts(DistrictGeoJsonData);
  } catch (error) {
    console.error('Error fetching district GeoJSON:', error);
  }
};


// Call fetch function within useEffect to run on component mount
useEffect(() => {

  fetchDistrictsGeoJSON();
  
}, []);

const mapRef = useRef ();

useEffect(() => {
  const fetchParishesGeoJSON = async () => {
    try {
      const response = await fetch('/Ug_Parishes_2016.geojson'); // Adjust the path
      const ParishesGeoJsonData = await response.json();
      setParishes(ParishesGeoJsonData);
    } catch (error) {
      console.error('Error fetching parish GeoJSON:', error);
    }
  };

  fetchParishesGeoJSON();
}, []);
useEffect(() => {
  if (currentOrgUnit && orgUnitDetails.length > 0) {
    const matchedFeature = orgUnitDetails.find(unit => unit.id === currentOrgUnit.id);
    setMatchedOrgUnitGeofeature(matchedFeature);
  }
}, [currentOrgUnit, orgUnitDetails]);

useEffect(() => {
  if (matchedOrgUnitGeofeature && mapRef.current) {
    const { latitude, longitude } = matchedOrgUnitGeofeature;
    mapRef.current.setView([latitude, longitude], 12); // Set zoom level as desired (e.g., 10)
  }
}, [matchedOrgUnitGeofeature]);



const styleDistrict = (feature) => {
  const isSelected = selectedDistrict === feature.properties.name
  return {
    color: feature.properties.color || '#3388ff', // Default color if not defined
    weight: 2,
    opacity: 1,
    fillOpacity: isSelected? 0.5:0,
    fillColor: isSelected ? '#ff7800' : 'transparent', // Highlight selected
  };
};
const patientIcon = L.icon({
  iconUrl: personIcon,
  iconSize: [25, 25], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
});



const haversineDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  
  const lat1 = coords1[0];
  const lon1 = coords1[1];
  const lat2 = coords2[0];
  const lon2 = coords2[1];

  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};

// Assuming you have gisCoordinates, currentOrgUnit, and hotspotsData already defined
useEffect(() => {
  //console.log('Current Org Unit:', matchedOrgUnitGeofeature);
  if (gisCoordinates && matchedOrgUnitGeofeature) {
    const orgUnitCoords = [
      matchedOrgUnitGeofeature.latitude, 
      matchedOrgUnitGeofeature.longitude];
    const distance = haversineDistance(gisCoordinates, orgUnitCoords);
    setDistanceToOrgUnit(distance);
    //console.log('orgunitcoords',orgUnitCoords);
  }
  
}, [gisCoordinates, matchedOrgUnitGeofeature]);



useEffect(() => {
  if (heatmapData.length > 0 && mapRef.current) {
    L.heatLayer(heatmapData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red',
      },
    }).addTo(mapRef.current);
  }
}, [heatmapData]);


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
    <div className="App_mainCenterCanva" style={{ backgroundColor: '#f4f6f8' }}>
      <Header />
      <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '30px', textAlign: 'center' }}>Patient's Dashboard</h1>
      <div className="mb-3" style={{ textAlign: 'left' }}>
    <button
      className="btn"
      style={{ backgroundColor: '#fff', color: 'black', border: '1px solid', borderRadius: '14px', padding: '10px 20px', fontSize: '16px' }}
      onClick={() => navigate('/')} // Adjust the path to your trackedEntityTable component's route
    >
      Back
    </button>
  </div>

      <div className="row">
    <div className="col-md-12 d-flex justify-content-end mb-4">
      <button className="btn btn-primary" 
      style={{ backgroundColor: '#f4f6f8', color: 'black', border: '1px solid', borderRadius: '14px', padding: '10px 20px', fontSize: '16px' }}
      onClick={() => navigate('/predictionProcessor/')}> {/* Button will be aligned to the right */}
        Click to view MDRTB Prediction Score
      </button>
    </div>
  </div>
  
      {predictions && (
        <div className="alert alert-info text-center">
          {predictions}
        </div>
      )}
  
      <div className="row mb-3">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Patient Name</h5>
              <p className="card-text"><strong>{patientName} {givenName} {familyName}</strong></p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Patient Age</h5>
              <p className="card-text"><strong>{patientAge}</strong> years</p>
            </div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">Patient Sex</h5>
              <p className="card-text"><strong>{patientSex}</strong></p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h5 className="card-title">TB Registration Number</h5>
              <p className="card-text"><strong>{tbRegistrationNumber}</strong></p>
            </div>
          </div>
        </div>
      </div>
  
      <div className="row mb-3">
        <div className="col-md-12">
          <PredictionComponent predictions={predictions} />
        </div>
      </div>
  
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center">Baseline Data</h5>
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
                <p className="text-center">No baseline data found.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center">Weight Monitoring per Visit</h5>
              <div style={{ overflow: 'auto' }}> 
              <LineChart data={combinedData} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
            <div className="row mb-3">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center">Follow-Up Test Results</h5>
              {testResults.length > 0 ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Clinic Visit</th>
                      {/* Generating column headers for each unique date */}
                      {testResults.map((result, index) => {
                        return (
                          <th key={index}>
                            {`Clinic Visit ${index + 1} (${new Date(result.eventDate).toLocaleDateString()})`}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Test Result</td>
                      {/* Populating test results per visit */}
                      {testResults.map((result, index) => (
                        <td key={index}>{result.result}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-center">No follow-up test results found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title text-center">Map Showing the Patient's Location and Proximity to Hotspots</h5>
              <MapContainer
                ref={mapRef}
                center={
                  gisCoordinates && matchedOrgUnitGeofeature
                    ? [
                        (gisCoordinates[0] + matchedOrgUnitGeofeature.latitude) / 2,
                        (gisCoordinates[1] + matchedOrgUnitGeofeature.longitude) / 2,
                      ]
                    : [0.3411804, 32.5774869]
                }
                zoom={10}
                style={{ height: '600px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {gisCoordinates && <Marker position={gisCoordinates} icon={patientIcon} />}
                <HotspotProcessor setHeatmapData={setHeatmapData} />




                {districts && (
                  <GeoJSON
                    data={districts}
                    style={styleDistrict}
                    onEachFeature={(feature, layer) => {
                      layer.on({
                        click: () => {
                          setSelectedDistrict(feature.properties.name);
                        },
                      });
                      layer.bindPopup(feature.properties.name);
                    }}
                  />
                )}
                {matchedOrgUnitGeofeature && (
                  <Marker
                    key={currentOrgUnit.id}
                    position={[matchedOrgUnitGeofeature.latitude, matchedOrgUnitGeofeature.longitude]}
                    icon={L.divIcon({
                      className: 'org-unit-marker',
                      html: `<div style="background-color: white; color:black; padding: 5px; border-radius: 5px; text-align:center;">TB Clinic</div>`,
                      iconSize: [80, 20],
                    })}
                  >
                    <Popup>{matchedOrgUnitGeofeature.displayName}</Popup>
                  </Marker>
                )}

            {parishes && (
                <GeoJSON
                  data={parishes}
                  style={(feature) => ({
                    color: "#ff7800", // Customize as needed
                    weight: 2,
                    opacity: 0.7,
                    fillOpacity: 0,
                  })}
                  onEachFeature={(feature, layer) => {
                    layer.bindPopup(feature.properties.name); // Assuming the GeoJSON has a property 'name'
                  }}
                />
              )}
              </MapContainer>
              {distanceToOrgUnit !== null && (
                <div className="text-center mt-3">
                  <h5>Distance to TB Clinic: {Math.round(distanceToOrgUnit * 100) / 100} kms</h5>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
};  

export default TrackedEntityDetails;