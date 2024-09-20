// mlModelLoader.js
import * as tf from '@tensorflow/tfjs';

// Async function to load the model
export const loadModel = async () => {
  try {
    // Replace 'path/to/model.json' with the actual path where your model is stored
    const model = await tf.loadLayersModel('/model.json');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    throw error;
  }
};
