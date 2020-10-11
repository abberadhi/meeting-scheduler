var express = require('express');
var router = express.Router();
var graph = require('../models/graph');
var tokens = require('../models/tokens.js');


/* GET /meetings */
router.get('/',
  async function(req, res) {
    if (!req.isAuthenticated()) {
      // Redirect unauthenticated requests to home page
      req.flash('error_msg', {
        message: 'Access forbidden: You have to log in first!'
      });
      res.redirect('/')
    } else {
      let params = {
        active: { meetings: true }
      };
      
      // Get the access token
      var accessToken;
      try {
        accessToken = await tokens.getAccessToken(req);
      } catch (err) {
        req.flash('error_msg', {
          message: 'Could not get access token. Try signing out and signing in again.',
          debug: JSON.stringify(err)
        });
      }

      if (accessToken && accessToken.length > 0) {
        try {
          // Get the events
          var events = await graph.getEvents(accessToken);
          params.events = events.value;
          console.log("params.events", params.events);
        } catch (err) {
          console.log(err);
          req.flash('error_msg', {
            message: 'Could not fetch events',
            debug: JSON.stringify(err)
          });
        }
      } else {
        req.flash('error_msg', 'Could not get an access token');
        console.log("could ot get access token");
      }

      res.render('meetings', params);
    }
  }
);


router.post('/create',
  async function(req, res) {
    // if (!req.isAuthenticated()) {
      console.log(req.body);
    if (false) {
      // Redirect unauthenticated requests to home page
      res.locals.message = 'Access forbidden: You have to log in first!';
      res.redirect('/')
    } else {
      let params = {
        active: { meetings: true }
      };

      // Get the access token
      var accessToken;
      try {
        accessToken = await tokens.getAccessToken(req);
      } catch (err) {
        req.flash('error_msg', {
          message: 'Could not get access token. Try signing out and signing in again.',
          debug: JSON.stringify(err)
        });
      }

      if (accessToken && accessToken.length > 0) {
        try {
          // Get the events
          var events = await graph.getEvents(accessToken);
          params.events = events.value;
          console.log("params.events", params.events);
        } catch (err) {
          console.log(err);
          req.flash('error_msg', {
            message: 'Could not fetch events',
            debug: JSON.stringify(err)
          });
        }
      } else {
        req.flash('error_msg', 'Could not get an access token');
      }

      res.render('create', params);
    }
  }
);

/* GET /meetings/create */
router.get('/create',
  async function(req, res) {
    // if (!req.isAuthenticated()) {
    if (false) {
      // Redirect unauthenticated requests to home page
      res.locals.message = 'Access forbidden: You have to log in first!';
      res.redirect('/')
    } else {
      let params = {
        active: { meetings: true }
      };

      // Get the access token
      var accessToken;
      try {
        accessToken = await tokens.getAccessToken(req);
      } catch (err) {
        req.flash('error_msg', {
          message: 'Could not get access token. Try signing out and signing in again.',
          debug: JSON.stringify(err)
        });
      }

      if (accessToken && accessToken.length > 0) {
        try {
          // Get the events
          var events = await graph.getEvents(accessToken);
          params.events = events.value;
          console.log("params.events", params.events);
        } catch (err) {
          console.log(err);
          req.flash('error_msg', {
            message: 'Could not fetch events',
            debug: JSON.stringify(err)
          });
        }
      } else {
        req.flash('error_msg', 'Could not get an access token');
      }

      res.render('create', params);
    }
  }
);


module.exports = router;