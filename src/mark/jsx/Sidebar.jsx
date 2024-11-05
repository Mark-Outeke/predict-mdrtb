import React from 'react';
import './Sidebar.css'; // Create a CSS file for sidebar styling



const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><a href="/predictionModelDescription">Predictions Model</a></li>
        
        <li><a href="/link3">Model Explanantions</a></li>

        <li><a href="/link2">Appointments</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
