"use strict";
var Firebase = require("firebase");
var middleware = {store: null};
middleware.store = new Firebase("https://dazzling-torch-1917.firebaseio.com");


/**
 * Ensure authorization with firebase before requesting any data.
 * @param req request
 * @param res response
 * @param next call next
 */
middleware.ensureAuthenticated = function (req, res, next) {
  var authToken = req.query.auth;
  if (authToken == null) {
    console.log("Null firebase token");
    return res.status(401).send("401 required query param \"auth\" missing");
  }

  middleware.store.authWithCustomToken(authToken, function (error, authData) {
    if (error) {
      console.log("Authentication Failed!", error);
      return res.status(401).send("Error authenticating with Firebase: ", error);
    } else {
      console.log("Authenticated successfully with payload: ", authData);
      return next()
    }
  });
};


middleware.allowCrossDomainRequest = function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
};

module.exports = middleware;