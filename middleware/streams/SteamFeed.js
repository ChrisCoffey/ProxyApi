var
    _ = require('underscore'),
    util = require('util'),
    http = require('http'),
    steamHost = "api.steampowered.com",
    key = process.env.STEAM_KEY;
    db = require('../core/db.js'),
    M = require('mongoose');
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
function parseResponse(js) {
    var responseBody = JSON.parse(js).response;
    var players = responseBody.players;
    
    return _.map(players, function(player){
        return {
            source: "Steam",
            user: player.personaname,
            type: "Inactive"
        };
    });
}

var childSchema = new M.Schema({ source: 'string', user: 'string', type: 'string' });

var parentSchema = new M.Schema({
  children: [childSchema]
});
var Parent = M.model('Parent', parentSchema);
var p = new Parent({children: []});

function save(messages) {
    console.log(messages);
    p.children.push(messages[0]);
    console.log(p.children);
}

function processBatch(userIds) {
    var requestString = makeRequest(ISteamUser, 'getUser', userIds);
    
    http.get({
        hostname: steamHost,
        port: 80,
        path: requestString,
        agent: false  
        }, function(res) { //todo factor this out into another function
            res.on("data", function(chunk) { _.compose(save, parseResponse)(chunk) })
            }
   );
}

processBatch(process.argv[2]);
