require("./middleware/core/db.js");
require("./middleware/streams/Runner");
const express = require('express'),
  app = express(),
  Firebase = require('firebase'),
  firebaseStore = getStore(app),
  path = require('path'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  routes = require('./routes/index'),
  users = require('./routes/users'),
  vals = require('./middleware/middlewareGlobals'),
  rollbar = require('rollbar'),
  rollbarKey = "57fcf7c2515b4dd3916052ed09902fe8";

/**
 * Initiate Rollbar logging.
 */
rollbar.init(rollbarKey);

/**
 * View engine setup.
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Route middleware setup.
 */
app.use(vals.ROOT_URL, routes);
app.use(vals.USERS_URL, users(firebaseStore));

// Use the rollbar error handler to send exceptions to your rollbar account
app.use(rollbar.errorHandler(rollbarKey));

/**
 * development error handler.
 */
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    next(err);
  });
}

/**
 * Production error handler.
 */
if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    logError(err, next);
  });
}

/**
 * Log an error to Rollbar and continue.
 * @param err
 * @param next
 */
function logError(err, next) {
  rollbar.reportMessage(err);
  next(err);
}

function getStore(app) {
  var process = app.get('env') || 'development';
  if (process === 'production') {
    return new Firebase("https://dazzling-torch-1917.firebaseio.com");
  } else {
    return new Firebase("https://proxy-test.firebaseio.com");
  }
}

module.exports = app;