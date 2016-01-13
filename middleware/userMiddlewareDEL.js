"use strict";
var middleware = require('../middleware/common');
var vals = require('../middleware/middlewareGlobals');
var delMiddleware = {};

delMiddleware.deleteUserGroup = function (req, res, next) {
  var p1 = vals.USERID;
  var p2 = vals.GROUPID;
  var userId = middleware.checkParam400(req.get(p1), p1);
  var groupId = middleware.checkParam400(req.get(p2), p2);
  middleware.firebaseStore.child(vals.USERS).child(userId).child(groupId).remove(function (error) {
    if (error) {
      res.status(400).send("Error removing user group: ", error);
      next(error)
    } else {
      res.status(200);
    }
  });
};

delMiddleware.deleteUserContact = function (req, res, next) {
  var p1 = vals.USERID;
  var p2 = vals.CONTACTID;
  var userId = middleware.checkParam400(req.get(p1), p1);
  var contactId = middleware.checkParam400(req.get(p2), p2);

  middleware.firebaseStore.child(vals.USERS).child(userId).child(contactId).remove(function (error) {
    if (error) {
      res.status(400).send("Error removing user group: ", error);
      next(error)
    } else {
      res.status(200);
    }
  });
};

module.exports = delMiddleware;