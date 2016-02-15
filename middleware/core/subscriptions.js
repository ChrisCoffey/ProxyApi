const 
    firebaseClient = require('firebase'),
    scraperBrain = require('../streams/scraperBrain'),
    models = require('./models'),
    _ = require('underscore');

var SubscriptionMgr = function (store) {
    this._userStore = store;
    this.activeSubscriptions = {};
    this.channelSubscriptions = {};
};

SubscriptionMgr.prototype.add = function(subscription){
        
};

SubscriptionMgr.prototype.get = function(userId){
    if(this.activeSubscriptions.hasOwnProperty(userId)){
        return [this.activeSubscriptions.userId];
    } else {
        return [];
    }
};

var Subscription = function(userId, mgr){
    this.manager = mgr;
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

exports.manager = SubscriptionMgr;
exports.subscribe = function(userId, mgr){ return new Subscription(userId, mgr) };

