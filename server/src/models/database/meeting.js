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
    "createMeeting": async (
        title, 
        description, 
        location, 
        meetingDate, 
        meetingTimeStart, 
        meetingTimeEnd,
        organizer,
        attendees
        ) => {

        console.log(organizer);

        // methods inserts meeting and everything relate into the database
        let sql = `INSERT INTO meeting (
            title, 
            description, 
            organizer_id, 
            location) 
            VALUES (
                "?", 
                "?", 
                "${organizer}", 
                "?");`;
        
        console.log(sql);

        await db.query(sql, [
            title,
            description,
            location
        ]);

        
    }
}
