"use strict";
var Firebase = require('firebase');
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGen = new FirebaseTokenGenerator("CcqAHb98loxjOoyzBJjvdCiYKFcT0h64jw2uhGDs");
var vals = require('../middleware/middlewareGlobals');
var middleware = {};
middleware.firebaseStore = new Firebase("https://dazzling-torch-1917.firebaseio.com");

/**
 * Ensure authorization with firebase before requesting any data.
 * @param req request
 * @param res response
 * @param next call next
 */
middleware.ensureFirebaseAuthenticated = function (req, res, next) {
  var authToken = req.get("auth");
  if (authToken == null) {
    authenticateCustomAndroid(req, res, next);
  } else {
    authenticateCustomToken(authToken, req, res, next);
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
  if (authToken == null) {
    console.log("Null firebase token");
    return res.status(401).send(middleware.get400ParamError("token"));
  }

  var fireToken = tokenGen.createToken({uid: authToken});
  middleware.firebaseStore.authWithCustomToken(fireToken, function (error, authData) {
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
  res.status(400);
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

  // Pass to next layer of common
  next();
};

middleware.get400ParamError = function (string) {
  return "400 required header param \"" + string + "\" missing or undefined";
};

middleware.checkParam400 = function (res, param, name) {
  if (param === null || typeof param === vals.UNDEFINED) {
    res.status(400).json(middleware.get400ParamError(name));
  }
  return param
};

middleware.createNewUser = function (user) {
  var newUser = {
    id: "", first: "", last: "", email: "", profileURL: "", coverURL: "",
    channels: [], contacts: [], groups: [], androidVersion: 0
  };

  newUser.id = user.id;
  newUser.first = user.first;
  newUser.last = user.last;
  newUser.email = user.email;
  newUser.profileURL = user.profileURL;
  newUser.coverURL = user.coverURL;
  newUser.channels = user.channels;
  newUser.contacts = user.contacts;
  newUser.groups = user.groups;
  newUser.androidVersion = user.androidVersion;

  return newUser;
};

module.exports = middleware;
