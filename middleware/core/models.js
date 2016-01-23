var mongoose= require('mongoose'),
    _ = require('underscore');

var activityEvent = new mongoose.Schema({
    source: 'string',
    user: 'string',
    type: 'string' 
});

var feedRecord = new mongoose.Schema({
    timestamp: Date,
    events: [activityEvent]
});

function getOrElse(colName, mName, genCol) {
    var c = _.find(mongoose.connection.collections, 
            function(col){ 
                return col.name == colName});
    if(!c){
        c = genCol();
        console.log("aqui!!");
        c.save();
    }
    console.log(mongoose.model(mName));
    return c;
}

var activityFeed = new mongoose.Schema({ records: [feedRecord] });

const _af = 'activity_feed',
      _afM = 'ActivityFeed';
var ActivityFeed = mongoose.model(_afM, activityFeed, _af);
var af = getOrElse(_af, _afM, function(){ return new ActivityFeed( {records: []}); });
exports.ActivityFeed = af;


var currentEvents = new mongoose.Schema({
    events: [activityEvent]
});

const _ce = 'current_events',
      _ceM ='CurrentEvents';
var CurrentEvents = mongoose.model(_ceM, currentEvents, _ce);
var ce = getOrElse(_ce, _ceM,function(){ return new CurrentEvents({ events: []}); });
exports.CurrentEvents = ce;
