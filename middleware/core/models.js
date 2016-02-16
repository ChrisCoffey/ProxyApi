var mongoose= require('mongoose');

var activityEvent = new mongoose.Schema({
    channel: 'string',
    user: 'string',
    url: 'string',
    message: 'string' 
});

var feedRecord = new mongoose.Schema({
    timestamp: Date,
    events: [activityEvent]
});

var ActivityFeed = mongoose.model('ActivityFeed', feedRecord, 'activity_feed');
var CurrentEvent = mongoose.model('CurrentEvents', activityEvent, 'current_events');

exports.saveNewEvent = function(evnt, onError){
    var ce = new CurrentEvent(evnt);
    ce.save(onError);
};

exports.feedSince = function(idList, time){
    ActivityFeed
        .find()
        .where('events.user').in(idLIst);
};
