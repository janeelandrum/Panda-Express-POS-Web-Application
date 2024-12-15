const { Pool } = require('pg'); // Use require for importing
require('dotenv').config(); // Load environment variables from .env file

// Initialize a connection pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432, // Default to 5432 if not set
});

//console.log('DB_HOST:', process.env.DB_HOST);
//console.log('DB_USER:', pro