import React, { useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
//import {TabularLime} from 'lime-js'; // Import LIME for tabular data
//import * as tfvis from '@tensorflow/tfjs-vis';
import { useTrackedEntity } from 'TrackedEntityContext'; // Import your existing context
import tracker from 'mark/api/tracker';



const PredictionComponent = () => {
  const { trackedEntityData, updateTrackedEntity } = useTrackedEntity(); // Get tracked entity data from context
  const [predictions, setPredictions] = useState([]);
  const [featureContributions, setFeatureContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Track if predictions are running
  const [hasRunPredictions, setHasRunPredictions] = useState(false); // Track if predictions have been made
  const [averagePrediction, setAveragePrediction] = useState([]);
  const [highestAveragePrediction, sethighestAveragePrediction] = useState([]);
  const [predictedClass, setPredictedClass] = useState('');
  const [dataElementDisplayNames, setDataElementDisplayNames] = useState({}); // Mapping of IDs to display names
  const [error, setError] = useState(null);
  
  
  
  const runPrediction = useCallback(async () => {
    if (!trackedEntityData || hasRunPredictions) return; // Ensure there's data before processing

    // Use trackedEntityData from context
    const jsonData = trackedEntityData;

    // Step 1: Extract data elements for categorical and numeric columns
    const categoricalColumns = [
      'FZMwpP1ncnZ', 'vvlAUOFU1lc', 'WqWIsCuYw14',
      'G0m1TnJ9CaB', 'OZkvrZWZL0u', 'zJWyXO06Rhi', 'luQQ9zNTgFM', 'x7uZB9y0Qey',
      'aNj8BNicATN', 'pYsPUUxPn3v', 'FklL99yLd3h', 'EeE2uJluiAY', 'pg6UUMn87eM',
      'H85OvvFGG6i', 'b801bG8cIxt', 't6qq4TXSE7n', 'Wbp0DL9fQYj', 'DHPzkmTcDUv',
      'EoO16H5lLK5', 'YwZN88UJ98d', 'axDtvPeYL2Y', 'hZ4HR3lEOWm', 'UtGpqsuTmrD',
      'rluc10OPm1I', 'jNdLczMvDPT', 'iUyb0JGgeqn', 'k5LrUGjAGD5', 'EDFvw8DsJuH',
      'WLqYnkV6qx1', 'P9DY4UW3BTo', 'e0mTEFrXZDh', 'YhHeRvXzmXJ', 'CxdzmL6vtnx',
      'HHf4Vff0Xrx', 'LRzaAyb2vGk', 'U4jSUZPF0HH', 'f0S6DIqAOE5', 'ywUNEl0vi3Y',
      'K1JiyL94mCT', 'dtRfCJvzZRF', 'cdGuoKHI3fp', 'U0s0Hul9lmX', 'hDaev1EuehO',
      'P6eKotYRIvT', 'mDmVRrzihu0', 'UGznqHuXC8A', 'rHEeM6ha268', 'pDR49oOtJrc',
      'Jl3oWFGGt1U', 'pDoTShM62yi', 'RTKE58980U7', 'IGv6SjkM162', 'fOnOoUvD03d',
      'QzfjeqlwN2c', 'ig3ZDT8Mgus', 'nVaN4Cpoe9Z', 'BQ2qwbH5WXi', 'KAykkHp1p2F',
      'lpJPqjVUToo', 'Aw9p1CCIkqL', 'pD0tc8UxyGg', 'fhEVXFPNNUc',
      'F5P1buF4RHP', 'XzNqEEXo00j', 'Ep0hN5HdQKS', 'omFhxVHAHW8', 'sVFokCQ8LTV',
    ]; // Replace with actual IDs

    const numericColumns = [
      'E0oIYbS2lcV', 'uIlwmJ26a6N', 'XHkluF3EAg0',
      'HzhDngURGLk', 'vZMCHh6nEBZ', 'Gy1jHsTp9P6',
      'Rj4uJOP4t96', 'DDzcOBJwRnC', 'Ghsh3wqVTif',
      'WBsNDNQUgeX', 'Dq2CKpBrLem', 'CpNmdkKzz8O',
      'xcTT5oXggBZ', 'XwVhny4B7EV', 'dfNv7RZKIml',
    ];

    const extractDataElements = (data, categoricalColumns, numericColumns) => {
      let extractedData = {};

      // Extracting data from enrollments
      if (data.enrollments && Array.isArray(data.enrollments)) {
        data.enrollments.forEach(enrollment => {
          if (enrollment.events && Array.isArray(enrollment.events)) {
            enrollment.events.forEach(event => {
              let eventData = {};
              if (event.dataValues && Array.isArray(event.dataValues)) {
                event.dataValues.forEach(dataValue => {
                  // Check if the dataElement is in specified columns
                  if (categoricalColumns.includes(dataValue.dataElement) || numericColumns.includes(dataValue.dataElement)) {
                    // Initialize array for the dataElement if it doesn't exist
                    if (!eventData[dataValue.dataElement]) {
                      eventData[dataValue.dataElement] = [];
                    }
                    // Push the value to the corresponding array
                    eventData[dataValue.dataElement].push(dataValue.value);
                  }
                });
              }
              extractedData[event.event] = eventData;
            });
          }
        });
      }

      // Log the extracted data
      console.log('Extracted Data:', extractedData);

      // Initialize processedData as an array to store events
      const processedData = [];

      // Iterate over extractedData to combine values for each data element per event
      Object.entries(extractedData).forEach(([eventName, eventData]) => {
        // Create an object for each event
        const eventEntry = {};

        Object.entries(eventData).forEach(([dataElement, values]) => {
          // Store data elements and their values for the current event
          eventEntry[dataElement] = values;
        });

        // Push the current event entry into processedData
        processedData.push({ event: eventName, data: eventEntry });
      });

      console.log('Processed Data per Event:', processedData); // Log the new structured output

      return processedData; // Return the consolidated data
    };

    // Extract data elements from jsonData
    const processedData = extractDataElements(jsonData, categoricalColumns, numericColumns);
    console.log('Final Processed Data:', processedData);

    if (!Array.isArray(processedData) || processedData.length === 0) {
      console.error("Invalid processed data structure:", processedData);
      return; // Early exit if the data is invalid
    }

    // Convert processedData into an array format suitable for label encoding and normalization
    const dataArray = processedData;

    const loadLabelEncoders = async () => {
      const response = await fetch('/label_encoders.json');
      const labelEncoders = await response.json();
      return labelEncoders;
    };

    // Label encode categorical columns
    const labelEncode = async (data, categoricalColumns) => {
      const labelEncoders = await loadLabelEncoders();

      categoricalColumns.forEach(col => {
        if (labelEncoders[col]) { // Only process columns that have encoders
          data.forEach(row => {
            const originalValue = row.data[col];
            //console.log(`original value for ${col}:`, originalValue, `Type: ${typeof originalValue}`);

            // If the value exists in the encoder mapping, substitute it
            if (originalValue in labelEncoders[col]) {
              row.data[col] = labelEncoders[col][originalValue];
              //console.log(`encoded value for ${col}:`, row.data[col], `Type: ${typeof row.data[col]}`);
            } else {
              row.data[col] = 0; // Handle unknown values
              //console.log(`Unknown Value for ${col}. Set to 0.`);
            }
          });
        }
      });
      //console.log('Encoded Data Before Scaling/Normalization:', JSON.stringify(data, null, 2));
      //console.log ('Encoded Data:', data);
      return { data, labelEncoders }; // Data retains the reference to encoder mappings
    };

    const { data: labelEncodedData } = await labelEncode(dataArray, categoricalColumns);

    // Normalize numeric data
    const normalizeData = (data, numericColumns) => {
      const stats = {};

      if (!Array.isArray(data)) {
        console.error("Expected data to be an array, but got:", data);
        return { data: [], stats };
      }

      numericColumns.forEach(col => {
        const values = data.map(row => parseFloat(row.data[col]?.[0] || 0)).filter(val => !isNaN(val));

        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const std = Math.sqrt(values.map(val => Math.pow(val - mean, 2)).reduce((a, b) => a + b, 0) / values.length);

          stats[col] = { mean, std };

          data.forEach(row => {
            let val = parseFloat(row.data[col]);
            val = isNaN(val) ? 0 : (val - mean) / std;
            row.data[col] = val;
          });
        }
      });

      return { data, stats };
    };

    const { data: normalizedData } = normalizeData(labelEncodedData, numericColumns);

    // Handle missing values
    const handleMissingValues = (data) => {
      data.forEach(row => {
        Object.keys(row.data).forEach(key => {
          if (row.data[key] === undefined || row.data[key] === null) {
            row.data[key] = 0; // Impute missing values with 0
          }
        });
      });

      return data;
    };

  
      
      const finalData = handleMissingValues(normalizedData);
    
      const extractTensorInputs = (finalData) => {
        // This function will now return only the first row
        return finalData.map(row=> Object.values(row.data));
        
      };
    
      // Assuming finalData is available and processed
      const tensorInputs = extractTensorInputs(finalData);
      console.log('tensorInputs:', tensorInputs);
      
      
      const loadModel = async () => {
        try {
          const model = await tf.loadLayersModel('/model.json', {weights: 'weights.json'});
          return model;
        } catch (error) {
          console.error('Error loading the TensorFlow model:', error);
          return null;
        }
      };
      // Load TensorFlow model
      const model = await loadModel();
      if (model) {
          console.log('Running Predictions...');
        // Step 3: Initialize LIME explainer
        
        

        // Loop through each tensor input and make predictions
          const predictions = [];

          const contributions = []; // Store contributions for each prediction

          //const allDataElements = [...categoricalColumns, ...numericColumns];
              
          for (let i = 0; i < tensorInputs.length; i++) {
            const inputTensor = tensorInputs[i]; // Create a tensor for the current row
            const reshapedInput = tf.tensor(inputTensor).reshape([1, 1, 82]);
            console.log('length',reshapedInput.size); // Should be 82
            console.log('reshaped',reshapedInput.shape); // Should be [1, 1, 82]
            const outputTensor = model.predict(reshapedInput);
              // Get the prediction for the current row 
            const predictionArray = outputTensor.arraySync(); // Extract array
            console.log(predictions);

            
              // If your model is binary classification with two outputs
              // You may need to check the output shape
              const predictionValue = predictionArray[0]; // Get the first output class probabilities

              // For binary classification, usually, you only need the probability for class 1:
              if (predictionValue.length === 2) {
                  predictions.push(predictionValue[1]); // Assuming the second index corresponds to class 1
              } else {
                  predictions.push(predictionValue[0]); // Single output case
              }
            //contributions by feature. find appropriate way to get contribution by features**********************
    
               

                contributions.push(featureContributions); // Store contributions for current prediction
              }

      
      const averagePrediction = predictions.reduce((acc, curr) => 
        acc.map((val, idx) => val + curr[idx]), Array(predictions[0].length).fill(0)
    ).map(val => val / predictions.length);
    
    //console.log('Single average prediction over all events:', averagePrediction);
    // Find the index of the class with the highest average prediction
    const highestPredictionIndex = averagePrediction.indexOf(Math.max(...averagePrediction));

    // Get the highest average prediction value
    const highestAveragePrediction = averagePrediction[highestPredictionIndex];
    
    //console.log(highestAveragePrediction);
    
    // Determine predicted class based on average prediction
    const predictedClass = highestAveragePrediction[0] > 0.5 ? 'YES' : 'NO';
    setPredictedClass(predictedClass)
    console.log('Predicted Class:', predictedClass);
  

      setPredictions(predictions);
      setFeatureContributions(contributions);
      setAveragePrediction(averagePrediction);
      setPredictedClass(predictedClass);
      sethighestAveragePrediction(highestAveragePrediction);

      updateTrackedEntity({predictions});
      setIsLoading(false); // Mark predictions as complete
      setHasRunPredictions(true)
      return;}
      
}, [trackedEntityData,hasRunPredictions,updateTrackedEntity,featureContributions]);
   

useEffect(() => {
  if (trackedEntityData && !hasRunPredictions ) {
     runPrediction();
  }
},[trackedEntityData, hasRunPredictions, runPrediction]);
// Function to fetch display names from API
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
}, []);

