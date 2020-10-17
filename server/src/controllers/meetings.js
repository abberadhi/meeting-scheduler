var express = require('express');
var router = express.Router();
var graph = require('../models/graph');
var tokens = require('../models/tokens.js');
var meeting = require('../models/database/meeting.js');
var fs = require('fs');

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

      let finalMeetings = await meeting.getFinalMeetings(req.user.profile.oid);
      console.log("finalMeetings", finalMeetings);
      params.finalMeetings = finalMeetings;

      res.render('meetings', params);
    }
  }
);


router.post('/create',
  async function(req, res) {
    if (!req.isAuthenticated()) {
      // Redirect unauthenticated requests to home page
      res.locals.message = 'Access forbidden: You have to log in first!';
      res.redirect('/')
    }
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

      console.log([        req.body.title,
        req.body.description,
        req.body.location,
        req.body.meetingDate,
        req.body.meetingTimeStart,
        req.body.meetingTimeEnd,
        req.user.profile.oid,
        req.body.attendee]);

      await meeting.createMeeting(
        req.body.title,
        req.body.description,
        req.body.location,
        req.body.meetingDate,
        req.body.meetingTimeStart,
        req.body.meetingTimeEnd,
        req.user.profile.oid,
        req.body.attendee,
        req
      );


      res.redirect('/meetings')
  }
);

/* GET /meetings/create */
router.get('/create',
  async function(req, res) {
    if (!req.isAuthenticated()) {
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

/* GET /meetings/view:id */
router.get('/view/:id',
  async function(req, res) {
    if (!req.isAuthenticated()) {
      // Redirect unauthenticated requests to home page
      res.locals.message = 'Access forbidden: You have to log in first!';
      res.redirect('/')
    } else {
      let params = {
        active: { meetings: true }
      };

    if (!req.params.id) {
      res.redirect('/meetings');
    }

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

      console.log("meeting.isAllowedToMeeting(req.user.profile.oid)", await meeting.isAllowedToMeeting(req.user.profile.oid, req.params.id));

      // Check if user belongs to meeting and if meeting exist
      if (!await meeting.isAllowedToMeeting(req.user.profile.oid, req.params.id)) {
        req.flash('error_msg', {
          message: `Meeting doesn't exist or not available for you.`,
        });
        res.redirect('/meetings');
      }
      
      // set user to seen
      await meeting.setSeenMeeting(req.user.profile.oid, req.params.id);

      params.meeting = await meeting.getMeetingById(req.params.id);
      
      // attach profile image to user object if it exists
      for (let i = 0; i < params.meeting.attendees.length; i++) {
          // check if user has profile picture
          await fs.access(`../server/src/public/avatars/${params.meeting.attendees[i].id}.png`, fs.F_OK, (err) => {
            if (!err) {
                // attach location on user object
                  try {
                      params.meeting.attendees[i].picture = `avatars/${params.meeting.attendees[i].id}.png`;
                  } catch (error) {
                      console.log("Error has occured: ", error);
                  }
              }
          })
      }

      console.log(params.meeting.attendees)


      res.render('viewMeeting', params);
    }
  }
);

module.exports = router;