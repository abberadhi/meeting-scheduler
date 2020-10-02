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
    // Helper to format date/time sent by Graph
    hbs.registerHelper('eventDateTime', function(dateTime){
        console.log(dateTime);
        return moment(dateTime).format('YYYY-MM-DD');
        // return moment(dateTime).format('M/D/YY h:mm A');
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
          try {
            fs.access(`../server/src/public/avatars/${req.user.profile.oid}.png`, fs.F_OK, (err) => {
                if (!err) {
                    // attach true on template locals
                    res.locals.user.avatar = `avatars/${req.user.profile.oid}.png`;
                }
            })
          } catch (error) {
              console.log("Error has occured: ", error);
          }
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
