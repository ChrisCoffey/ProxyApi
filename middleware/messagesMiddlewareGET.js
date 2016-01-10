"use strict";
var middleware = require('../middleware/common');
var vals =require('../middleware/middlewareGlobals');
var getMiddleware = {};

getMiddleware.getUserMessages = function (req, res, next) {
  var p1 = vals.USERID;
  var userId = middleware.checkParam400(req.get(p1), p1);
  middleware.firebaseStore.child(vals.MESSAGES).once(vals.VALUE, function (snapshot) {
    res.status(200).json(getPendingMessages(userId, snapshot));
  }, function (err) {
    var errorMessage = "getUserMessages failed: " + err;
    middleware.logError(errorMessage, err, res, next)
  });
};

/**
 * Get the pending message objects for the specified user id.
 * @param snapshot input header name
 * @param userId id to look up messages for
 * @returns {Array} uppercase input
 */
function getPendingMessages(userId, snapshot) {
  var userMessages = [];
  snapshot.forEach(function (message) {
    var value = message.val();
    if (value.userId === userId) {
      userMessages.push();
    }
  });
  return userMessages;
}

module.exports = getMiddleware;