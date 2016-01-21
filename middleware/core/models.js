var M = require('mongoose');

var activityEvent = new M.Schema({
    source: 'string',
    user: 'string',
    type: 'string' 
});

var activityFeed = new M.Schema({ 
    timestamp: Date,
    events: [activityEvent]
});
exports.ActivityFeed = M.model('ActiityFeed', activityFeed);

var currentEvents = new M.Schema({
    events: [activityEvent]
});

exports.CurrentEvents = M.model('CurrentEvents', currentEvents);
