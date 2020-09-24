require('dotenv').config();

const express = require('express');
var passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

const app = require('./middlewares/mw')(express());

require('./oauth/auth');

var authRouter = require('./controllers/auth');
var indexRouter = require('./index');
var graph = require('./oauth/graph');


app.use('/auth', authRouter);
app.use('/', indexRouter);

app.listen(process.env.PORT || 8081);