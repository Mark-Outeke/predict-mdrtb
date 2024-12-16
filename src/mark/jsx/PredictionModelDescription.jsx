// src/mark/jsx/PredictionModelDescription.jsx
import React from 'react';
import Header from './Header'; // Assuming you have a Header component
//import './PredictionModelDescription.css'; // Assuming you want separate style for this component

const PredictionModelDescription = () => {
  return (
    <div className="App_mainCenterCanva">
      <Header />
      {/* Add an image above the title */}
      <div className="image-container" style={{ textAlign: 'center', margin: '20px 0' }}>
        <img 
          src="/proposed dhis2ecbss environmtnt.png" // Replace with your image path
          alt="Prediction Model Diagram" 
          style={{ maxWidth: '100%', height: 'auto', borderRadius: '10px' }} 
        />
      </div>
      
      <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '30px', textAlign: 'center' }}>
        How the Prediction Model Works
      </h1>
      
      <div className="container mt-4">
        <p>
          The prediction model leverages machine learning techniques to assess the likelihood of
          a patient developing MDR-TB (Multi-Drug Resistant Tuberculosis).
        </p>
        
        <p>
          Several factors are considered in the model, including patient demographics, historical 
          health data, and results from recent tests. By analyzing patterns in this data, the 
          model can identify high-risk individuals and provide predictions with a certain degree of 
          confidence.
        </p>
        
        <p>
          The model was trained using a large dataset of patients who have previously been diagnosed 
          with tuberculosis. This data includes multiple attributes, such as age, sex, clinical 
          history, and biological markers.
        </p>
        
        <p>
          After thorough testing and validation, the model demonstrates a strong accuracy rate in 
          identifying patients who may benefit from more intensive monitoring and treatment plans. 
          It aims to assist healthcare providers in making informed decisions and improving patient 
          outcomes.
        </p>
        
        <p>
          Continuous updates and refinements of the model are performed as more data becomes available, 
          ensuring that predictions remain reliable and relevant in changing healthcare landscapes.
        </p>
        
        <p>
          The code for the model is in Python and can be found in the GitHub repository:
          <a href="https://github.com/Mark-Outeke/Model/blob/main/DeepNN_Model.py" target="_blank" rel="noopener noreferrer"> View Code</a>
        </p>
      </div>
    </div>
  );
};

export default PredictionModelDescription;
