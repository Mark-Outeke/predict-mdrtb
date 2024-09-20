




// src/api.js
import axios from 'axios';

export const fetchTrackedEntityInstancesAndOrgUnits = async () => {

  const orgUnits = ['Q6qNTXu3yRx', 'GuJvMV22ihs', 'yApOnywci25']; // Array of orgUnit IDs

  try {
    // Use Promise.all to fetch data for all org units concurrently
    const allResponses = await Promise.all(
      orgUnits.map(async (orgUnitId) => {
        const response = await axios.get('http://localhost:8080/dhis2-stable-40.4.1/api/trackedEntityInstances.json', {
          params: {
            paging: false,
            fields: '*',
            trackedEntityType: 'MCPQUTHX1Ze',
            //program: 'wfd9K4dQVDR',
            ou: orgUnitId, // Dynamic org unit ID
          },
          headers: {
            Authorization: 'Basic ' + btoa('admin:district'), // Ensure proper encoding
          },
        });

        return {
          orgUnitId,
          trackedEntityInstances: response.data.trackedEntityInstances,
        };
      })
    );

    // Combine instances from all org units into one array
    const combinedTrackedEntityInstances = allResponses.reduce((acc, response) => {
      return acc.concat(response.trackedEntityInstances);
    }, []);

    // Array to store all fetched org units
    const allOrgUnits = orgUnits;

    return {
      trackedEntityInstances: combinedTrackedEntityInstances,
      allOrgUnits,
    };
  } catch (error) {
    console.error('Error fetching tracked entity instances and org units:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};
// Call the function and handle the returned promise
fetchTrackedEntityInstancesAndOrgUnits()
  .then((data) => {
    console.log('Fetched Data:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });


// Function to fetch DHIS2 events and data elements with their values

export const fetchInstanceDetails = async (trackedEntityInstanceId) => {
  try {
    const response = await axios.get(`http://localhost:8080/dhis2-stable-40.4.1/api/trackedEnityInstances/${trackedEntityInstanceId}.json?fields=enrollments[events]`, {
      
      headers: {
        Authorization: 'Basic ' + btoa('admin:district'), // Replace with actual credentials
      },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Rethrow the error for handling in the calling component
  }
};
window.fetchInstanceDetails = fetchInstanceDetails;


// Add other functions for different API calls as needed

//Function to load the model data from model.json
export const loadModel = async () => {
  try {
    const response = await fetch('/model.json'); // Assuming model.json is in the root directory
    const modelData = await response.json();
    return modelData;
  } catch (error) {
    console.error('Error loading model:', error);
    // Optionally throw an error to handle loading failures gracefully
    // throw new Error('Model loading failed');
  }
};