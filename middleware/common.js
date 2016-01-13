"use strict";
var vals = require('../middleware/middlewareGlobals');
var middleware = {};

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
  res.sendStatus(err.statusCode);
  console.log(errorMessage);
  return next(err);
};

middleware.get400ParamError = function (string) {
  return "400 required header param '" + string + "' missing or undefined";
};

middleware.checkParam400 = function (res, param, name) {
  if (param === null || typeof param === vals.UNDEFINED) {
    res.status(400).json(middleware.get400ParamError(name));
  }
  return param
};

middleware.createNewAndroidUser = function (user) {
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
