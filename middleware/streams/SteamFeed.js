const
    db = require('../core/db.js'),
    mongoose = require('mongoose'),
    util = require('util'),
    http = require('http'),
    steamHost = "api.steampowered.com",
    key = process.env.STEAM_KEY;
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

function processBatch(userIds) {
    var requestString = makeRequest(ISteamUser, 'getUser', userIds);
    
    http.get({
        hostname: steamHost,
        port: 80,
        path: requestString,
        agent: false  
        }, function(res) { //todo factor this out into another function
            res.on("data", function(chunk) {
                console.log("BODY: " + chunk);
                var ce = mongoose.model('CurrentEvents');

                var x = ce.find({}).exec(function(err, docs){ console.log(docs);});
                console.log(x);

                ce.save({ events:[ 
                        {
                            source: "Steam",
                            user: JSON.parse(chunk).response.players[0].personaname,
                            type: "PLaying a Game"
                        }
                    ]
                    }
                )}
            )}
    );
}

processBatch(process.argv[2]);
