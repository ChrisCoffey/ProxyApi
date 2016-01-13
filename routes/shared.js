"use strict";
var express = require("express");
var middleware = require('../middleware/common');
var sharedMiddleware = require('../middleware/sharedLinkMiddlewarePUT');
var router = express.Router();
var SHARED = "/";

/**
 * Update shared links for users.
 */
router.route(SHARED)
  .put(middleware.ensureFirebaseAuthenticated, sharedMiddleware.putSharedLinks);

module.exports = router;
