const
    state = require('../core/appStates.js'),
    fileSys = require('fs'),
    child = require('child_process'),
    ScraperBrain = require('./scraperBrain.js'),
    API_LIMIT = 100000,
    _ = require('underscore');

var SteamScraper = ScraperBrain.Scraper('Steam', 100, 10000);
ScraperBrain.registerScraper(SteamScraper);

var a = ScraperBrain.ChannelUser(SteamScraper.name, "76561197992206547");
ScraperBrain.registerUser(a);
var b = ScraperBrain.ChannelUser(SteamScraper.name, "76561197975148673");
ScraperBrain.registerUser(b);

function scrape(){
    var ls = SteamScraper.getBach();
    var p = child.fork("./middleware/streams/SteamFeed.js", ls);

    p.on(state.close, function(exitCode){
        console.log("ran process " + SteamScraper.name + " happily. Exited with code "+ exitCode);
    });
};

setInterval(scrape, SteamScraper.interval);

