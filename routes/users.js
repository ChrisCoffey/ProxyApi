"use strict";
const google = require('../middleware/googlePersonMiddleware'),
  getMessage = require('../middleware/messagesMiddleware'),
  path = require('../middleware/middlewareGlobals'),
  auth = require('../middleware/authentication'),
  express = require('express'),
  app = express.Router();

module.exports = function (store) {
  const UserMiddleware = require('../middleware/userMiddleware'),
  user = new UserMiddleware(store);
  /**
   * Base Users table lookup.
   */
  app.route(path.ROOT_URL)
    .get(auth.ensureFirebaseAuthenticated, user.getContacts);
  /**
   * "Webusers", users just the way Galen wants them.
   */
  app.route(path.WEBUSERS_URL)
    .get(auth.ensureFirebaseAuthenticated, auth.allowCrossDomainRequest, user.getAllWebUsers);
  /**
   * Search for users bases off their first, last and first + last names.
   */
  app.route(path.SEARCH_URL)
    .get(auth.ensureFirebaseAuthenticated, user.searchUsers);
  /**
   * Get featured users objects based off the featured user tabled ids
   */
  app.route(path.FEATURED_URL)
    .get(auth.ensureFirebaseAuthenticated, auth.allowCrossDomainRequest, user.getFeaturedUsers);
  /**
   * Update a user.
   */
  app.route(path.USER_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(user.getUser)
    .put(user.updateUser);
  /**
   * Update user contacts.
   */
  app.route(path.USER_CONTACTS_URL);
  /**
   * Update user channels.
   */
  app.route(path.USER_CHANNELS_URL);
  /**
   * Update user groups.
   */
  app.route(path.USER_GROUPS_URL)
    .put(auth.ensureFirebaseAuthenticated, user.updateUserGroups);
  /**
   * Calculate a users follower count or contacts following them.
   */
  app.route(path.USER_FOLLOWER_COUNT_URL)
    .get(auth.ensureFirebaseAuthenticated, user.userFollowerCount);
  /**
   * Update a user's shared link.
   */
  app.route(path.USER_SHARED_URL)
    .get(auth.ensureFirebaseAuthenticated, user.sharedLink);
  /**
   * Update a users android version number.
   */
  app.route(path.USER_VERSION_URL)
    .put(auth.ensureFirebaseAuthenticated, user.updateUserVersion);
  /**
   * Update a users messages.
   */
  app.route(path.MESSAGES_URL)
    .get(auth.ensureFirebaseAuthenticated, getMessage.getUserMessages);
  /**
   * Create a new person from google credentials.
   */
  app.route(path.GOOGLE_PERSON_URL)
    .get(google.getGooglePerson);

  return app;
};