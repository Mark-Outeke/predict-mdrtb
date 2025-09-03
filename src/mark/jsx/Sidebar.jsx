import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>📊 Analytics</h2>
        <p className="sidebar-subtitle">Explore insights and predictions</p>
      </div>
      <nav>
        <ul>
          <li>
            <a href="/predictionModelDescription">
              <span className="icon">🤖</span>
              <span className="text">Prediction Model</span>
            </a>
          </li>
          <li>
            <a href="/link3">
              <span className="icon">📈</span>
              <span className="text">Model Explanations</span>
            </a>
          </li>
          <li>
            <a href="/">
              <span className="icon">👥</span>
              <span className="text">Patient Records</span>
            </a>
          </li>
          <li>
            <a href="/predictionProcessor/">
              <span className="icon">⚡</span>
              <span className="text">Run Predictions</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <div className="stats-card">
          <h4>📋 Quick Stats</h4>
          <div className="stat-item">
            <span className="stat-label">Total Patients:</span>
            <span className="stat-value">1,247</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Cases:</span>
            <span className="stat-value">89</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
