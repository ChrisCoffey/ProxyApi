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
M.model('ActiityFeed', activityFeed, 'ActivityFeed');

var currentEvents = new M.Schema({
    events: [activityEvent]
});
M.model('CurrentEvents', currentEvents, 'CurrentEvents');
