"use strict";
const google = require('../middleware/googlePersonMiddleware'),
  getMessage = require('../middleware/messagesMiddleware'),
  path = require('../middleware/middlewareGlobals'),
  auth = require('../middleware/authentication'),
  express = require('express'),
  app = express.Router();

//noinspection JSUnresolvedVariable
module.exports = function (store) {
  const user = new require('../middleware/userMiddleware')(store);
  /**
   * Base Users table lookup.
   */
  app.route(path.ROOT_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(user.getContacts);
  /**
   * "Webusers", users just the way Galen wants them.
   */
  app.route(path.WEBUSERS_URL)
    .all(auth.ensureFirebaseAuthenticated, auth.allowCrossDomainRequest)
    .get(user.getAllWebUsers);
  /**
   * Search for users bases off their first, last and first + last names.
   */
  app.route(path.SEARCH_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(user.searchUsers);
  /**
   * Get featured users objects based off the featured user tabled ids
   */
  app.route(path.FEATURED_URL)
    .all(auth.ensureFirebaseAuthenticated, auth.allowCrossDomainRequest)
    .get(user.getFeaturedUsers);
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
  app.route(path.USER_CONTACTS_URL)
    .all(auth.ensureFirebaseAuthenticated);
  /**
   * Update user channels.
   */
  app.route(path.USER_CHANNELS_URL)
    .all(auth.ensureFirebaseAuthenticated);
  /**
   * Update user groups.
   */
  app.route(path.USER_GROUPS_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .put(user.updateUserGroups);
  /**
   * Calculate a users follower count or contacts following them.
   */
  app.route(path.USER_FOLLOWER_COUNT_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(user.userFollowerCount);
  /**
   * Update a user's shared link.
   */
  app.route(path.USER_SHARED_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(user.sharedLink);
  /**
   * Update a users android version number.
   */
  app.route(path.USER_VERSION_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .put(user.updateUserVersion);
  /**
   * Update a users messages.
   */
  app.route(path.MESSAGES_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(getMessage.getUserMessages);
  /**
   * Create a new person from google credentials.
   */
  app.route(path.GOOGLE_PERSON_URL)
    .all(auth.ensureFirebaseAuthenticated)
    .get(google.getGooglePerson);

  return app;
};