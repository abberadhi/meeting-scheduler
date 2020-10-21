var express = require('express');
const user = require('../models/database/user.js');
var router = express.Router();;
var meeting = require('../models/database/user.js');
;


/* GET settings page. */
router.get('/', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    req.flash('error_msg', {
      message: 'Access forbidden: You have to log in first!'
    });
    res.redirect('/')
  } 

  let params = {
    active: { meetings: true }
  };

  res.render('settings', params);
});

/* POST settings page. */
router.post('/', async function(req, res, next) {
  if (!req.isAuthenticated()) {
    // Redirect unauthenticated requests to home page
    req.flash('error_msg', {
      message: 'Access forbidden: You have to log in first!'
    });
    res.redirect('/')
  } 
  let params = {
    active: { home: true }
  };

  await user.setTimezone(req.body.tz, req.user.profile.oid);

  req.flash('success_msg', {
    message: 'Timezone updated!'
  });

  res.redirect('/settings')
});

module.exports = router;
