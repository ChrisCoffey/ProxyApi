"use strict";
const middleware = require('../middleware/common'),
  FirebaseTokenGen = require("firebase-token-generator"),
  tokenGen = new FirebaseTokenGen("CcqAHb98loxjOoyzBJjvdCiYKFcT0h64jw2uhGDs");

var _ = require('underscore');
var firebaseStore;
var Authentication = function (store) {
  firebaseStore = store;
};

_.extend(Authentication.prototype, {
  /**
   * Ensure authorization with firebase before requesting any data.
   * @param req request
   * @param res response
   * @param next call next
   */
  ensureFirebaseAuthenticated: function (req, res, next) {
    var authToken = req.get("auth");
    if (authToken == null) {
      authenticateCustomAndroid(req, res, next);
    } else {
      authenticateCustomToken(authToken, req, res, next);
    }
  },
  //TODO: set access control to something other than *
  allowCrossDomainRequest: function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of common
    next();
  }
});

//noinspection JSUnresolvedVariable
module.exports = Authentication;

function authenticateCustomToken(authToken, res, next) {
  firebaseStore.authWithCustomToken(authToken, function (error, authData) {
    if (error) {
      console.log("Authentication Failed!", error);
      res.status(401).send("Error authenticating with Firebase: ", error);
      next(error);
    } else {
      console.log("Authenticated successfully with payload: ", authData);
      next()
    }
  });
}
/**
 * The request had no auth header param, check to see if it had a provider and token.
 * @param req
 * @param res
 * @param next
 */
function authenticateCustomAndroid(req, res, next) {
  var authToken = req.get("token");
  if (authToken == null || typeof authToken == 'undefined') {
    authAnonymously(res, next);
  } else {
    var fireToken = tokenGen.createToken({uid: authToken});
    firebaseStore.authWithCustomToken(fireToken, function (error, authData) {
      if (error) {
        console.log("Authentication Failed!", error);
        res.status(401).send("Error authenticating with Firebase: ", error);
        next(error);
      } else {
        console.log("Authenticated successfully with payload:", authData);
        next()
      }
    });
  }
}

function authAnonymously(res, next) {
  firebaseStore.authAnonymously(function (error, authData) {
    if (error) {
      console.log("Login Failed!", error);
      res.status(401).send(middleware.get400ParamError("token"));
      next(error);
    } else {
      console.log("Authenticated successfully with payload:", authData);
      next()
    }
  });
}
