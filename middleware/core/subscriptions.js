const 
    firebaseClient = require('firebase'),
    scraperBrain = require('scraperBrain'),
    _ = require('underscore');

var activeSubscriptions = [];

var Subscription = function(userId){
    this.userId = userId;
};

Subscription.prototype.cancel = function() {
    
};

Subscription.prototype.start = function() {

    var userChannels = firebaseClient.getChannelsForUser(this.userId);
    var pairs =  _.map(userChannels, function(chan){
        return {userId: this.userId, channelName: chan.name};
    });
    _.each(pairs, function(pair){
        scraperBrain.registerUser(pair);
    });

    activeSubscriptions.push(this);
};

exports.subscribe = function(userId){ return new Subscription(userId) };


//client calls subscribe()
//server creates a subscription
//subscription calls firebase and gets channels
//subscription adds subscriptions for all channel+user combos
//feed handles it from there

//
