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

        return res.length > 0;
    },

    "registerUser": async (id, displayName, email) => {
        let sql = `
        INSERT INTO users (id, displayName, email) VALUES (?, ?, ?)`;
        // add user
        await db.query(sql, [id, displayName, email]);

        let sql2 = `
        INSERT INTO rawUsers (id) VALUES (?)`;

        // create empty row for user
        await db.query(sql2, [id]);
    },

    "getUserByEmail": async (email) => {
        let sql = `
        SELECT * FROM users WHERE email = ?`;
    
        let res = await db.query(sql, [email]);

        return res[0];
    },
    
    "getUserById": async (id) => {
        let sql = `
        SELECT * FROM users WHERE id = ?`;
    
        let res = await db.query(sql, [id]);   

        return res;
    },

    "updateRawUser": async (id, stringifiedData) => {
        let sql = `
        UPDATE rawUsers 
        SET 
            stringifiedData = ?
        WHERE
            id = ?;`;
        // add user
        await db.query(sql, [stringifiedData, id]);
    },

    "getRawUser": async (id) => {
        let sql = `
        SELECT * from rawUsers WHERE id = ?`;

        // get raw user data
        let res = await db.query(sql, [id]);

        return res[0];
    }
}
