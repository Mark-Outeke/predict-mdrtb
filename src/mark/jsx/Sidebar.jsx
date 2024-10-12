import React from 'react';
import './Sidebar.css'; // Create a CSS file for sidebar styling

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h2>Menu</h2>
      <ul>
        <li><a href="/link1">Predictions</a></li>
        <li><a href="/link2">Appointments</a></li>
        <li><a href="/link3">Model Explanantions</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;
