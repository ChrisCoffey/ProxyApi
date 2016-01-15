var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var vals = require('./middleware/middlewareGlobals');
require("./middleware/core/db");
require("./middleware/streams/Runner");
var app = express();
//var expressWs = require('express-ws')(app);

var rollbar = require('rollbar');
var rollbarKey = "57fcf7c2515b4dd3916052ed09902fe8";

//initiate rollbar logging
rollbar.init(rollbarKey);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(vals.ROOT_URL, routes);
app.use(vals.USERS_URL, users);

// Use the rollbar error handler to send exceptions to your rollbar account
app.use(rollbar.errorHandler(rollbarKey));

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    next(err);
  });
}

// production error handler
// no stacktraces leaked to user
if (app.get('env') === 'production') {
  app.use(function (err, req, res, next) {
    logError(err, next);
  });
}

function logError(err, next) {
  rollbar.reportMessage(err);
  next(err);
}

module.exports = app;
