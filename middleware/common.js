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

module.exports = middleware;