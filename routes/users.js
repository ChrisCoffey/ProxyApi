"use strict";
var google = require('../middleware/googleMiddleware');
var getMessage = require('../middleware/messagesMiddlewareGET');
var vals = require('../middleware/middlewareGlobals');

module.exports = function (express, store) {
  var app = express.Router();
  var auth = require('../middleware/authentication');
  auth.create(store);
  var getUser = require('../middleware/userMiddlewareGET');
  getUser.create(store);
  var putUser = require('../middleware/userMiddlewarePUT');
  putUser.create(store);
  /**
   * Base Users table lookup.
   */
  app.route(vals.ROOT_URL)
    .get(auth.ensureFirebaseAuthenticated, getUser.getContacts);
  /**
   * "Webusers", users just the way Galen wants them.
   */
  app.route(vals.WEBUSERS_URL)
    .get(auth.ensureFirebaseAuthenticated, auth.allowCrossDomainRequest, getUser.getAllWebUsers);
  /**
   * Search for users bases off their first, last and first + last names.
   */
  app.route(vals.SEARCH_URL)
    .get(auth.ensureFirebaseAuthenticated, getUser.searchUsers);
  /**
   * Get featured users objects based off the featured user tabled ids
   */
  app.route(vals.FEATURED_URL)
    .get(auth.ensureFirebaseAuthenticated, auth.allowCrossDomainRequest, getUser.getFeaturedUsers);
  /**
   * Update a user.
   */
  app.route(vals.USER_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(getUser.getUser)
    .put(putUser.updateUser);
  /**
   * Update user contacts.
   */
  app.route(vals.USER_CONTACTS_URL);
  /**
   * Update user channels.
   */
  app.route(vals.USER_CHANNELS_URL);
  /**
   * Update user groups.
   */
  app.route(vals.USER_GROUPS_URL)
    .put(auth.ensureFirebaseAuthenticated, putUser.updateUserGroups);
  /**
   * Calculate a users follower count or contacts following them.
   */
  app.route(vals.USER_FOLLOWER_COUNT_URL)
    .get(auth.ensureFirebaseAuthenticated, getUser.userFollowerCount);
  /**
   * Update a user's shared link.
   */
  app.route(vals.USER_SHARED_URL)
    .get(auth.ensureFirebaseAuthenticated, getUser.sharedLink);
  /**
   * Update a users android version number.
   */
  app.route(vals.USER_VERSION_URL)
    .put(auth.ensureFirebaseAuthenticated, putUser.updateUserVersion);
  /**
   * Update a users messages.
   */
  app.route(vals.MESSAGES_URL)
    .get(auth.ensureFirebaseAuthenticated, getMessage.getUserMessages);
  /**
   * Create a new person from google credentials.
   */
  app.route(vals.GOOGLE_PERSON_URL)
    .get(google.getGooglePerson);

  return app;
}