// Mapping feature contributions to display names
const mapFeatureContributionsToDisplayNames = (featureContributions) => {
  if(!Array.isArray(featureContributions)){
    return[];
  }
  return featureContributions.map(contribution => {
    return contribution.map(value => ({
      ...value,
      featureDisplayName: dataElementDisplayNames[value.featureId] || `Unknown Feature (ID: ${value.featureId})` // Fallback to "Unknown" if not found
    }));
  });
};

const mappedFeatureContributions = mapFeatureContributionsToDisplayNames(featureContributions);


  return (
  <div>
    <h1>Predictions</h1>
    {isLoading ? (
      <p>Loading predictions...</p>
    ) : error ? (
      <p style={{ color: 'red' }}>{error}</p> // Display the error message
    ) : (
      <>
        <p><strong>Average Prediction:</strong> {JSON.stringify(averagePrediction)}</p>
        <p><strong>Final Prediction Probability:</strong> {highestAveragePrediction}</p>
        <p><strong>Patient Likely to Develop MDRTB:</strong> {predictedClass}</p>

        <h2>Predictions List</h2>
        <ul>
          {predictions.length > 0 ? (
            predictions.map((prediction, index) => (
              <li key={index}>Prediction {index + 1}: {prediction}</li>
            ))
          ) : (
            <li>No predictions available.</li>
          )}
        </ul>

        <h2>Feature Contributions</h2>
        
        {mappedFeatureContributions && mappedFeatureContributions.length > 0 ? (
          mappedFeatureContributions.map((contribution, index) => (
            <div key={index}>
              <h3>Prediction {index + 1}</h3>
              <table border="1" cellPadding="5">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {contribution.map((value, idx) => (
                    <tr key={idx}>
                      <td>{value.featureDisplayName} (ID: {value.featureId})</td>
                      <td>{value.contribution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No feature contributions available.</p>
        )}
      </>
    )}
  </div>
);
};

export default PredictionComponent;