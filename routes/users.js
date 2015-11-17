"use strict";
var express = require("express");
var middleware = require('../middleware/common');
var userMiddleware = require('../middleware/userMiddleware');
var router = express.Router();

router.get("/", middleware.ensureAuthenticated, userMiddleware.getUsers);
router.get("/webusers", middleware.ensureAuthenticated, middleware.allowCrossDomainRequest,
  userMiddleware.getAllWebUsers);
router.get("/search", middleware.ensureAuthenticated, userMiddleware.searchUsers);
router.get("/featured", middleware.ensureAuthenticated, userMiddleware.getFeaturedUsers);
router.get("/user", middleware.ensureAuthenticated, userMiddleware.getUser);
router.get("/user/following", middleware.ensureAuthenticated, userMiddleware.userFollowerCount);
router.get("/user/shared", middleware.ensureAuthenticated, userMiddleware.sharedLink);
module.exports = router;
