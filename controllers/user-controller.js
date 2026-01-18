const adminpool = require('../config/db').client;

const getUser = async (req, res) => {
    let client;
    const id = req.params.id;
    try {
        client = await adminpool.connect();
        const result = await client.query('SELECT username, email FROM app_data.users where id = $1', [id]);
        if(result.rows.length === 0) return res.status(404).send('User not found');
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Error retrieving user.');
    } finally {
        if (client) client.release();
    }
}

const getuserProgress = async (req, res) =>{
    let client ;
    const id = req.params.id;
    try{
        client = await adminpool.connect();
        const result = await client.query('SELECT challenge_id, submitted_sql, completed_at FROM app_data.user_progress where user_id = $1 ORDER BY completed_at DESC', [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).send('Error retrieving user progress.');
    } finally {
        if (client) client.release();
    }
}

module.exports = { getUser, getuserProgress };