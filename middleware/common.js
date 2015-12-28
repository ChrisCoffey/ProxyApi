"use strict";
var Firebase = require('firebase');
var middleware = {firebaseStore: null};
middleware.firebaseStore = new Firebase("https://dazzling-torch-1917.firebaseio.com");

/**
 * Ensure authorization with firebase before requesting any data.
 * @param req request
 * @param res response
 * @param next call next
 */
middleware.ensureFirebaseAuthenticated = function (req, res, next) {
  var authToken = req.query.auth;
  if (authToken == null) {
    authenticateProvider(req, res, next);
  } else {
    authenticateCustomToken(authToken, res, next);
  }
};

function authenticateCustomToken(authToken, res, next) {
  middleware.firebaseStore.authWithCustomToken(authToken, function (error, authData) {
    if (error) {
      console.log("Authentication Failed!", error);
      res.status(401).send("Error authenticating with Firebase: ", error);
      next(error);
    } else {
      console.log("Authenticated successfully with payload: ", authData);
      return next()
    }
  });
}

/**
 * The request had no auth query param, check to see if it had a provider and token.
 * @param req
 * @param res
 * @param next
 */
function authenticateProvider(req, res, next) {
  var authToken = req.query.token;
  var authProvider = req.query.provider;
  if (authToken == null) {
    console.log("Null firebase token");
    return res.status(401).send("401 required query param \"token\" missing");
  }
  if (authProvider == null) {
    console.log("Null firebase token");
    return res.status(401).send("401 required query param \"provider\" missing");
  }

  middleware.firebaseStore.authWithOAuthToken(authProvider, authToken, function (error, authData) {
    if (error) {
      console.log("Authentication Failed!", error);
      res.status(401).send("Error authenticating with Firebase: ", error);
      next(error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      next()
    }
  });
};

/**
 * Generates a GUID string.
 * @returns {String} The generated GUID.
 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
 * @author Slavik Meltser (slavik@meltser.info).
 * @link http://slavik.meltser.info/?p=142
 */
middleware.guid = function () {
  function _p8(s) {
    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
  }

  return _p8() + _p8(true) + _p8(true) + _p8();
};

middleware.logError = function (errorMessage, err, res, next) {
  console.log(errorMessage);
  return next(err);
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