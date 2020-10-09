require('dotenv').config();
const mysql = require("promise-mysql");
let db;

(async function() {
    db = await mysql.createConnection({
        "host":     "localhost",
        "user":     process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": "meetx",
        "multipleStatements": true
    });

    process.on("exit", () => {
        db.end();
    });
})();

module.exports = {
    "getUserByEmail": async (email) => {
        let sql = `
        SELECT * FROM users WHERE email = ?`;
    
        let res = await db.query(sql, [email]);

        return res[0];
    }
}
