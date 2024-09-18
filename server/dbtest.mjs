import express from 'express';
import cors from 'cors';
import pg from 'pg'; // For PostgreSQL, or use mysql2 for MySQL
const { Pool } = pg;


// Create Express app instance
const app = express();
app.use(cors()); // Enable CORS for your frontend

// Configure your PostgreSQL database connection
const pool = new Pool({
  user: 'dhis',
  host: 'localhost',
  database: 'dhis2',
  password: '12345',
  port: 5432, // Default PostgreSQL port
});

// API endpoint to fetch data
app.get('/data', async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query; // Get offset and limit from query parameters

    const result = await pool.query(
      'SELECT * FROM public.analytics_event_wfd9k4dqvdr LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.json({
      data: result.rows,
      total: result.rowCount, // Send total number of rows
      offset,
      limit
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

