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
        "dateStrings": "date",
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
            location,
            creation_date) 
            VALUES (
                ?, 
                ?, 
                "${organizer}", 
                ?,
                UNIX_TIMESTAMP(NOW()));
        SELECT LAST_INSERT_ID()`, [
            title,
            description,
            location
        ]).then(async (res) => {
            req.flash('success_msg', {
                message: `Meeting created successfully`
            });

            // get user timezone
            let tz = await db.query(`SELECT timezone FROM users WHERE id = "${organizer}";`);
            console.log(tz);
            tz = tz[0].timezone;
            let meetingID = res[0].insertId;
            
            // add attendees to meetingAttendees table
            // check if attandees is array, if not make it an array
            if (!Array.isArray(attendees)) {
                attendees = [attendees];
            }

            for (let i = 0; i < attendees.length; i++) {
                
                // check if user is registered
                // get the user;
                await db.query(`SELECT * FROM users WHERE email = ?;`, [attendees[i]])
                    .then(async (fetchedUser) => {
                        if (fetchedUser.length > 0) {
                            // Only if user didn't add themselves. 
                            if (fetchedUser[0].id !== organizer) {
                                await db.query(`
                                INSERT INTO meetingAttendees 
                                    (meeting_id, user_id, seen) 
                                VALUES
                                    (${meetingID}, "${fetchedUser[0].id}", 0)`)
                            }
                        } else {
                            console.log("User Does not exist: ", attendees[i]);
                            req.flash('error_msg', {
                                message: `Warning: Could not find user ${attendees[i]}, therefore ignored.`
                            });
                        }
                    });
            }

            // add organizer as attendee
            await db.query(`
            INSERT INTO meetingAttendees 
                (meeting_id, user_id, seen) 
            VALUES
                (${meetingID}, "${organizer}", 1)`);


            // add the suggested times
            // if array = multiple dates
            if (!Array.isArray(meetingDate)) {
                let start = (new Date(`${meetingDate} ${meetingTimeStart}Z`).getTime() + ((-(tz))*60*60*1000)) / 1000;
                let end = (new Date(`${meetingDate} ${meetingTimeEnd}Z`).getTime() + ((-(tz))*60*60*1000)) / 1000;

                await db.query(`
                INSERT INTO pollChoice
                    (meeting_id, added_by, meeting_date_start, meeting_date_end, final)
                VALUES
                    (?, "${organizer}", ${start}, ${end}, ?);
                    SELECT LAST_INSERT_ID();`, [meetingID, 1]).then(async (res) => {
                        await db.query(`INSERT INTO pollVote 
                        (pollChoice_id, user_id) 
                        VALUES 
                        (${res[0].insertId}, "${organizer}");`);
                    });
            } else {
                // insert every date choice to the database
                for (let i = 0; i < meetingDate.length; i++) {
                    let start;
                    let end;
                    try {
                        start = (new Date(`${meetingDate[i]} ${meetingTimeStart[i]}Z`).getTime() + ((-(tz))*60*60*1000)) / 1000;
                        end = (new Date(`${meetingDate[i]} ${meetingTimeEnd[i]}Z`).getTime() + ((-(tz))*60*60*1000)) / 1000;
                    } catch (err) {
                        console.log("Error! ", err);
                        continue;
                    }

                    await db.query(`
                    INSERT INTO pollChoice
                        (meeting_id, added_by, meeting_date_start, meeting_date_end, final)
                    VALUES
                        (?, "${organizer}", ${start}, ${end}, ?);
                        SELECT LAST_INSERT_ID();`, [meetingID, 0]).then(async (res) => {
                            await db.query(`INSERT INTO pollVote 
                            (pollChoice_id, user_id) 
                            VALUES 
                            (${res[0].insertId}, "${organizer}");`);
                        });
                }
            }

        }).catch((err) => {
            req.flash('error_msg', {
                message: `ERROR: Could not create meeting.: ${err}`
            });
        });
    },
    "getFinalMeetings": async (id) => {
        // let sqlNew = ``;
        // let sqlFinal = ``;
        // let sqlNotDetermined = ``;


        // let res = {
        //     new: await db.query(sqlNew),
        //     final: null,
        //     notDetermined: null
        // }

        let res = await db.query(`
        SELECT DISTINCT
        m.id,
        m.title,
        m.location,
        a.user_id,
        (SELECT meeting_date_start FROM pollChoice WHERE final = 1 AND meeting_id = m.id) as meeting_date_start,
        (SELECT meeting_date_end FROM pollChoice WHERE final = 1 AND meeting_id = m.id) as meeting_date_end,
        a.seen,
        (SELECT COUNT(*) FROM meetingAttendees WHERE meeting_id = m.id) as attendeesCounter,
        (SELECT MAX((pollChoice.meeting_date_end - UNIX_TIMESTAMP(NOW())) > 0) FROM pollChoice WHERE pollChoice.meeting_id = m.id) as active,
        (SELECT COUNT(*) FROM pollVote
        LEFT JOIN pollChoice
        ON pollVote.pollChoice_id = pollChoice.id
        WHERE pollVote.user_id = "${id}" AND pollChoice.meeting_id = m.id
        ) as voted
        FROM meeting AS m
        INNER JOIN meetingAttendees AS a
        ON m.id = a.meeting_id
        INNER JOIN pollChoice AS pc
        ON pc.meeting_id = m.id
        WHERE a.user_id = "${id}" 
        GROUP BY m.id, a.seen, pc.meeting_date_end, pc.meeting_date_start;
        `);

        
        
        return res;
    },
    "isAllowedToMeeting": async (u_id, m_id) => {
        let sql = `
        SELECT (COUNT(*)>0) as allowed 
        FROM meetingAttendees 
        WHERE meeting_id = ? AND 
        user_id = "${u_id}";
        `;

        let res = await db.query(sql, [m_id]);

        return res[0].allowed;
    },
    "setSeenMeeting": async (u_id, m_id) => {
        await db.query(`
        UPDATE meetingAttendees SET seen = 1 
        WHERE meeting_id = ? AND 
        user_id = "${u_id}" 
        `, [m_id]);
    },
    "getMeetingById": async (m_id) =>  {
        // get meeting details
        let meeting = {
            details: await db.query(`
                SELECT * FROM meeting WHERE id = ?`, [m_id]), // details about meeting
            attendees: await db.query(`
            SELECT * FROM meetingAttendees AS a
            INNER JOIN users AS u
            ON a.user_id = u.id
            WHERE a.meeting_id = ?;`, [m_id]), // details about attendees
            pollChoices: await (async function () {
                // get all pollChoices
                let pollChoices_db = await db.query(`
                SELECT * from pollChoice WHERE meeting_id = ?;`, [m_id]);

                // loop through pollChoices array and attach names of who voted 
                for (let i = 0; i < pollChoices_db.length; i++) {
                    pollChoices_db[i].votes = await db.query(`
                    SELECT users.displayName FROM users
                    INNER JOIN pollVote
                    ON users.id = pollVote.user_id WHERE pollVote.pollChoice_id = ?;
                    `, [pollChoices_db[i].id]);
                }

                return pollChoices_db;

            })() // details about prefered time and date & who's voted

        };


        return meeting;
    },
    "vote": async (votes, user, meet_id) => {

        // remove pollvotes of user on meeting
        await db.query(`
        DELETE e FROM pollVote e
        INNER JOIN pollChoice c
        ON e.pollChoice_id = c.id
        WHERE c.meeting_id = ? AND
        e.user_id = "${user}";
        `, meet_id);

        if (!votes) return;

        // if votes is not an array, make it an array
        if (!Array.isArray(votes)) {
            votes = [votes];
        }

        // insert new votes
        for (let i = 0; i < votes.length; i++) {
            // check if meeting has that pollChoice

            await db.query(`SELECT * FROM pollChoice
            WHERE id = ? AND meeting_id = ?`, [votes[i], meet_id]).then(async (res) => {
                if (res.length > 0) {
                    // insert new vote
                    await db.query(`
                    INSERT INTO pollVote
                    (pollChoice_id, user_id)
                    VALUES
                    (?, "${user}")`, [votes[i]]);
                }
            })


        }
    },
    "addUserToMeeting": async (userEmail, requestedBy, meetingId, req) => {
        // check if user already exist
        let err = false;

        // get users id
        let usr = await db.query(`
        SELECT id FROM users WHERE email = ?;
        `, [userEmail]);

        // if user exists
        if (usr.length > 0) {

            // check if user already added to the meeting
            await db.query(`
            SELECT * FROM meetingAttendees WHERE user_id = "${usr[0].id}"
            `).then(async (res) => {
                if (res.length > 0) {
                    
                    err = `Warning! User already exists.`;
                } else {
                    // insert new user into table
                    await db.query(`
                    INSERT INTO meetingAttendees 
                    (meeting_id, user_id, seen)
                    VALUES
                    (?, "${usr[0].id}", 0)
                    `, [meetingId]);
                }
            });
        } else {
            err = `Warning: Could not find user ${userEmail}, therefore ignored.`;
        }

        return err;
    },
    "removeMeetingById": async (m_id) => {
        // will remove a meeting and everything associated
        await db.query(`
            START TRANSACTION;

            DELETE pollVote
            FROM pollVote
            INNER JOIN pollChoice
            ON pollChoice.id = pollVote.pollChoice_id
            WHERE pollChoice.meeting_id = ?;

            DELETE FROM pollChoice WHERE meeting_id = ?;
            DELETE FROM meetingAttendees WHERE meeting_id = ?;

            DELETE FROM meeting WHERE id = ?;

            COMMIT;
        `, [m_id, m_id, m_id, m_id]);
    },

    "leaveMeeting": async (m_id, u_id) => {
        await db.query(`
            DELETE pollVote
            FROM pollVote
            INNER JOIN pollChoice
            ON pollChoice.id = pollVote.pollChoice_id
            WHERE 
            pollChoice.meeting_id = ? AND 
            pollVote.user_id = "${u_id}"; 

            DELETE FROM meetingAttendees 
            WHERE 
                meeting_id = ? AND
                user_id = "${u_id}"
                ;
        `, [m_id, m_id]);
    },
    "pollFinal": async (pollChoice, m_id) => {
        // check if pollchoice exists in meeting id
        await db.query(`
        SELECT * from pollChoice WHERE
        id = ? AND
        meeting_id = ?;
        `,
        [pollChoice, m_id]).then(async (res) => {
            if (res.length > 0) {
                await db.query(`
                UPDATE pollChoice SET 
                final = 1 
                WHERE id = ? AND
                meeting_id = ?;
                `, [pollChoice, m_id])
            }
        });
    },
    "addnewDate": async (u_id, m_id, m_date, m_start, m_end) => {
        // get user timezone
        let tz = await db.query(`SELECT timezone FROM users WHERE id = "${u_id}";`);
        console.log(tz);
        tz = tz[0].timezone;

        let start = (new Date(`${m_date} ${m_start}Z`).getTime() + ((-(tz))*60*60*1000)) / 1000;
        let end = (new Date(`${m_date} ${m_end}Z`).getTime() + ((-(tz))*60*60*1000)) / 1000;
        console.log(start);
        console.log(end);

        await db.query(`
            INSERT INTO pollChoice
            (meeting_id, added_by, meeting_date_start, meeting_date_end, final)
            VALUES
            (?, "${u_id}", ?, ?, 0);
        `, [m_id, start, end]);
    }
}
