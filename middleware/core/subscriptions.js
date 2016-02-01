const 
    firebaseClient = require('firebase'),
    scraperBrain = require('../streams/scraperBrain'),
    models = require('./models'),
    _ = require('underscore');

var activeSubscriptions = {};

var Subscription = function(userId){
    this.userId = userId;
};

Subscription.prototype.nextBlock = function(time){
    var feed = ActivityFeed.find()
        .where('time').gt(time)
        .limit(10)
        .sort('-time')
        .exec();

    firebaseClient.
    _.filter()
};

Subscription.prototype.start = function() {

    var userChannels = firebaseClient.getChannelsForUser(this.userId);
    var pairs =  _.map(userChannels, function(chan){
        return {userId: this.userId, channelName: chan.name};
    });
    _.each(pairs, function(pair){
        scraperBrain.registerUser(pair);
    });
    var id = this.userId;
    activeSubscriptions[id].this;
};

exports.subscribe = function(userId){ return new Subscription(userId) };
exports.getSubscription = function(userId){ 
    if(activeSubscriptions.hasOwnProperty(userId)){
        return [activeSubscriptions.userId];
    } else{
        return [];
    }
};

