const
    S = require('../core/appStates.js');
    fs = require('fs');
    cp = require('child_process');
    _ = require('underscore');

//This would be triggered by a timer
var launchLoop = function(ls, i){
    var p = cp.fork("./middleware/streams/SteamFeed.js", [ls]);

    p.on(S.close, function(exitCode){
        console.log("ran process "+ i + "happily. Exited with code "+ exitCode);
    });
};

var x = [76561198256538946];
launchLoop(x, 1);
