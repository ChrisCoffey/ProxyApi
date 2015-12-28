/**
 * Created by Evan on 11/17/15.
 */
var express = require("express");
var middleware = require('../middleware/common');
var sharedMiddleware = require('../middleware/sharedLinkMiddleware');
var router = express.Router();
router.put("/", middleware.ensureFirebaseAuthenticated, sharedMiddleware.putSharedLinks);

module.exports = router;