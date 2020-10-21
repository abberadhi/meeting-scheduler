require('dotenv').config();

const express = require('express');
var passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

const app = require('./middlewares/mw')(express());

require('./models/auth');

var authRouter = require('./controllers/auth');
var indexRouter = require('./controllers/index');
var meetingsRouter = require('./controllers/meetings');
var settings = require('./controllers/settings');

app.use('/auth', authRouter);
app.use('/meetings', meetingsRouter);
app.use('/', indexRouter);
app.use('/settings', settings);

app.listen(process.env.PORT || 8081);