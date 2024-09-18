// server.js
const express = require('express');
const pool = require('./db'); // Import the database connection
const cors = require('cors');
const apiRoutes = require('./api'); // Import your other API routes

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware for JSON parsing

// Define the instance details route
app.get('/api/instance-details/:instanceId', async (req, res) => {
  const { instanceId } = req.params;

  try {
    const query = `SELECT * FROM public.analytics_event_wfd9k4dqvdr WHERE tei = $1`; // Use appropriate column name that matches your table
    const result = await pool.query(query, [instanceId]);

    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ message: 'Instance details not found' });
    }
  } catch (error) {
    console.error("Error fetching instance details: ", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Use additional API routes with the base path /api
app.use('/api', apiRoutes); // This line can be used to include other routes in your API

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
