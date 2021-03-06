DROP TABLE IF EXISTS pollVote;
DROP TABLE IF EXISTS pollChoice;
DROP TABLE IF EXISTS meetingAttendees;
DROP TABLE IF EXISTS meeting;
DROP TABLE IF EXISTS rawUsers;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id VARCHAR(255),
    displayName VARCHAR (255),
    email VARCHAR (255),
    created_at int(11),
    timezone int DEFAULT 2,

    PRIMARY KEY (id)
);

CREATE TABLE rawUsers (
    id VARCHAR(255),
    stringifiedData LONGTEXT
);

CREATE TABLE meeting (
    id int NOT NULL AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    organizer_id VARCHAR(255),
    location VARCHAR(255),
    creation_date int(11),
    negotiable TINYINT(1),

    FOREIGN KEY(organizer_id) 
        REFERENCES users(id),
    PRIMARY KEY (id)
);

CREATE TABLE meetingAttendees (
    meeting_id int,
    user_id VARCHAR(255),
    seen TINYINT(1),

    FOREIGN KEY(user_id) 
        REFERENCES users(id),

    FOREIGN KEY(meeting_id) 
        REFERENCES meeting(id)
);

CREATE TABLE pollChoice (
    id int NOT NULL AUTO_INCREMENT,
    meeting_id int,
    added_by VARCHAR(255),
    meeting_date_start int(11),
    meeting_date_end int(11),
    final TINYINT(1),

    FOREIGN KEY(added_by)
        REFERENCES users(id),
    FOREIGN KEY(meeting_id) 
        REFERENCES meeting(id),

     PRIMARY KEY (id)
);

CREATE TABLE pollVote (
    pollChoice_id int,
    user_id VARCHAR(255),

    FOREIGN KEY(user_id)
        REFERENCES users(id),

    FOREIGN KEY(pollChoice_id) 
        REFERENCES pollChoice(id)
);