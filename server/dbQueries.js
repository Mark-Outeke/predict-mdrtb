// src/server/dbQueries.js
const pool = require('./dbPool'); // Import your pool configuration

const fetchAnalyticsEvents = async () => {
  try {
    const res = await pool.query('SELECT * FROM public.analytics_event_wfd9k4dqvdr');
    return res.rows; // Return the rows from the query
  } catch (err) {
    console.error('Database query error:', err);
    throw err; // Propagate the error
  }
};

module.exports = { fetchAnalyticsEvents };
