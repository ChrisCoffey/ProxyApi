"use strict";
var middleware = require('../middleware/common');
var vals = require('../middleware/middlewareGlobals');
var sharedMiddleware = {};

sharedMiddleware.putSharedLinks = function (req, res, next) {
  var result = [];
  var p1 = vals.USERID;
  var p2 = vals.GROUPID;
  var userId = middleware.checkParam400(res, req.get(p1), p1);
  var groupIdParam = middleware.checkParam400(res, req.get(p2), p2);
  var sharedLink = {id: "", groupId: "", userId: ""};

  if (groupIdParam.constructor === Array) {
    for (var i = 0; i < groupIdParam.length; i++) {
      sharedLink.id = middleware.guid();
      sharedLink.groupId = groupIdParam[i];
      sharedLink.userId = userId;
      putSharedLink(result, sharedLink);
    }
  } else {
    sharedLink.id = middleware.guid();
    sharedLink.groupId = groupIdParam;
    sharedLink.userId = userId;
    putSharedLink(result, sharedLink);
  }
  if (sharedLink != null || typeof sharedLink === vals.UNDEFINED)
    res.status(200).json(sharedLink);
};

function putSharedLink(result, sharedLink) {
  result.push(sharedLink);
  middleware.firebaseStore.child(vals.SHARED).child(sharedLink.id).set(sharedLink);
}

module.exports = sharedMiddleware;