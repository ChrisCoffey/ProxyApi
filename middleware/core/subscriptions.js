const 
    firebaseClient = require('firebase'),
    scraperBrain = require('scraperBrain'),
    models = require('models'),
    _ = require('underscore');

var activeSubscriptions = {};

var Subscription = function(userId){
    this.userId = userId;
};

Subscription.prototype.cancel = function() {
    
};

Subscription.prototype.nextBlock = function(time){
    
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

//client calls subscribe()
//server creates a subscription
//subscription calls firebase and gets channels
//subscription adds subscriptions for all channel+user combos
//feed handles it from there

//
