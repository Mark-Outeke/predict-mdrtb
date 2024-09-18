



// src/server/api.js
const express = require('express');
const { fetchAnalyticsEvents } = require('./dbQueries');
const router = express.Router();

router.get('/events', async (req, res) => {
  try {
    const events = await fetchAnalyticsEvents();
    res.json(events); // Send the data back as JSON
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
