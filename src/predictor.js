import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as dfd from 'danfojs';

const ModelPrediction = () => {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Step 1: Load TensorFlow.js model (created from Python and saved in TF.js format)
  const loadModel = async () => {
    const loadedModel = await tf.loadLayersModel('model.json');  // Replace with actual path
    setModel(loadedModel);
    console.log("Model loaded");
  };

  // Step 2: Process input data from the supplied JSON file
  const processInputData = async (jsonData) => {
    // Extract dataElements from the JSON
    const dataElements = jsonData.dataElements.map(de => ({
      id: de.dataElement,  // Assuming the "id" is the same as a column in your dataset
      value: de.value
    }));

    // Map dataElement ids to model features and prepare for input
    const featureIds = dataElements.map(de => de.id);
    const featureValues = dataElements.map(de => de.value);

    // Example processing steps for categorical and numeric columns
    const categoricalColumns = ["cat_column_1", "cat_column_2"]; // Your actual categorical columns
    const numericColumns = ["num_column_1", "num_column_2"];  // Your actual numeric columns

    // Label Encoding for categorical values
    const processedCategorical = categoricalColumns.map(col => {
      // Assuming you have a label encoder or mapping for these categories
      return labelEncode(col, featureValues[featureIds.indexOf(col)]);
    });

    // Scaling for numeric values (same as during model training)
    const processedNumeric = numericColumns.map(col => {
      const value = featureValues[featureIds.indexOf(col)];
      return (value - numericMean(col)) / numericStd(col);  // Replace with your model's training mean and std
    });

    // Combine processed categorical and numeric data
    const processedData = [...processedCategorical, ...processedNumeric];

    return tf.tensor([processedData], [1, processedData.length]);  // Shape (1, num_features)
  };

  // Step 3: Make predictions with the model
  const makePrediction = async (jsonData) => {
    if (!model) {
      console.error("Model not loaded");
      return;
    }

    // Process the input data for prediction
    const inputData = await processInputData(jsonData);

    // Make the prediction
    const prediction = model.predict(inputData);
    prediction.print(); // To visualize the output

    const predictedClass = prediction.argMax(-1).dataSync()[0];  // Extract the predicted class (index)
    setPrediction(predictedClass);
  };

  // Example JSON input
  const exampleJsonInput = {
    "dataElements": [
      { "dataElement": "cat_column_1", "value": "A" },
      { "dataElement": "num_column_1", "value": 23 },
      { "dataElement": "cat_column_2", "value": "B" },
      { "dataElement": "num_column_2", "value": 85 }
    ]
  };

  return (
    <div>
      <h1>Model Prediction</h1>

      {/* Step 1: Load the model */}
      <button onClick={loadModel}>Load Model</button>

      {/* Step 3: Make prediction */}
      <button onClick={() => makePrediction(exampleJsonInput)}>Make Prediction</button>

      {/* Display prediction result */}
      {prediction !== null && <div>Predicted Class: {prediction}</div>}
    </div>
  );
};

export default ModelPrediction;
