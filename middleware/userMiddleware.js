"use strict";
const _ = require('underscore'),
  middleware = require('../middleware/common'),
  sharedMiddleware = require('../middleware/sharedLinkMiddleware'),
  vals = require('../middleware/middlewareGlobals'),
  subscriptions = require('../middleware/core/subscriptions');

var UserMiddleware = function (store) {
  this._firebaseStore = store;
  this.subscriptionManager = subscriptions.manager(store);
};

/**
 * Functions for module export.
 */
_.extend(UserMiddleware.prototype, {

  subscribeToActivityFeed: function(req, res, next){
      var userId = middleware.checkParam400(res, req.get(vals.USERID), vals.USERID);
      var sub = subscriptions.subscribe(userId, this.subscriptionManager);
      sub.start();
      res.status(200);
  },
  fetchNextFeedBlock: function(req, res, next){
      var userId = middleware.checkParam400(res, req.get(vals.USERID), vals.USERID);
      var time = middleware.checkParam400(res, req.get(vals.TIME), vals.TIME);
      
      this._firebaseStore.child(vals.USERS).child(userId).once(vals.VALUE, function (snapshot) {
        var contacts = snapshot.contacts;  
        var sub = this.subscriptionManager.get(userId);
        var records = _.map(sub, function(s){
            s.nextBlock(time);
        });

        res.status(200).json(records);
      });
  },
  modifyUserGroups: function (userId, groups, res, next) {
    this._firebaseStore.child(vals.USERS).child(userId).child(vals.GROUPS)
      .update(groups, function (error) {
        if (error) {
          res.status(400).send("Error updating user groups: " + error);
          next(error);
        } else {
          res.status(200);
        }
      });
  },
  updateUserGroups: function (req, res, next) {
    // we don't check these params for 400 responses because either could be null,
    // this function can be broken up if we want into updateGroup() and updateGroups()
    var groups = req.get(vals.GROUPS);
    var group = req.get(vals.GROUP);
    var userId = middleware.checkParam400(res, req.get(vals.USERID), vals.USERID);
    // we check to see if there are "groups" in the header
    if (groups !== null || typeof groups !== vals.UNDEFINED) {
      this.modifyUserGroups(userId, groups, res, next);
    }
    // if there aren't any "groups" then there is most likely a "group" header param
    if (group !== null || typeof group !== vals.UNDEFINED) {
      this.modifyUserGroups(userId, group, res, next);
    } else {
      res.status(400).json(middleware.get400ParamError(vals.GROUP));
    }
  },
  /**
   * Get all users from Firebase. This returns a watered down version of a true User model object in the response.
   * Galen requested this so the web app doesn't download unnecessary info.
   * @param req request
   * @param res response
   * @param next
   */
  getAllWebUsers: function (req, res, next) {
    this._firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
      res.status(200).json(getWebUsers(snapshot));
    }, function (err) {
      var errorMessage = "getAllWebUsers failed: " + err;
      middleware.logError(errorMessage, err, res, next);
    });
  },
  /**
   * Search the users table for the input array of headerUsers which are a user's contacts.
   * @param req request
   * @param res response
   * @param next
   */
  getContacts: function (req, res, next) {
    this._firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
      var p1 = vals.USERS;
      var headerUsers = middleware.checkParam400(res, req.get(p1), p1);
      var isArray = headerUsers.constructor === Array;
      res.status(200).json(getQueriedUsers(headerUsers, snapshot, isArray));

    }, function (err) {
      var errorMessage = "getContacts failed: " + err;
      middleware.logError(errorMessage, err, res, next);
    });
  },
  /**
   * Search for users based of their first, last, and first + last names.
   * @param req request
   * @param res response
   * @param next
   */
  searchUsers: function (req, res, next) {
    this._firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
      var result = [];
      var p1 = vals.NAME;
      var name = middleware.checkParam400(res, req.get(p1), p1);
      //for every user in firebase, if they match the headerName, add them to the response result.
      snapshot.forEach(function (firebaseUser) {
        compareUserToQuery(firebaseUser, name, result);
      });
      //return result data as json string
      res.status(200).json(result);
    }, function (err) {
      var errorMessage = "searchUsers failed: " + err;
      middleware.logError(errorMessage, err, res, next);
    });
  },
  /**
   * Get a specific user.
   * @param req request
   * @param res response
   * @param next
   */
  getUser: function (req, res, next) {
    var p1 = vals.USERID;
    var userId = middleware.checkParam400(res, req.get(p1), p1);
    this._firebaseStore.child(vals.USERS).child(userId).once(vals.VALUE, function (snapshot) {
      res.status(200).json(snapshot.val());
    }, function (err) {
      var errorMessage = "getUser failed: " + err;
      middleware.logError(errorMessage, err, res, next);
    });
  },


  /**
   * Get a list of featured users.
   * @param req request
   * @param res response
   * @param next
   */
  getFeaturedUsers: function (req, res, next) {
    var featuredUserIds = [];
    var featuredUsers = [];
    //get feature user id array
    this._firebaseStore.child(vals.FEATURED).once(vals.VALUE, function (snapshot) {
      snapshot.forEach(function (userId) {
        featuredUserIds.push(userId.val());
      });
    }, function (err) {
      console.log("user search error: ", err);
      res.status(400).send("Error authenticating with firebase: ", err);
    });
    //get actual featured users and return them
    this._firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
      //for every user in firebase, if they match the featured user id, add them to the response list.
      snapshot.forEach(function (firebaseUser) {
        var user = firebaseUser.val();
        for (var i = 0; i < featuredUserIds.length; i++) {
          if (user.id === featuredUserIds[i]) {
            featuredUsers.push(user);
            featuredUserIds.splice(i, 1);
          }
        }
      });
      //return result data as json string
      res.status(200).json(featuredUsers);
    }, function (err) {
      var errorMessage = "getFeaturedUsers failed: " + err;
      middleware.logError(errorMessage, err, res, next);
    });
  },

  /**
   * Get a specific user.
   * @param req request
   * @param res response
   * @param next
   */
  userFollowerCount: function (req, res, next) {
    this._firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
      var count = 0;
      var p1 = vals.USERID;
      var userId = middleware.checkParam400(res, req.get(p1), p1);
      //for every user in firebase, if they match the headerName, add them to the response result.
      snapshot.forEach(function (firebaseUser) {
        var user = firebaseUser.val();
        var contacts = user.contacts;
        if (contacts !== null && typeof contacts != vals.UNDEFINED) {
          for (var i = 0; i < contacts.length; i++) {
            if (contacts[i] === userId) {
              ++count;
              return;
            }
          }
        }
      });
    }, function (err) {
      var errorMessage = "userFollowerCount failed: " + err;
      middleware.logError(errorMessage, err, res, next);
    });
  },


  /**
   * Get a specific user.
   * @param req request
   * @param res response
   * @param next function
   */
  sharedLink: function (req, res, next) {
    this._firebaseStore.child(vals.SHARED).once(vals.VALUE, function (snapshot) {
      var p1 = vals.GROUPID;
      var groupId = middleware.checkParam400(res, req.get(p1), p1);
      var createLink = true;
      //for every link in firebase, if it contains the matching groupId, return the shared link
      snapshot.forEach(function (sharedLink) {
        var link = sharedLink.val();
        var linkGroupId = link.groupId;

        if (linkGroupId === groupId) {
          res.status(200).json(link);
          createLink = false;
        }
      });
      if (createLink) {
        sharedMiddleware.putSharedLinks(req, res, next);
      }
    }, function (err) {
      var errorMessage = "sharedLink failed: " + err;
      middleware.logError(errorMessage, err, res, next);
    });
  },


  /**
   * Delete a User's group.
   * @param req
   * @param res
   * @param next
   */
  deleteUserGroup: function (req, res, next) {
    var p1 = vals.USERID;
    var p2 = vals.GROUPID;
    var userId = middleware.checkParam400(res, req.get(p1), p1);
    var groupId = middleware.checkParam400(res, req.get(p2), p2);

    this._firebaseStore.child(vals.USERS).child(userId).child(groupId).remove(function (error) {
      if (error) {
        res.status(400).send("Error removing user group: ", error);
        next(error)
      } else {
        res.status(200);
      }
    });
  },

  /**
   * Delete a User's contact.
   * @param req request
   * @param res response
   * @param next function
   */
  deleteUserContact: function (req, res, next) {
    var p1 = vals.USERID;
    var p2 = vals.CONTACTID;
    var userId = middleware.checkParam400(res, req.get(p1), p1);
    var contactId = middleware.checkParam400(res, req.get(p2), p2);

    this._firebaseStore.child(vals.USERS).child(userId).child(contactId).remove(function (error) {
      if (error) {
        res.status(400).send("Error removing user group: ", error);
        next(error)
      } else {
        res.status(200);
      }
    });
  },

  updateUserVersion: function (req, res, next) {
    var p1 = vals.USERID;
    var p2 = vals.VERSION;
    var version = {androidVersion: ""};
    var userId = middleware.checkParam400(res, req.get(p1), p1);
    version.androidVersion = middleware.checkParam400(res, req.get(p2), p2);

    this._firebaseStore.child(vals.USERS).child(userId).update(version, function (err) {
      if (err) {
        var error = "Error updating user version: " + err;
        middleware.logError(error, err, res, next)
      } else {
        res.status(200).send(version);
      }
    });
  },

  updateUser: function (req, res, next) {
    console.log("data" + util.inspect(req.body));
    var p1 = vals.USERID;
    var p2 = vals.USER;
    var userId = middleware.checkParam400(res, req.get(p1), p1);
    var user = middleware.checkParam400(res, req.body, p2);

    this._firebaseStore.child(vals.USERS).child(userId).update(user, function (err) {
      if (err) {
        var error = "Error updating user: " + err;
        middleware.logError(error, err, res, next)
      } else {
        res.status(200).json(user);
      }
    });
  }
});

