DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS rawUsers;

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
