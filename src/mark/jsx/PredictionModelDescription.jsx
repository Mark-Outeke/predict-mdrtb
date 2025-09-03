// src/mark/jsx/PredictionModelDescription.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const PredictionModelDescription = () => {
  return (
    <div className="App_mainCenterCanva">
      <Header />
      <div className="layout">
        <Sidebar />
        <div style={{
          marginLeft: '270px',
          marginTop: '90px',
          padding: '30px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          minHeight: 'calc(100vh - 90px)',
          borderRadius: '20px 0 0 0',
        }}>
          <div className="fade-in">
            {/* Hero Section */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px',
              padding: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              color: 'white',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
            }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: '800', 
                marginBottom: '20px',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
              }}>
                🤖 MDR-TB Prediction Model
              </h1>
              <p style={{ 
                fontSize: '1.2rem', 
                opacity: 0.9,
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Advanced machine learning for early detection and prevention of Multi-Drug Resistant Tuberculosis
              </p>
            </div>
            
            {/* Model Diagram */}
            <div style={{
              textAlign: 'center',
              marginBottom: '40px',
              background: 'white',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            }}>
              <img 
                src="/proposed dhis2ecbss environmtnt.png"
                alt="Prediction Model Architecture" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              />
            </div>
            
            {/* Content Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '25px',
              marginBottom: '40px',
            }}>
              {/* How it Works Card */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '3rem' }}>⚡</span>
                </div>
                <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.5rem', fontWeight: '700' }}>
                  How It Works
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.7', marginBottom: '20px' }}>
                  The prediction model leverages machine learning techniques to assess the likelihood of
                  a patient developing MDR-TB (Multi-Drug Resistant Tuberculosis).
                </p>
                <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                  Several factors are considered in the model, including patient demographics, historical 
                  health data, and results from recent tests. By analyzing patterns in this data, the 
                  model can identify high-risk individuals and provide predictions with a certain degree of 
                  confidence.
                </p>
              </div>

              {/* Training Data Card */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '3rem' }}>📊</span>
                </div>
                <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.5rem', fontWeight: '700' }}>
                  Training Data
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                  The model was trained using a large dataset of patients who have previously been diagnosed 
                  with tuberculosis. This data includes multiple attributes, such as age, sex, clinical 
                  history, and biological markers.
                </p>
              </div>

              {/* Accuracy Card */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '3rem' }}>🎯</span>
                </div>
                <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.5rem', fontWeight: '700' }}>
                  Model Accuracy
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                  After thorough testing and validation, the model demonstrates a strong accuracy rate in 
                  identifying patients who may benefit from more intensive monitoring and treatment plans. 
                  It aims to assist healthcare providers in making informed decisions and improving patient 
                  outcomes.
                </p>
              </div>

              {/* Continuous Improvement Card */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '3rem' }}>🔄</span>
                </div>
                <h3 style={{ color: '#1e293b', marginBottom: '15px', fontSize: '1.5rem', fontWeight: '700' }}>
                  Continuous Updates
                </h3>
                <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                  Continuous updates and refinements of the model are performed as more data becomes available, 
                  ensuring that predictions remain reliable and relevant in changing healthcare landscapes.
                </p>
              </div>
            </div>
            
            {/* GitHub Link Card */}
            <div style={{
              background: 'linear-gradient(135deg, #24292e 0%, #1e2328 100%)',
              borderRadius: '16px',
              padding: '30px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            }}>
              <h3 style={{ marginBottom: '15px', fontSize: '1.5rem', fontWeight: '700' }}>
                🔗 View Source Code
              </h3>
              <p style={{ marginBottom: '25px', opacity: 0.9, lineHeight: '1.6' }}>
                The complete model implementation is available on GitHub. Explore the code, contribute, 
                or adapt it for your own research.
              </p>
              <a 
                href="https://github.com/Mark-Outeke/Model/blob/main/DeepNN_Model.py" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: '12px 30px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                🚀 View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionModelDescription;