//noinspection JSUnresolvedVariable
module.exports = UserMiddleware;

/**
 * Get queried users from a firebase user table snapshot
 * @param headerUsers
 * @param snapshot
 * @param isArray
 * @returns {Array}
 */
function getQueriedUsers(headerUsers, snapshot, isArray) {
  var result = [];
  //for every user in firebase, if they're in the header list, add them to the response result.
  snapshot.forEach(function (firebaseUser) {
    var data = firebaseUser.val();
    var id = data.id;
    var length = headerUsers.length;

    if (length !== 0) {
      for (var i = 0; i < length; ++i) {
        if (isArray) {
          if (headerUsers[i] == id) {
            //push result data and remove user from the search list
            result.push(data);
            //use i's value and then decrement
            headerUsers.splice(i--, 1);
          }
        }
        else {
          if (headerUsers == id) {
            //there was a single user header, push result data and exit loop
            result.push(data);
            return true;
          }
        }
      }
    }
    else {
      // if there are no more queried users to find, exit the loop
      return true;
    }
  });
  return result;
}
/**
 * Get the full name concatenation of a user. Users are not required to have last names, so trim the fat if its empty
 * or undefined.
 * @param user
 * @returns {string}
 */
function getFullName(user) {
  var first = user.first;
  var last = user.last;
  var name;
  if (first !== null && typeof first !== vals.UNDEFINED) {
    if (last !== null && typeof last !== vals.UNDEFINED) {
      name = user.first + " " + user.last;
    } else {
      name = user.first;
    }
  } else {
    name = user.last;
  }
  return name.trim();
}

