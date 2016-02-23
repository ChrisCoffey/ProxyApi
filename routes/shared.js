"use strict";
const express = require("express"),
  path = require('../middleware/middlewareGlobals.js'),
  auth = require('../middleware/authentication.js'),
  sharedMiddleware = require('../middleware/sharedLinkMiddleware.js'),
  router = express.Router();

/**
 * Update shared links for users.
 */
router.route(path.SHARED)
  .put(auth.ensureFirebaseAuthenticated, sharedMiddleware.putSharedLinks);

module.exports = router;
