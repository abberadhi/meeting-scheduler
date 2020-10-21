/** 
 * Express middlewares which process the incoming requests before handling them down to the routes
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
var session = require('express-session');
var path = require('path');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var passport = require('passport');

module.exports = (app) => {

    app.use(morgan('combined'));
    app.use(bodyParser.json());
    app.use(cors());


    // Session middleware
    app.use(session({
        secret: 'your_secret_value_here',
        resave: false,
        saveUninitialized: false,
        unset: 'destroy'
    }));
    
    // Flash middleware
    app.use(flash());
    
    // Set up local vars for template layout
    app.use(function(req, res, next) {
        // Read any flashed errors and save
        // in the response locals
        res.locals.error = req.flash('error_msg');
        res.locals.success = req.flash('success_msg');
    
        // Check for simple error string and
        // convert to layout's expected format
        var errs = req.flash('error');
        for (var i in errs){
        res.locals.error.push({message: 'An error occurred', debug: errs[i]});
        }
    
        next();
    });

    // view engine setup
    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'hbs');

    var hbs = require('hbs');
    var moment = require('moment');
    // Helper to format date/time sent by Graph & MySQL
    hbs.registerHelper('eventDate', function(dateTime) {
        return moment(dateTime).utcOffset(2).format('YYYY-MM-DD');
    });

    // Helper to format date/time sent by Graph & MySQL
    hbs.registerHelper('eventTime', function(dateTime) {
        return moment(dateTime).utcOffset(2).format('hh:mm:ss');
    });

    hbs.registerHelper('readableDate', function(dateTime) {
        return moment(dateTime).utcOffset(2).format('LL HH:mm');
    });

    // get time in HH:mm
    hbs.registerHelper('time24', function(dateTime) {
        return moment(dateTime).utcOffset(2).format('HH:mm');
    });

    // handler for joining attendes with linebreak
    hbs.registerHelper('joinAttendees', function(names) {
        names = names.map((obj) => {
            return obj.displayName;
        })

        return names.join("<br>");
    });

    // check if user already voted
    hbs.registerHelper('hasVoted', function(names, user) {
        for (let i = 0; i < names.length; i++) {
            if (names[i].displayName == user) {
                return true;
            }
        }

        return false;
    });

    // get final date, returns message if no date finalized
    hbs.registerHelper('finalDate', function(choices) {
        for (let i = 0; i < choices.length; i++) {
            console.log(choices[i]);
            if (choices[i].final) {
                return moment(choices[i].meeting_date_start).utcOffset(2).format('LL HH:mm');
            }
        }

        return false;
    });

    // return length of array
    hbs.registerHelper('lengthArray', function(names) {
        return names.length;
    });

    hbs.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });

    hbs.registerHelper('ifCond', function(time) {
        if (time > 0) {
            return true;
        }
        return false;
    });

    hbs.registerHelper('ifEquals', function(arg1, arg2) {
        return arg1 == arg2;
    });

    hbs.registerHelper('decrement', function(value) {
        console.log(value);
        return value-1
    });
    

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '../public')));

    // Initialize passport
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req, res, next) {
        // Set the authenticated user in the
        // template locals
        if (req.user) {
          res.locals.user = req.user.profile;

          // check if user has profile picture
          fs.access(`../server/src/public/avatars/${req.user.profile.oid}.png`, fs.F_OK, (err) => {
              if (!err) {
                  // attach true on template locals
                    try {
                        res.locals.user.avatar = `avatars/${req.user.profile.oid}.png`;
                    } catch (error) {
                        console.log("Error has occured: ", error);
                    }
                }
            })
        }
        next();
      });
      

      // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
    
        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    return app;
}
