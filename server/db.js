const { Pool } = require('pg');

const pool = new Pool({
  user: 'dhis',
  host: 'localhost',
  database: 'dhis2',
  password: '12345',
  port: 5432,
});

module.exports = pool;