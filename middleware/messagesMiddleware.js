"use strict";
const middleware = require('../middleware/common.js'),
  vals = require('../middleware/middlewareGlobals.js'),
  _ = require('underscore');

var MessageMiddleware = function (store) {
  this._firebaseStore = store;
};

_.extend(MessageMiddleware.prototype, {
  getUserMessages: function (req, res, next) {
    var p1 = vals.USERID;
    var userId = middleware.checkParam400(res, req.get(p1), p1);
    this._firebaseStore.child(vals.MESSAGES).once(vals.VALUE, function (snapshot) {
      res.status(200).json(getPendingMessages(userId, snapshot));
    }, function (err) {
      var errorMessage = "getUserMessages failed: " + err;
      middleware.logError(errorMessage, err, res, next)
    });
  }
});

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

//noinspection JSUnresolvedVariable
module.exports = MessageMiddleware;
