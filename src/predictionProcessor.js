import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useTrackedEntity } from 'TrackedEntityContext'; // Import your existing context
//import LimeTabularExplainer from 'lime-js';

const PredictionComponent = () => {
  const { trackedEntityData } = useTrackedEntity(); // Get tracked entity data from context
  const [predictions, setPredictions] = useState([]);
  const [featureContributions, setFeatureContributions] = useState([]);

  const runPrediction = async () => {
    if (!trackedEntityData) return; // Ensure there's data before processing

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
    
        // Loop through each tensor input and make predictions
          const predictions = [];
          const contributions = []; // Store contributions for each prediction
    
          for (let i = 0; i < tensorInputs.length; i++) {
            const inputTensor = tensorInputs[i]; // Create a tensor for the current row
          
        
            
            const reshapedInput = tf.tensor(inputTensor).reshape([1, 1, 82]);
            console.log('length',reshapedInput.size); // Should be 82
            console.log('reshaped',reshapedInput.shape); // Should be [1, 1, 82]
            
            
        
            const outputTensor = model.predict(reshapedInput);
              // Get the prediction for the current row
            predictions.push(outputTensor.arraySync());

            
        
              // Explain predictions for the current row
          //const explanation = await explainPredictions([finalData[i]], model);
          //contributions.push(explanation);
      }
    
      setPredictions(predictions);
      setFeatureContributions(contributions);

      return;
      }
    };
    /*
   // Function to explain predictions using LIME
   const explainPredictions = async (data, model) => {
    const explainer = new LimeTabularExplainer(data[0].data, { // Pass the first row as a reference
      mode: 'classification', // Use 'regression' if your model is a regression model
      feature_names: Object.keys(data[0].data), // Use feature names from data
      class_names: ['Class 1', 'Class 2'], // Update with your actual class names
      discretize_continuous: true, // Set this as per your data
    });

    const explanations = [];
    
    // Loop through predictions for explaining individual predictions
    for (let i = 0; i < predictions.length; i++) {
      const explainerInstance = await explainer.explainInstance(data[i].data, model.predict.bind(model), 10);
      explanations.push(explainerInstance.as_html()); // Store explanation as HTML
    }
    
    return explanations; // return the array of explanations
  };*/

useEffect(() => {
  runPrediction();
},);

  return (
    <div>
      <h1>Predictions</h1>
      <ul>
        {predictions.map((prediction, index) => (
          <li key={index}>Prediction {index + 1}: {prediction}</li>
        ))}
      </ul>
      {/* Render Feature Contributions */}
      <h2>Feature Contributions</h2>
      <div>
        {featureContributions.map((contribution, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: contribution }} /> // Render HTML safely
        ))}
      </div>
    </div>
  );
};

export default PredictionComponent;