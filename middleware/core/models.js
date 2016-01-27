var mongoose= require('mongoose');

var activityEvent = new mongoose.Schema({
    source: 'string',
    user: 'string',
    type: 'string' 
});

var feedRecord = new mongoose.Schema({
    timestamp: Date,
    events: [activityEvent]
});

var activityFeed = new mongoose.Schema({ records: [feedRecord] });

var ActivityFeed = mongoose.model('ActivityFeed', activityFeed, 'activity_feed');
var CurrentEvent = mongoose.model('CurrentEvents', activityEvent, 'current_events');

exports.saveNewEvent = function(evnt, onError){
    var ce = new CurrentEvent(evnt);
    console.log(evnt);
    ce.save(onError);
};

