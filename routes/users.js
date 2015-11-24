"use strict";
var express = require("express");
var middleware = require('../middleware/common');
var userMiddleware = require('../middleware/userMiddleware');
var router = express.Router();

router.get("/", middleware.ensureFirebaseAuthenticated, userMiddleware.getUsers);
router.get("/webusers", middleware.ensureFirebaseAuthenticated, middleware.allowCrossDomainRequest,
  userMiddleware.getAllWebUsers);
router.get("/search", middleware.ensureFirebaseAuthenticated, userMiddleware.searchUsers);
router.get("/featured", middleware.ensureFirebaseAuthenticated, middleware.allowCrossDomainRequest,
  userMiddleware.getFeaturedUsers);
router.get("/user", middleware.ensureFirebaseAuthenticated, userMiddleware.getUser);
router.get("/user/following", middleware.ensureFirebaseAuthenticated, userMiddleware.userFollowerCount);
router.get("/user/shared", middleware.ensureFirebaseAuthenticated, userMiddleware.sharedLink);
module.exports = router;
