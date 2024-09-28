import React, { useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useTrackedEntity } from 'TrackedEntityContext'; // Import your existing context

const PredictionComponent = () => {
  const { trackedEntityData } = useTrackedEntity(); // Get tracked entity data from context
  const [predictions, setPredictions] = useState([]);

  const runPrediction = async () => {
    if (!trackedEntityData) return; // Ensure there's data before processing

    // Use trackedEntityData from context
    const jsonData = trackedEntityData;
    console.log('Json Data for Prediction:', jsonData); // Log JSON data being processed

    // Step 1: Extract data elements for categorical and numeric columns
    const categoricalColumns = ['FZMwpP1ncnZ',	'vvlAUOFU1lc',	'WqWIsCuYw14',
      	'G0m1TnJ9CaB',	'OZkvrZWZL0u',	'zJWyXO06Rhi',	'luQQ9zNTgFM',	'x7uZB9y0Qey',
        'aNj8BNicATN',	'pYsPUUxPn3v',	'FklL99yLd3h',	'EeE2uJluiAY',	'pg6UUMn87eM',
        'H85OvvFGG6i',	'b801bG8cIxt',	't6qq4TXSE7n',	'Wbp0DL9fQYj',	'DHPzkmTcDUv',
        'EoO16H5lLK5',	'YwZN88UJ98d',	'axDtvPeYL2Y',	'hZ4HR3lEOWm',	'UtGpqsuTmrD',
        'rluc10OPm1I',	'jNdLczMvDPT',	'iUyb0JGgeqn',	'k5LrUGjAGD5',	'EDFvw8DsJuH',
        'WLqYnkV6qx1',	'P9DY4UW3BTo',	'e0mTEFrXZDh',	'YhHeRvXzmXJ',	'CxdzmL6vtnx',
        'HHf4Vff0Xrx',	'LRzaAyb2vGk',	'U4jSUZPF0HH',	'f0S6DIqAOE5',	'ywUNEl0vi3Y',
        'K1JiyL94mCT',	'dtRfCJvzZRF',	'cdGuoKHI3fp',	'U0s0Hul9lmX',	'hDaev1EuehO',
        'P6eKotYRIvT',	'mDmVRrzihu0',	'UGznqHuXC8A',	'rHEeM6ha268',	'pDR49oOtJrc',	
        'Jl3oWFGGt1U',	'pDoTShM62yi',	'RTKE58980U7',	'IGv6SjkM162',	'fOnOoUvD03d',	
        'QzfjeqlwN2c',	'ig3ZDT8Mgus',	'nVaN4Cpoe9Z',	'BQ2qwbH5WXi',	'KAykkHp1p2F',		
        'QcjaZKRl9D4',	'lpJPqjVUToo',	'Aw9p1CCIkqL',	'pD0tc8UxyGg',	'fhEVXFPNNUc',		
        'F5P1buF4RHP',	'XzNqEEXo00j',  'Ep0hN5HdQKS',  'omFhxVHAHW8',  'sVFokCQ8LTV',
]; // Replace with actual IDs

    const numericColumns = [
    'E0oIYbS2lcV','uIlwmJ26a6N','XHkluF3EAg0',
    'HzhDngURGLk','vZMCHh6nEBZ','Gy1jHsTp9P6',
    'Rj4uJOP4t96','DDzcOBJwRnC','Ghsh3wqVTif',
    'WBsNDNQUgeX','Dq2CKpBrLem','CpNmdkKzz8O',
    'xcTT5oXggBZ','XwVhny4B7EV','dfNv7RZKIml',
                          ];

    const extractDataElements = (data, categoricalColumns, numericColumns) => {
      let extractedData = {};
    
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const instance = data[key]; // Access the instance by key
    
          // Access enrollments if they exist
          if (instance.enrollments && Array.isArray(instance.enrollments)) {
            instance.enrollments.forEach(enrollment => {
              // Access events within each enrollment
              if (enrollment.events && Array.isArray(enrollment.events)) {
                enrollment.events.forEach(event => {
                  if (event.dataValues && Array.isArray(event.dataValues)) {
                    event.dataValues.forEach(dataValue => {
                      // Check if the dataElement is in categorical or numeric columns
                      if (categoricalColumns.includes(dataValue.dataElement) || numericColumns.includes(dataValue.dataElement)) {
                        // Initialize the array if it doesn't exist
                        if (!extractedData[dataValue.dataElement]) {
                          extractedData[dataValue.dataElement] = [];
                        }
                        // Add the value to the array
                        extractedData[dataValue.dataElement].push(dataValue.value);
                      }
                    });
                  }
                });
              }
            });
          }
        }
      }
      console.log('Extracted Data:', extractedData);
      return extractedData;
    };
    

    // Call to extract data elements from jsonData
    const processedData = extractDataElements(jsonData, categoricalColumns, numericColumns);
    console.log('Processed Data Elements for Prediction:', processedData);
    console.log('Number of elements extracted:', Object.keys(processedData).length);

    // Convert processedData into an array format suitable for label encoding and normalization
    const dataArray = [processedData]; // Wrap processedData in an array for processing

    // Label encode categorical columns
    const labelEncode = (data, categoricalColumns) => {
      const labelEncoders = {};

      categoricalColumns.forEach(col => {
        labelEncoders[col] = {};
        let label = 0;
        data.forEach(row => {
          const value = row[col];
          if (!(value in labelEncoders[col])) {
            labelEncoders[col][value] = label++;
          }
          row[col] = labelEncoders[col][value];
        });
      });

      return { data, labelEncoders };
    };

    const { data: labelEncodedData } = labelEncode(dataArray, categoricalColumns);

    // Normalize numeric data
    const normalizeData = (data, numericColumns) => {
      const stats = {};

      numericColumns.forEach(col => {
        const values = data.map(row => parseFloat(row[col])).filter(val => !isNaN(val));
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const std = Math.sqrt(values.map(val => Math.pow(val - mean, 2)).reduce((a, b) => a + b, 0) / values.length);

        stats[col] = { mean, std };

        data.forEach(row => {
          let val = parseFloat(row[col]);
          val = isNaN(val) ? 0 : (val - mean) / std;
          row[col] = val;
        });
      });

      return { data, stats };
    };

    const { data: normalizedData } = normalizeData(labelEncodedData, numericColumns);

    // Handle missing values
    const handleMissingValues = (data) => {
      data.forEach(row => {
        Object.keys(row).forEach(key => {
          if (row[key] == null || isNaN(row[key])) {
            row[key] = 0; // Replace missing or NaN with 0
          }
        });
      });

      return data;
    };

    const finalData = handleMissingValues(normalizedData);

    // Prepare input data
    const featureColumns = [...categoricalColumns, ...numericColumns];
    const inputData = finalData.map(row => {
      return featureColumns.map(col => row[col]);
    });

    // Step 3: Load the model from a pre-existing model.json file
    const model = await tf.loadLayersModel('/model.json');

    // Prepare input tensor
    const inputDataShape = [inputData.length, featureColumns.length];
    const inputTensor = tf.tensor2d(inputData, inputDataShape);
    console.log('Input Tensor Shape:', inputTensor.shape);
    // Make predictions
    const predictionsTensor = model.predict(inputTensor);
    const predictionValues = await predictionsTensor.array();

    // Set the predictions in the state
    setPredictions(predictionValues);
    console.log('Predictions:', predictionValues);
  };

  useEffect(() => {
    runPrediction(); // Run prediction when the component mounts
  }, );

  return (
    <table>
      <thead>
        <tr>
          <th>Prediction</th>
        </tr>
      </thead>
      <tbody>
        {predictions.map((prediction, index) => (
          <tr key={index}>
            <td>This patient has a {prediction[0].toFixed(2)}% chance of developing MDRTB</td>
            <td>These are features that contributed to his predcition </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PredictionComponent;
