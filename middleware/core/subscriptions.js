const 
    Scrapers = require('../streams/scraperBrain'),
    models = require('./models'),
    _ = require('underscore');

var SubscriptionMgr = function (store) {
    this._userStore = store;
    this.activeSubscriptions = {};
    this.channelSubscriptions = {};
};

SubscriptionMgr.prototype.add = function(pairs){
    _.each(pairs,  function (pair){
       if( !this.channelSubscriptions.hasOwnProperty(pair.channel) ){
           var s = Scrapers.Scraper(pair.channelName);
           Scrapers.registerScraper(s);
       }

       Scrapers.registerUser(pair);
    });
};

SubscriptionMgr.prototype.activate = function(userId, subscription) {
    this.activeSubscriptions[userId] = subscription;
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

Subscription.prototype.nextBlock = function(userIds, time) {
    //todo factor out all of this firebase bullshit
    var feed = models.feedSince(userIds, time);
    var events = _.map(feed,  function (block){
       var t = block.timestamp;
       _.each(block.events,  function (e){ e.time = t;  });
       return block.events;
    });

    return _.reduce(events,  function (acc, e){ acc.concat(e); }, []);
};

Subscription.prototype.start = function(pairs) {
    this.mgr.activate(this.userId, this);
    
    _.each(pairs, function(pair){
        this.mgr.add(pair);
    });
};

exports.manager = SubscriptionMgr;
exports.subscribe = function(userId, mgr){ return new Subscription(userId, mgr); };
