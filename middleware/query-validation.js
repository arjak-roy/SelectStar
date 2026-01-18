const validateSQL = (req, res, next) => {
    const { sql } = req.body;
    if (/\b(DROP|DELETE|ALTER|TRUNCATE|COMMIT)\b/i.test(sql)) {
        return res.status(403).send('Forbidden keyword detected.');
    }
    next(); // Move to the next function (the controller)
};
module.exports = { validateSQL };
