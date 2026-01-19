const validateSQL = (req, res, next) => {
    const { sql } = req.body;

    // Comprehensive list of DDL, DML (destructive), and System commands
    const forbiddenKeywords = [
        'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', // Data Definition/Destructive
        'UPDATE', 'INSERT', 'MERGE',                     // Data Modification
        'GRANT', 'REVOKE',                               // Permission/Security
        'COMMIT', 'ROLLBACK', 'SAVEPOINT',               // Transaction Control
        'COPY', 'VACUUM', 'ANALYZE',                     // Administrative
        'SHOW', 'SET', 'RESET',                          // Session/System Config
        'PG_SLEEP', 'PG_', 'information_schema',         // Postgres Internal/Injection specific
        '--', '\\/\\*', '\\*/', ';'                      // Comment/Terminator bypasses
    ];

    // Create a regex pattern: \b(KEYWORD1|KEYWORD2)\b
    const pattern = new RegExp(`\\b(${forbiddenKeywords.join('|')})\\b`, 'i');

    if (pattern.test(sql)) {
        return res.status(403).json({ 
            success: false, 
            message: 'Access Denied: Restricted SQL command or syntax detected.' 
        });
    }

    next();
};

module.exports = { validateSQL };