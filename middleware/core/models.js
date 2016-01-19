var M = require('mongoose');

var activityEvent = new M.Schema({
    source: String,
    user: String,
    type: String
});

var activityFeed = new M.Schema({ 
    timestamp: Date,
    events: [activityEvent]
});

var currentEvents = new M.Schema({
    events: [activityEvent]
});

