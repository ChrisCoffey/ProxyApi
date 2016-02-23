"use strict";
const middleware = require('../middleware/common.js'),
  httpRequest = require('request'),
  vals = require('../middleware/middlewareGlobals.js');
var googleMiddleware = {};

googleMiddleware.getGooglePerson = function (req, res, next) {
  var p1 = vals.USERID;
  var p2 = vals.AUTH;
  var userId = middleware.checkParam400(res, req.get(p1), p1);
  var auth = middleware.checkParam400(res, req.get(p2), p2);
  var userEndpoint = vals.GOOGLE_PLUS_PEOPLE_URL + userId;

  var options = {
    url: userEndpoint,
    qs: {key: auth}, //Query string data
    method: 'GET'
  };

  var callback = function (err, response, body) {
    if (err) {
      var error = new Error("Error retrieving google Person " + err);
      middleware.logError(error, err, res, next);
    } else {
      res.status(response.statusCode).json(body);
    }
  };

  httpRequest(options, callback);
};

//noinspection JSUnresolvedVariable
module.exports = googleMiddleware;