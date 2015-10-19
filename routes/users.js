"use strict";
var express = require("express");
var middleware = require('../middleware/common');
var userMiddleware = require('../middleware/userMiddleware');
var router = express.Router();

router.get("/", middleware.ensureAuthenticated, userMiddleware.getUsers);
router.get("/webusers", middleware.ensureAuthenticated, userMiddleware.getAllWebUsers);
router.get("/search", middleware.ensureAuthenticated, userMiddleware.searchUsers);
module.exports = router;
