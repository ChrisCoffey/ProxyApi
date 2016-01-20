var mongoose = require('mongoose');
var util = require('util');
var http = require('http');
var steamHost = "api.steampowered.com";
var key = process.env.STEAM_KEY;
var ISteamUser = {
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

function processBatch(userIds) {
    var requestString = makeRequest(ISteamUser, 'getUser', userIds);
    
    http.get({
        hostname: steamHost,
        port: 80,
        path: requestString,
        agent: false  
        }, function(res) {
            console.log(res); 
            res.on("data", function(chunk) {
                console.log("BODY: " + chunk);
            });
        }
    );
}

processBatch(process.argv[2]);
