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
    "userExists": async (id) => {
        let sql = `
        SELECT * FROM users WHERE id = ?`;
    
        let res = await db.query(sql, [id]);
    
        console.log(res);

        return res.length > 0;
    },

    "registerUser": async (id, displayName, email) => {
        let sql = `
        INSERT INTO users (id, displayName, email) VALUES (?, "?", "?")`;

        await db.query(sql, [id, displayName, email]);
    }
}