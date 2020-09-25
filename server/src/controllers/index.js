var express = require('express');
var router = express.Router();
var graph = require('../models/graph');
var tokens = require('../models/tokens.js');


/* GET home page. */
router.get('/', async function(req, res, next) {
  let params = {
    active: { home: true }
  };

  res.render('index', params);
});

module.exports = router;
