"use strict";
var middleware = require('../middleware/common');
var sharedMiddleware = require('../middleware/sharedLinkMiddlewarePUT');
var vals = require('../middleware/middlewareGlobals');
var firebaseStore;
var getMiddleware = (function () {
  var instance;

  function createInstance(store) {
    var object = {};
    firebaseStore = store;
    return object;
  }

  return {
    create: function (store) {
      if (!instance) {
        instance = createInstance(store);
      }
      return instance;
    }
  };

})();

/**
 * Get all users from Firebase. This returns a watered down version of a true User model object in the response.
 * Galen requested this so the web app doesn't download unnecessary info.
 * @param req request
 * @param res response
 * @param next
 */
getMiddleware.getAllWebUsers = function (req, res, next) {
  firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
    res.status(200).json(getAllWebUsers(snapshot));
  }, function (err) {
    var errorMessage = "getAllWebUsers failed: " + err;
    middleware.logError(errorMessage, err, res, next);
  });
};

/**
 * Check if string is null or undefined and if so, return an empty string.
 * Otherwise return the input string converted to uppercase so one can match without case sensitivity.
 * @param snapshot input header name
 * @returns {Array} uppercase input
 */
function getAllWebUsers(snapshot) {
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
 * Search the users table for the input array of headerUsers which are a user's contacts.
 * @param req request
 * @param res response
 * @param next
 */
getMiddleware.getContacts = function (req, res, next) {
  firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
    var p1 = vals.USERS;
    var headerUsers = middleware.checkParam400(res, req.get(p1), p1);
    var isArray = headerUsers.constructor === Array;
    res.status(200).json(getQueriedUsers(headerUsers, snapshot, isArray));

  }, function (err) {
    var errorMessage = "getContacts failed: " + err;
    middleware.logError(errorMessage, err, res, next);
  });
};

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

    if (length != 0) {
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
 * Capitalize the firebase user and headerName for comparison.
 * @param firebaseUser
 * @param result
 * @param name
 */
function checkHeaderUser(firebaseUser, name, result) {
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
  return (string !== null && typeof string !== vals.UNDEFINED) ? string.toUpperCase() : "";
}

/**
 * Search for users based of their first, last, and first + last names.
 * @param req request
 * @param res response
 * @param next
 */
getMiddleware.searchUsers = function (req, res, next) {
  firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
    var result = [];
    var p1 = vals.NAME;
    var name = middleware.checkParam400(res, req.get(p1), p1);
    //for every user in firebase, if they match the headerName, add them to the response result.
    snapshot.forEach(function (firebaseUser) {
      checkHeaderUser(firebaseUser, name, result);
    });
    //return result data as json string
    res.status(200).json(result);
  }, function (err) {
    var errorMessage = "searchUsers failed: " + err;
    middleware.logError(errorMessage, err, res, next);
  });
};

/**
 * Get a specific user.
 * @param req request
 * @param res response
 * @param next
 */
getMiddleware.getUser = function (req, res, next) {
  var p1 = vals.USERID;
  var userId = middleware.checkParam400(res, req.get(p1), p1);
  firebaseStore.child(vals.USERS).child(userId).once(vals.VALUE, function (snapshot) {
    res.status(200).json(snapshot.val());
  }, function (err) {
    var errorMessage = "getUser failed: " + err;
    middleware.logError(errorMessage, err, res, next);
  });
};


/**
 * Get a list of featured users.
 * @param req request
 * @param res response
 * @param next
 */
getMiddleware.getFeaturedUsers = function (req, res, next) {
  var featuredUserIds = [];
  var featuredUsers = [];
  //get feature user id array
  firebaseStore.child(vals.FEATURED).once(vals.VALUE, function (snapshot) {
    snapshot.forEach(function (userId) {
      featuredUserIds.push(userId.val());
    });
  }, function (err) {
    console.log("user search error: ", err);
    res.status(400).send("Error authenticating with firebase: ", err);
  });
  //get actual featured users and return them
  firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
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
};

/**
 * Get a specific user.
 * @param req request
 * @param res response
 * @param next
 */
getMiddleware.userFollowerCount = function (req, res, next) {
  var p1 = vals.USERID;
  var userId = middleware.checkParam400(res, req.get(p1), p1);
  var count = 0;

  middleware.firebaseStore.child(vals.USERS).once(vals.VALUE, function (snapshot) {
    //for every user in firebase, if they match the headerName, add them to the response result.
    snapshot.forEach(function (firebaseUser) {
      var user = firebaseUser.val();
      var contacts = user.contacts;
      if (contacts != null && typeof contacts != vals.UNDEFINED) {
        for (var i = 0; i < contacts.length; i++) {
          if (contacts[i] === userId) {
            ++count;
            return;
          }
        }
      }
    });
    res.status(200).send(count);
  }, function (err) {
    var errorMessage = "userFollowerCount failed: " + err;
    middleware.logError(errorMessage, err, res, next);
  });
};


/**
 * Get a specific user.
 * @param req request
 * @param res response
 * @param next
 */
getMiddleware.sharedLink = function (req, res, next) {
  firebaseStore.child(vals.SHARED).once(vals.VALUE, function (snapshot) {
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
};

module.exports = getMiddleware;
