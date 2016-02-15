const _ = require('underscore');

var ScraperManager = function() {
    var scrapers = {};
};

ScraperManager.prototype.get = function(channelName) {
    if(this.scrapers[channelName] === undefined)
        return []
    else {
        return [this.scrapers[channelName]];
    }
};



var ChannelUser= function (channelName, userId){
    this.channelName = channelName;
    this.userId = userId;
}

var Scraper = function(name, batchSize, interval) {
    this.name = name;
    this.batchSize = batchSize;
    this.interval = interval;
    this.queuedIds = [];
    this.activeIds = [];
};

Scraper.prototype.getBach = function() {
    this.queuedIds = this.queuedIds.concat(this.activeIds);
    this.activeIds = _.first(this.queuedIds, this.interval);
    this.queuedIds = _.difference(this.queuedIds, this.activeIds);
    return this.activeIds;
};

Scraper.prototype.notify = function(userId) {
    this.queuedIds.push(userId);
};

var scrapers = {};


//Exports
exports.registerScraper = function(sc) {
    scrapers[sc.name] = sc;
};

exports.registerUser = function(pair){
    if(scrapers[pair.channelName] === undefined)
        return "No Scraper for Channel: " + pair.channelName;
    else {
        scrapers[pair.channelName].notify(pair.userId);
        undefined;
    }
};
exports.Scraper = function(name, bSize, interval){ return new Scraper(name, bSize, interval) };
exports.ChannelUser = function(cName, uId){ return new ChannelUser(cName, uId)};
