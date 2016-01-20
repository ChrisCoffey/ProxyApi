"use strict";
const express = require("express"),
  path = require('../middleware/middlewareGlobals'),
  auth = require('../middleware/authentication'),
  sharedMiddleware = require('../middleware/sharedLinkMiddleware'),
  router = express.Router();

/**
 * Update shared links for users.
 */
router.route(path.SHARED)
  .put(auth.ensureFirebaseAuthenticated, sharedMiddleware.putSharedLinks);

module.exports = router;
