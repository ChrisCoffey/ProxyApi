var mongoose = require('mongoose');

var activityEvent = new mongoose.Schema({
    source: String,
    user: String,
    type: String
});

var activityFeed = new mongoose.Schema({
    timestamp: Date,
    events: [activityEvent]
});
M.model('ActivityFeed', activityFeed, 'ActivityFeed');

var currentEvents = new mongoose.Schema({
    events: [activityEvent]
});
M.model('CurrentEvents', currentEvents, 'CurrentEvents');