/**
 * Check if string is null or undefined and if so, return an empty string.
 * Otherwise return the input string converted to uppercase so one can match without case sensitivity.
 * @param snapshot input header name
 * @returns {Array} uppercase input
 */
function getWebUsers(snapshot) {
  var userArray = [];
  snapshot.forEach(function (firebaseUser) {
    userArray.push(getWebUser(firebaseUser.val()));
  });
  return userArray;
}

/**
 * Create a user from a firebase user snapshot val.
 * @param user
 * @returns {{id: string, name: string, profileURL: string}}
 */
function getWebUser(user) {
  var webUser = {id: "", name: "", profileURL: ""};
  webUser.id = user.id;
  webUser.name = getFullName(user);
  webUser.profileURL = user.profileURL;
  return webUser;
}

/**
 * Capitalize the firebase user's name and the queried string for comparison.
 * @param firebaseUser
 * @param result
 * @param name queried
 */
function compareUserToQuery(firebaseUser, name, result) {
  var data = firebaseUser.val();
  var capitalizedName = filterNameParams(name);
  var first = filterNameParams(data.first);
  var last = filterNameParams(data.last);
  var fullname = first + " " + last;
  // if the names aren't empty and the fullname starts with the header name;
  if (fullname.indexOf(capitalizedName) === 0) {
    result.push(data);
  }
}

/**
 * Check if string is null or undefined and if so, return an empty string.
 * Otherwise return the input string converted to uppercase so one can match without case sensitivity.
 * @param string input header name
 * @returns {string} uppercase input
 */
function filterNameParams(string) {
  //noinspection JSUnresolvedFunction
  return (string !== null && typeof string !== vals.UNDEFINED) ? string.toUpperCase() : "";
}
