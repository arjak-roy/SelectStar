const  studentpool  = require('../config/db').studentpool;
const adminPool = require('../config/db').client;

// Controller to check user's solution against the stored solution
const checkSolution = async (req, res) => {
  let stdpool, client;
  const  challengeId  = req.params.id;

  try {
    stdpool = await studentpool.connect();
    client = await adminPool.connect();

    let sql = req.body.sql.trim();
    // 1. Strip trailing semicolons to prevent subquery syntax errors
    sql = sql.replace(/;+$/, '');

    // 2. Fetch challenge data (Notice we use app_data prefix)
    const challengeData = await client.query(
        'SELECT solution_sql FROM app_data.challenges WHERE id = $1', 
        [challengeId]
    );

    if (challengeData.rowCount === 0) {
      return res.status(404).send('Challenge not found.');
    }

    const solutionSql = challengeData.rows[0].solution_sql;

    // 3. TRANSACTION START (With Await!)
    await stdpool.query('BEGIN');

    // Run queries exactly as intended for comparison
    const expected = await stdpool.query(solutionSql);
    const actual = await stdpool.query(sql); // Use raw sql for comparison to match column names

    // 4. TRANSACTION END (With Await!)
    await stdpool.query('ROLLBACK');

    // 5. Comparison Logic
    if (expected.rows.length !== actual.rows.length) {
        return res.status(200).json({ 
            success: false, 
            message: `Row count mismatch. Expected ${expected.rows.length}, got ${actual.rows.length}.`,
            actual: actual.rows,
            expected: expected.rows
        });
    }

    const isCorrect = JSON.stringify(expected.rows) === JSON.stringify(actual.rows);

    if (isCorrect) {
        return res.status(200).json({ 
            success: true, 
            message: "Perfect! You solved the challenge.",
            actual: actual.rows,
            expected: expected.rows
        });
    } else {
        return res.status(200).json({ 
            success: false, 
            message: "The data returned is incorrect. Check your filters or column names!",
            actual: actual.rows,
            expected: expected.rows 
        });
    }

  } catch (err) {
    if (stdpool) await stdpool.query('ROLLBACK').catch(() => {});
    console.error("Submission Error:", err.message);
    res.status(400).json({ error: err.message });
  } finally {
    if (stdpool) stdpool.release();
    if (client) client.release();
  }
};


// Controller to execute arbitrary queries in the sandbox
const executeQuery = async (req, res) => {
  const stdpool = await studentpool.connect();
  const whoAmI = await stdpool.query('SELECT current_user');
  console.log("Database user is:", whoAmI.rows[0].current_user);

  try {
    let { sql } = req.body;
    sql = sql.trim(); // Clean whitespace

    const isSelect = sql.toUpperCase().startsWith("SELECT");
    
    // // Security check
    // if (/\b(DROP|DELETE|ALTER|TRUNCATE|GRANT)\b/i.test(sql)) {
    //    return res.status(403).send('Forbidden keywords in SQL query.');
    // }

    // 1. Strip trailing semicolons to prevent subquery syntax errors
    const cleanSql = sql.replace(/;+$/, '');

    // 2. Wrap SELECT queries only
    const finalQuery = isSelect 
      ? `SELECT * FROM (${cleanSql}) AS user_result LIMIT 50;` 
      : cleanSql;

    await stdpool.query('BEGIN');
    
    const result = await stdpool.query(finalQuery);
    
    await stdpool.query('ROLLBACK');

    // 3. Smart Response Logic
    if (!isSelect) {
      // For UPDATE/INSERT/DELETE, return the count of rows changed
      return res.status(200).json({ 
        message: `Success: ${result.rowCount} row(s) affected.`,
        rowCount: result.rowCount 
      });
    }

    // 4. Send the data back for SELECT
    res.status(200).json(result.rows);

  } catch (error) {
    await stdpool.query('ROLLBACK').catch(e => console.error("Rollback failed", e));
    res.status(400).send(error.message); 
  } finally {
    stdpool.release();
  }
}


module.exports = { executeQuery, checkSolution };