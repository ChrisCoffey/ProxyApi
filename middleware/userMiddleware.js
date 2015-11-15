"use strict";
var middleware = require('../middleware/common');
var sharedMiddleware = require('../middleware/sharedMiddleware');
var userMiddleware = {};

/**
 * Get all users from Firebase. This returns a watered down version of a true User model object in the response.
 * Galen requested this so the web app doesn't download unnecessary info.
 * @param req request
 * @param res response
 */
userMiddleware.getAllWebUsers = function (req, res) {
  middleware.store.child("users").once("value", function (snapshot) {
    res.status(200).json(getAllWebUsers(snapshot));
  }, function (err) {
    console.log("users lookup error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
};

/**
 * Check if string is null or undefined and if so, return an empty string.
 * Otherwise return the input string converted to uppercase so one can match without case sensitivity.
 * @param snapshot input query name
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
  var name = user.first + " " + user.last;
  return name.trim();
}

/**
 * Search the users table for the input array of queryUsers.
 * @param req request
 * @param res response
 */
userMiddleware.getUsers = function (req, res) {
  middleware.store.child("users").once("value", function (snapshot) {
    var queryUsers = req.query.users;
    // you have no contacts
    if (queryUsers === null || queryUsers === 'undefined') {
      res.status(200).json([]);
    } else {
      var isArray = queryUsers.constructor === Array;
      res.status(200).json(getQueriedUsers(queryUsers, snapshot, isArray));
    }
  }, function (err) {
    console.log("users lookup error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
};

/**
 * Get queried users from a firebase user table snapshot
 * @param queryUsers
 * @param snapshot
 * @param isArray
 * @returns {Array}
 */
function getQueriedUsers(queryUsers, snapshot, isArray) {
  var result = [];
  //for every user in firebase, if they're in the query list, add them to the response result.
  snapshot.forEach(function (firebaseUser) {
    var data = firebaseUser.val();
    var id = data.id;
    var length = queryUsers.length;

    if (length != 0) {
      for (var i = 0; i < length; ++i) {
        if (isArray) {
          if (queryUsers[i] == id) {
            //push result data and remove user from the search list
            result.push(data);
            //use i's value and then decrement
            queryUsers.splice(i--, 1);
          }
        }
        else {
          if (queryUsers == id) {
            //there was a single user query, push result data and exit loop
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
 * Search for users based of their first, last, and first + last names.
 * @param req request
 * @param res response
 */
userMiddleware.searchUsers = function (req, res) {
  middleware.store.child("users").once("value", function (snapshot) {
    var result = [];
    var queryName = req.query.name;

    if (queryName === null || queryName === 'undefined') {
      res.status(401).send("401 required query param \"name\" missing");
    } else {
      //for every user in firebase, if they match the queryName, add them to the response result.
      snapshot.forEach(function (firebaseUser) {
        checkQueryUser(firebaseUser, queryName, result);
      });
    }
    //return result data as json string
    res.status(200).json(result);
  }, function (err) {
    console.log("user search error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
};

/**
 * Get a specific user.
 * @param req request
 * @param res response
 */
userMiddleware.getUser = function (req, res) {
  middleware.store.child("users").once("value", function (snapshot) {
    var queryId = req.query.id;

    if (queryId === null || queryId === 'undefined') {
      res.status(401).send("401 required query param \"Id\" missing");
    } else {
      //for every user in firebase, if they match the queryId, return them. Else 401.
      snapshot.forEach(function (firebaseUser) {
        var user = firebaseUser.val();
        if (user.id === queryId) {
          //return result data as json string
          res.status(200).json(user);
        }
      });
    }
    //return result data as json string
    res.status(401).send("401 could not find the entered user UUID");
  }, function (err) {
    console.log("user search error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
};


/**
 * Get a list of featured users.
 * @param req request
 * @param res response
 */
userMiddleware.getFeaturedUsers = function (req, res) {
  var featuredUserIds = [];
  var featuredUsers = [];
  var queryId = req.query.id;
  //get feature user id array
  middleware.store.child("featured").once("value", function (snapshot) {
    snapshot.forEach(function (userId) {
      featuredUserIds.add(userId.val());
    });
  }, function (err) {
    console.log("user search error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
  //get actual featured users and return them
  middleware.store.child("users").once("value", function (snapshot) {
    //for every user in firebase, if they match the featured user id, add them to the response list.
    snapshot.forEach(function (firebaseUser) {
      var user = firebaseUser.val();
      for (var i = 0; i < featuredUserIds.size(); i++) {
        if (user.id === featuredUserIds[i]) {
          featuredUsers.add(user);
        }
      }
    });
    //return result data as json string
    res.status(200).json(featuredUsers);
  }, function (err) {
    console.log("user search error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
};

/**
 * Get a specific user.
 * @param req request
 * @param res response
 */
userMiddleware.userFollowerCount = function (req, res) {
  middleware.store.child("users").once("value", function (snapshot) {
    var count = 0;
    var queryId = req.query.id;

    if (queryId === null || queryId === 'undefined') {
      res.status(401).send("401 required query param \"Id\" missing");
    } else {
      //for every user in firebase, if they match the queryName, add them to the response result.
      snapshot.forEach(function (firebaseUser) {
        var user = firebaseUser.val();
        var contacts = user.contacts;
        if (contacts != null && typeof contacts != 'undefined') {
          for (var i = 0; i < contacts.length; i++) {
            if (contacts[i] === queryId) {
              ++count;
              return;
            }
          }
        }
      });
      //return result data as json string
      res.status(200).json(count);
    }
  }, function (err) {
    console.log("user search error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
};

/**
 * Get a specific user.
 * @param req request
 * @param res response
 */
userMiddleware.sharedLink = function (req, res) {
  middleware.store.child("shared").once("value", function (snapshot) {
    var queryId = req.query.groupId;
    var userId = req.query.userId;
    if (userId === null || userId === 'undefined') {
      res.status(401).send("401 required query param \"userId\" missing");
    }
    if (queryId === null || queryId === 'undefined') {
      res.status(401).send("401 required query param \"groupId\" missing");
    }
    //for every link in firebase, if it contains the matching groupId, return the shared link
    snapshot.forEach(function (sharedLink) {
      var link = sharedLink.val();
      var linkGroupId = link.groupId;

      if (linkGroupId === queryId) {
        res.status(200).json(link);
      }
    });

    //TODO: GENERATE A NEW REQUEST INSTEAD OF LINKING THE QUERY PARAMS
    sharedMiddleware.putSharedLinks(req, res);
  }, function (err) {
    console.log("user search error: ", err);
    res.status(401).send("Error authenticating with firebase: ", err);
  });
};

/**
 * Capitalize the firebase user and queryName for comparison.
 * @param firebaseUser
 * @param result
 * @param queryName
 */
function checkQueryUser(firebaseUser, queryName, result) {
  var data = firebaseUser.val();
  var capitalizedName = filterNameParams(queryName);
  var first = filterNameParams(data.first);
  var last = filterNameParams(data.last);
  var fullname = first + " " + last
  // if the names aren't empty and the fullname starts with the query name;
  if (first != "" && last != "" && fullname.indexOf(capitalizedName) === 0) {
    result.push(data);
  }
}

/**
 * Check if string is null or undefined and if so, return an empty string.
 * Otherwise return the input string converted to uppercase so one can match without case sensitivity.
 * @param string input query name
 * @returns {string} uppercase input
 */
function filterNameParams(string) {
  return (string !== null && typeof string !== 'undefined') ? string.toUpperCase() : "";
}

module.exports = userMiddleware;