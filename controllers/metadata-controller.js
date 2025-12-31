const studentpool = require('../config/db').studentpool;


const getColumnInfo = async (req, res) => {
    let stdpool;
    // Ensure tableNames is an array
    const tableNames = Array.isArray(req.body.tableNames) ? req.body.tableNames : [req.body.tableNames];
    const resulttoreturn = [];

    try {
        // Connect once outside the loop for better performance
        stdpool = await studentpool.connect();

        // Use for...of to correctly await each iteration
        for (const name of tableNames) {
            const queryText = `
                SELECT 
                    c.column_name, 
                    c.data_type, 
                    CASE WHEN tc.constraint_type = 'PRIMARY KEY' THEN 'yes' ELSE 'no' END AS is_primary_key 
                FROM information_schema.columns c 
                LEFT JOIN information_schema.key_column_usage kcu 
                    ON c.table_name = kcu.table_name 
                    AND c.column_name = kcu.column_name 
                    AND c.table_schema = kcu.table_schema 
                LEFT JOIN information_schema.table_constraints tc 
                    ON kcu.constraint_name = tc.constraint_name 
                    AND kcu.table_schema = tc.table_schema 
                    AND tc.constraint_type = 'PRIMARY KEY' 
                WHERE c.table_name = $1 
                AND c.table_schema = 'public' 
                ORDER BY c.ordinal_position;
            `;

            const result = await stdpool.query(queryText, [name]);
            
            resulttoreturn.push({
                name: name,
                columns: result.rows
            });
        }

        // Now that the loop is truly finished, send the data
        res.status(200).json({ metadata: resulttoreturn });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving table metadata.');
    } finally {
        if (stdpool) stdpool.release();
    }
};
module.exports = { getColumnInfo };