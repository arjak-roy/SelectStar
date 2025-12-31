const adminpool = require('../config/db').client;

//controller for admin to get all challenges
const createNewChallengeTable = async (req, res) => {
    let client;
    const createTableSql = req.body.sql;
    const tableName = req.body.tableName;
    try {
        client = await adminpool.connect();
        const result = await client.query(createTableSql);
        client.query(`INSERT INTO app_data.table_metadata (table_name) VALUES ($1)`, [tableName]);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send('Error retrieving challenges.');
    } finally {
        if (client) client.release();
    }
};

const insertintoChallengeTable = async (req, res) => {
    let client;
    const insertSql = req.body.sql;
    try {
        client = await adminpool.connect();
        const result = await client.query(insertSql);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send('Error inserting into challenge table.');
    } finally {
        if (client) client.release();
    }
};

const modifyChallengetable = async (req, res) => {
    // Implementation for modifying challenge table
    let client;
    const modifySql = req.body.sql;
    try {
        client = await adminpool.connect();
        const result = await client.query(modifySql);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).send('Error modifying challenge table.');
    } finally {
        if (client) client.release();
    }
}

const createNewChallenge = async (req, res) => {
    let client;
    const { title, description, difficulty, category, solution_sql, table_id } = req.body;    
    try {
        client = await adminpool.connect();
        const result = await client.query(
            'INSERT INTO app_data.challenges (title, description, difficulty, category, solution_sql, table_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [title, description, difficulty, category, solution_sql, table_id]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Error creating challenge.');
    } finally {
        if (client) client.release();
    }
};

const modifyChallenge = async (req, res) => {
    // Implementation for modifying a challenge
    let client;
    const challengeId = req.params.id;
    const { title, description, difficulty, category, solution_sql, table_id } = req.body;
    try {
        client = await adminpool.connect();
        const result = await client.query(
            'UPDATE app_data.challenges SET title = $1, description = $2, difficulty = $3, category = $4, solution_sql = $5, table_id = $6 WHERE id = $7 RETURNING *',
            [title, description, difficulty, category, solution_sql, table_id, challengeId]
        );
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Error modifying challenge.');
    } finally {
        if (client) client.release();
    }
}

const adminqueryExecution = async (req, res) => {
    let client;
    const sql = req.body.sql;
    try {
        client = await adminpool.connect();
        const result = await client.query(sql);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send('Error executing query.');
    } finally {
        if (client) client.release();
    }
};


module.exports = { createNewChallengeTable, insertintoChallengeTable, createNewChallenge, modifyChallenge, modifyChallengetable, adminqueryExecution };
