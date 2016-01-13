"use strict";
var middleware = require('../middleware/common');
var vals = require('../middleware/middlewareGlobals');
var putMiddleware = {};

putMiddleware.updateUser = function (req, res, next) {
  var p1 = vals.USERID;
  var p2 = vals.USER;
  var userId = middleware.checkParam400(req.get(p1), p1);
  var user = middleware.checkParam400(req.get(p2), p2);

  middleware.firebaseStore.child(vals.USERS).child(userId).update(user, function (error) {
    if (error) {
      res.status(400).send("Error updating user: ", error);
      next(error)
    } else {
      res.status(200);
    }
  });
};

putMiddleware.updateUserVersion = function (req, res, next) {
  var p1 = vals.USERID;
  var p2 = vals.VERSION;
  var version = {androidVersion: ""};
  var userId = middleware.checkParam400(req.get(p1), p1);
  version.androidVersion = middleware.checkParam400(req.get(p2), p2);

  middleware.firebaseStore.child(vals.USERS).child(userId).update(version, function (error) {
    if (error) {
      res.status(400).send("Error updating user version: ", error);
      next(error)
    } else {
      res.status(200).send(version);
    }
  });
};

putMiddleware.updateUserGroups = function (req, res, next) {
  // we don't check these params for 400 responses because either could be null,
  // this function can be broken up if we want into updateGroup() and updateGroups()
  var groups = req.get(vals.GROUPS);
  var group = req.get(vals.GROUP);
  var userId = middleware.checkParam400(req.get(vals.USERID));

  // we check to see if there are "groups" in the header
  if (groups !== null || typeof groups !== vals.UNDEFINED) {
    updateUsersGroups(userId, groups, res, next);
  }
  // if there aren't any "groups" then there is most likely a "group" header param
  if (group !== null || typeof group !== vals.UNDEFINED) {
    updateUsersGroups(userId, group, res, next);
  } else {
    res.status(400).json(middleware.get400ParamError(vals.GROUP));
  }
};

function updateUsersGroups(userId, groups, res, next) {
  middleware.firebaseStore.child(vals.USERS).child(userId).child(vals.GROUPS).update(groups, function (error) {
    if (error) {
      res.status(400).send("Error updating user groups: ", error);
      next(error)
    } else {
      res.status(200);
    }
  });
}

module.exports = putMiddleware;