require('dotenv').config();
const user = require('./user');
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
        attendees,
        req
        ) => {

        // methods inserts meeting and everything relate into the database        
        // add meeting to meeting table and get the ID
        await db.query(`
        INSERT INTO meeting (
            title, 
            description, 
            organizer_id, 
            location) 
            VALUES (
                "?", 
                "?", 
                "${organizer}", 
                "?");
        SELECT LAST_INSERT_ID()`, [
            title,
            description,
            location
        ]).then(async (res) => {
            console.log(res[0].insertId);
            let meetingID = res[0].insertId;
            
            // add attendees to meetingAttendees table
            // check if attandees is array, if not make it an array
            if (!Array.isArray(attendees)) {
                attendees = [attendees];
            }

            for (let i = 0; i < attendees.length; i++) {
                console.log("Checking: ", attendees[i]);
                
                // check if user is registered
                // get the user;
                await db.query(`SELECT * FROM users WHERE email = "?";`, [attendees[i]])
                    .then(async (fetchedUser) => {
                        if (fetchedUser.length > 0) {
                            // Only if user didn't add themselves. 
                            if (fetchedUser[0].id !== organizer) {
                                console.log("does as intended");
                                await db.query(`
                                INSERT INTO meetingAttendees 
                                    (meeting_id, user_id, seen) 
                                VALUES
                                    (${meetingID}, "${fetchedUser[0].id}", 0)`).then(() => {
                                        req.flash('success_msg', {
                                            message: `Meeting created successfully`
                                        });
                                    }).catch(() => {
                                        req.flash('error_msg', {
                                            message: `ERROR: Could not create meeting.`
                                        });
                                    });
                            } else {
                                console.log("User fetched themselves", attendees[i]);
                            }
                        } else {
                            console.log("User Does not exist: ", attendees[i]);
                            req.flash('error_msg', {
                                message: `Warning: Could not find user ${attendees[i]}, therefore ignored.`
                            });
                        }
                    });
            }

            // add the suggested times

        });
    }
}
