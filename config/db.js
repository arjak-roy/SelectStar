const { Pool } = require('pg');

const client = new Pool({
    // user: process.env.ADMIN_USER || '',
    // host: process.env.DB_HOST || '',
    // database: process.env.DB_NAME || '',
    // password: process.env.ADMIN_PASS || '',
    // port: 5432,
    // statement_timeout: 1000, // 1 seconds
    connectionString: process.env.ADMINCONNECTIOION,
    statement_timeout: 1000
});

const studentpool = new Pool({
    // user: process.env.STUDENT_USER || '',
    // host: process.env.DB_HOST || '',
    // database: process.env.DB_NAME || '',
    // password: process.env.STUDENT_PASS || '',
    // port: 5432,
    // statement_timeout: 2000, // 1 seconds
    connectionString: process.env.STUDENTCONNECTION,
    statement_timeout: 2000
});

module.exports = { client, studentpool };