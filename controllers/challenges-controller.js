const client  = require('../config/db').client;

// Helper to handle the repetition
const getChallenges = async (req, res) => {
    let clnt;
    try {
        clnt = await client.connect();
        
        // 2. We use app_data.challenges because that is where the table lives
        const result = await clnt.query(
            'SELECT id, title, description, difficulty, category FROM app_data.challenges ORDER BY id ASC'
        );
        console.log(result.rows);
        
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving challenges.');
    } finally {
        if (clnt) clnt.release(); // Put the connection back in the pool, don't kill it!
    }
};

// Get challenge by ID
const getChallengesById = async (req, res) => {
    let clnt;
    try {
        clnt = await client.connect();
        const result = await clnt.query(
            `SELECT c.id, c.category, c.title, c.difficulty, string_agg(tm.table_name, ', ') AS required_tables , c.description FROM app_data.challenges c JOIN app_data.challengestotable tc ON c.id = tc.challenge_id JOIN app_data.table_metadata tm ON tc.table_id = tm.id WHERE c.id = $1 GROUP BY c.id, c.title, c.difficulty;`,
            [req.params.id]
        );
        
        if (result.rows.length === 0) return res.status(404).send('Challenge not found');
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Error retrieving challenge.');
    } finally {
        if (clnt) clnt.release();
    }
};

// Sort by difficulty
const sortChallengesByDifficulty = async (req, res) => {
    let clnt;
    try {
        clnt = await client.connect();
        // NOTE: You cannot use $1 for keywords like ASC/DESC in Postgres.
        // We must validate the input manually.
        const order = req.params.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        
        const result = await clnt.query(
            `SELECT id, title, description, difficulty FROM app_data.challenges ORDER BY difficulty ${order}`
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send('Error sorting challenges.');
    } finally {
        if (clnt) clnt.release();
    }
};

module.exports = { 
    getChallenges, 
    getChallengesById, 
    sortChallengesByDifficulty 
};