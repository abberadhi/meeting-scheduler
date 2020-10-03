DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS rawUsers;
DROP TABLE IF EXISTS meeting;

CREATE TABLE users (
    id VARCHAR(255),
    displayName VARCHAR (255),
    email VARCHAR (255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 

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
    organizer_id VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    negotiable TINYINT(1),

    FOREIGN KEY(organizer_id) 
        REFERENCES users(id),
    PRIMARY KEY (id)
);
