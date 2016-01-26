const
    state = require('../core/appStates.js'),
    fileSys = require('fs'),
    child = require('child_process'),
    ScraperBrain = require('./scraperBrain.js'),
    API_LIMIT = 100000,
    _ = require('underscore');

var SteamScraper = ScraperBrain.Scraper('Steam', 100, 10000);
ScraperBrain.registerScraper(SteamScraper);
SteamScraper.callCount = 0;

var a = ScraperBrain.ChannelUser(SteamScraper.name, "76561197992206547");
ScraperBrain.registerUser(a);
var b = ScraperBrain.ChannelUser(SteamScraper.name, "76561197975148673");
ScraperBrain.registerUser(b);

function runBatch(){
    var ls = SteamScraper.getBach();
    var p = child.fork("./middleware/streams/SteamFeed.js", ls);
    
    p.on(state.EXIT, function(exitCode){
        console.log("ran process " + SteamScraper.name + " happily. Exited with code "+ exitCode);
    });
    return ls.length;
};

function scrape(){
    if(SteamScraper.callCount >= API_LIMIT){
        clearInterval(timerLoop);
    }
    else {
        SteamScraper.callCount += runBatch()
    }
};

var timerLoop = setInterval(scrape, SteamScraper.interval);

