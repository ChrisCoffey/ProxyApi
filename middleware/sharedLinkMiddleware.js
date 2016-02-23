"use strict";
const middleware = require('../middleware/common.js'),
  vals = require('../middleware/middlewareGlobals.js'),
  _ = require('underscore');

var firebaseStore;
var SharedMiddleware = function (store) {
  firebaseStore = store;
};
_.extend(SharedMiddleware.prototype, {
  putSharedLinks: function (req, res) {
    var result = [];
    var p1 = vals.USERID;
    var p2 = vals.GROUPID;
    var userId = middleware.checkParam400(res, req.get(p1), p1);
    var groupIdParam = middleware.checkParam400(res, req.get(p2), p2);
    var sharedLink = {id: "", groupId: "", userId: ""};

    putSharedLinks(groupIdParam, sharedLink, userId, result);

    if (sharedLink != null || typeof sharedLink === vals.UNDEFINED)
      res.status(200).json(sharedLink);
  }
});

function putSharedLinks(groupIdParam, sharedLink, userId, result) {
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
}

function putSharedLink(result, sharedLink) {
  result.push(sharedLink);
  firebaseStore.child(vals.SHARED).child(sharedLink.id).set(sharedLink);
}

//noinspection JSUnresolvedVariable
module.exports = SharedMiddleware;
