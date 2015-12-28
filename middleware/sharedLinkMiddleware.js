"use strict";
var middleware = require('../middleware/common');
var sharedMiddleware = {};

sharedMiddleware.putSharedLinks = function (req, res, next) {
  var result = [];
  var groupIds = req.query.groupId;
  if (groupIds === null || groupIds === 'undefined') {
    res.status(401).send("401 required query param \"groupId\" missing");
  }
  var userId = req.query.userId;
  if (userId === null || userId === 'undefined') {
    res.status(401).send("401 required query param \"userId\" missing");
  }
  var sharedLink = {id: "", groupId: "", userId: ""};

  if (groupIds.constructor === Array) {
    for (var i = 0; i < groupIds.length; i++) {
      sharedLink.id = middleware.guid();
      sharedLink.groupId = groupIds[i];
      sharedLink.userId = userId;
      putSharedLink(result, sharedLink);
    }
  } else {
    sharedLink.id = middleware.guid();
    sharedLink.groupId = groupIds;
    sharedLink.userId = userId;
    putSharedLink(result, sharedLink);
  }
  if(sharedLink != null || undefined)
  res.status(200).json(sharedLink);
};

function putSharedLink(result, sharedLink) {
  result.push(sharedLink);
  middleware.firebaseStore.child("shared").child(sharedLink.id).set(sharedLink);
}

module.exports = sharedMiddleware;