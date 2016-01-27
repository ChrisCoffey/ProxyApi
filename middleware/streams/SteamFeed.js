var
    _ = require('underscore'),
    util = require('util'),
    http = require('http'),
    steamHost = "api.steampowered.com",
    key = process.env.STEAM_KEY,
    channel = 'Steam',
    models = require('../core/models.js'),
    db = require('../core/db.js'); //necessary b/c of the process fork

//use this to resolve a user's vanity url-> http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=EE9DBBAF6AB57D4A48378D01FCE47C0A&vanityurl=dwittzexmachina
const ISteamUser = {
    name:"ISteamUser",
    methods: {
        getUser: {
            name: "GetPlayerSummaries",
            version: "v0002",
            paramF: function(ids) { return util.format("&steamids=%s" ,ids)}
        }
    }    
};

function makeRequest(callObj, name, args){
    var url = util.format("/%s/%s/%s", 
            callObj.name, 
            callObj.methods[name].name, 
            callObj.methods[name].version);

    var queryParams = util.format("?key=%s", key);
    if(callObj.methods[name].paramF != undefined){
        queryParams = queryParams + callObj.methods[name].paramF(args);
    }

    return url + queryParams;
}

function findStatus(i){
    switch(i){
        case   1: return "Online";
        case   2: return "Busy";
        case   3: return "Away";
        case   4: return "Snooze";
        default : return "Offline";
    }
}

function parseResponse(js) {
    var responseBody = JSON.parse(js).response;
    var players = responseBody.players;
    return _.map(players, function(player){
        return {
            channel: channel,
            url: player.profileurl,
            user: player.steamid,
            type: util.format("%s is %s ",
                    player.personaname,
                    findStatus(player.personastate))
        };
    });
}

function save (messages){
    _.each(messages, function(msg){
        models.saveNewEvent(msg, function(e, m){console.log(e + m);});
    });
}

function shutdown() {
    db.shutdown();
    setTimeout(function(){ process.exit(0)}, 5000); //consider finding/writing a flush method of some sort
};

function processBatch(userIds) {
    var requestString = makeRequest(ISteamUser, 'getUser', userIds);
    
    http.get({
        hostname: steamHost,
        port: 80,
        path: requestString,
        agent: false  
        }, function(res) { //todo factor this out into another function
            res.on("data", function(chunk) {_.compose( shutdown ,save, parseResponse)(chunk) })
            }
   );
}

processBatch(process.argv[2]);
