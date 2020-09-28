DROP DATABASE IF EXISTS meetx;

CREATE DATABASE IF NOT EXISTS meetx;

USE meetx;

DROP USER IF EXISTS 'user'@'%';

CREATE USER IF NOT EXISTS 'user'@'%'
    IDENTIFIED WITH mysql_native_password
    BY 'pass'
;

GRANT ALL PRIVILEGES ON meetx.* TO 'user'@'%';
grant all privileges on meetx.* to 'user'@'%' with grant option;
GRANT SUPER ON *.* TO 'user'@'%';
