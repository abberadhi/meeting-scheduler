# Meet X
## About
Meeting schedule is a web application that is made to make scheduling meetings easier without having to mail people back and forth.

The web application is completed with Express.js & Handlebars together with MySQL for the database. 

This repository is made as a final delivery for the Software Engineering Project course at Blekinge Institute of Technology

## Features
* Microsoft Login with oauth 2.0
* View your Outlook Calendar on the application.
* Add anyone you like to the meeting by entering their email (provided that they're registered).
* The organizer can create a poll that the attendees can vote on for deciding the final date & time of the meeting.
* Attendees can add more poll alternatives if the times provided don't suit them.
* Flash error messages.
* Warning if you already have something scheduled at that date of the meeting.
* Making meeting location clickable if it's a link
* Ability to change timezone based on where you are.

____________

## Getting started

### Before you start make sure you have:
* MySQL installed (tested on MySQL 5.7.31)
* Node (tested on v12.14.1) 
* npm (tested on 6.13.4)
* Registered the app with Azure AD and obtained Client ID and Secret  (Follow the [official guide](https://docs.microsoft.com/en-us/graph/auth-v2-user))


### Installation
Tested on Linux (Ubuntu 18.04). Other systems might differ.

```bash
# Clone repository.
git clone https://github.com/abberadhi/meeting-scheduler.git

# Change into the directory.
cd meeting-scheduler/

# Install dependencies.
cd server && npm install

# Make a copy of .env file.
cp .env-example .env

# Setup MySQL database, enter your password.
mysql -uroot -p < ../dbsetup/setupdb.sql > /dev/null

# Setup Mysql database tables, enter your password.
mysql -uroot -p meetx < ../dbsetup/setuptables.sql > /dev/null
```

