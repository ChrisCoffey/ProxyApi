const 
    _ = require('underscore'),
    supportedScrapers = {
        Steam: {bSize: 100, interval: 10}
    };

var scrapers = {};

var ChannelUser= function (channelName, userId){
    this.channelName = channelName;
    this.userId = userId;
};

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

//Exports
exports.registerScraper = function(sc) {
    scrapers[sc.name] = sc;
};

exports.alreadyRegistered = function(scraperName) {
    return scrapers.hasOwnProperty(scraperName);
};

exports.registerUser = function(pair){
    if(scrapers[pair.channelName] === undefined)
        return "No Scraper for Channel: " + pair.channelName;
    else {
        scrapers[pair.channelName].notify(pair.userId);
        return undefined;
    }
};

exports.Scraper = function(name){
    if(supportedScrapers.hasOwnProperty(name)){
        var args = supportedScrapers[name];
        return new Scraper(name, args.bSize, args.interval); 
    }
    else
        return "No Scraper for Channel: " + name;
};
exports.ChannelUser = function(cName, uId){ return new ChannelUser(cName, uId); };
