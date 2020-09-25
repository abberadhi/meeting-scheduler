var express = require('express');
var router = express.Router();
var graph = require('./models/graph');
var tokens = require('./models/tokens.js');


/* GET home page. */
router.get('/', async function(req, res, next) {
  let params = {
    active: { home: true }
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
          await graph.getUserPicture(accessToken);

        } catch (err) {
          req.flash('error_msg', {
            message: 'Could not fetch events',
            debug: JSON.stringify(err)
          });
        }
      } else {
        req.flash('error_msg', 'Could not get an access token');
      }
  
  res.render('index', params);
});

module.exports = router;
