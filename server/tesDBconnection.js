// testDbConnection.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'dhis',       // Replace with your PostgreSQL username
  host: 'localhost',       // Replace with your DB host
  database: 'dhis2', // Replace with your database name
  password: '12345', // Replace with your password
  port: 5432,              // Default PostgreSQL port
});

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT * FROM public.analytics_event_wfd9k4dqvdr'); // Simple query to test connection
    console.log('Database connection successful:', res.rows);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await pool.end(); // Close the database pool connection
  }
};

testConnection();
