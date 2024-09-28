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

    // Step 1: Extract data elements for categorical and numeric columns
    const categoricalColumns = ['EoO16H5lLK5', 'nVaN4Cpoe9Z', 'jNdLczMvDPT', 
      'OZkvrZWZL0u', 'pYsPUUxPn3v', 'LRzaAyb2vGk', 'dtRfCJvzZRF', 'FZMwpP1ncnZ',
      'z2NcMr02XJs', 'Aw9p1CCIkqL', 'P6eKotYRIvT', 'BQ2qwbH5WXi', 'vvlAUOFU1lc',
      'iUyb0JGgeqn', 'fOnOoUvD03d', 'kvQ0Wz3ZqFr', 'mDmVRrzihu0', 'YSjR80QKKXo',
      'YwZN88UJ98d', 'zJWyXO06Rhi', 'b801bG8cIxt', 'lpJPqjVUToo', 'YhHeRvXzmXJ',
      'f0S6DIqAOE5', 'CxdzmL6vtnx', 't6qq4TXSE7n', 'UtGpqsuTmrD', 'cdGuoKHI3fp',
      'EDFvw8DsJuH', 'hDaev1EuehO', 'Bivxg5n4goz', 'sVFokCQ8LTV', 'EeE2uJluiAY',
      'F5P1buF4RHP', 'SRT2JzW4OFx', 'QzfjeqlwN2c', 'ig3ZDT8Mgus', 'aOHalAjOIrJ',
      'P9DY4UW3BTo', 'UGznqHuXC8A', 'omFhxVHAHW8', 'HHf4Vff0Xrx', 'WqWIsCuYw14',
      'FtWNuQmVu7j', 'pDoTShM62yi', 'XzNqEEXo00j', 'Wbp0DL9fQYj', 'pDR49oOtJrc',
      'Jl3oWFGGt1U', 'PZvOW11mGOq', 't1wRW4bpRrj', 'e0mTEFrXZDh', 'sQ4Z6lEiiq6',
      'hZ4HR3lEOWm', 'aNj8BNicATN', 'rHEeM6ha268', 'IGv6SjkM162', 'K1JiyL94mCT',
      'WLqYnkV6qx1', 'QcjaZKRl9D4', 'x7uZB9y0Qey', 'U0s0Hul9lmX', 'KAykkHp1p2F',
      'fhEVXFPNNUc', 'WWREUMZUm7z', 'rluc10OPm1I', 'FklL99yLd3h', 'TFS9P7tu6U6',
      'Ep0hN5HdQKS', 'DHPzkmTcDUv', 'pD0tc8UxyGg', 'eP1Yyb3h0ST', 'WoPIO7Jd8EL',
      'G0m1TnJ9CaB', 'CF6JasgPZtt', 'k5LrUGjAGD5', 'wD7EhGND4tu', 'EpvHxcDmxyT',
      'axDtvPeYL2Y', 'WTz4HSqoE5E', 'H85OvvFGG6i', 'ywUNEl0vi3Y', 'pg6UUMn87eM',
      'JCdqUjZZuvx', 'THirpMvAHgw', 'luQQ9zNTgFM', 'RTKE58980U7', 'U4jSUZPF0HH','J5kKvyU8mpY']; // Replace with actual IDs

    const numericColumns = ['DDzcOBJwRnC', 'OjPmMe220KO', 'uIlwmJ26a6N', 
       'CXUI1Yrr9gd', 'XHkluF3EAg0', 'Rj4uJOP4t96', 'E0oIYbS2lcV', 'j9lDBfNNXlz', 
       'XwVhny4B7EV', 'R0uqGCHWq4M', 'CpNmdkKzz8O', 'HzhDngURGLk', 'dfNv7RZKIml', 
       'vZMCHh6nEBZ', 'WBsNDNQUgeX', 'Ghsh3wqVTif', 'xcTT5oXggBZ', 'Dq2CKpBrLem'];

    const extractDataElements = (data, categoricalColumns, numericColumns) => {
      let extractedData = {};

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const instance = data[key]; // Access the instance by key

          // Access the events if they exist
          if (instance.events && Array.isArray(instance.events)) {
            instance.events.forEach(event => {
              if (event.dataValues && Array.isArray(event.dataValues)) {
                event.dataValues.forEach(dataValue => {
                  // Check if the dataElement is in categorical or numeric columns
                  if (categoricalColumns.includes(dataValue.dataElement) || numericColumns.includes(dataValue.dataElement)) {
                    extractedData[dataValue.dataElement] = dataValue.value;
                  }
                });
              }
            });
          }
        }
      }

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
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PredictionComponent;
