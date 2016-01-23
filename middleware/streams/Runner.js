const
    state = require('../core/appStates.js');
    fileSys = require('fs');
    child = require('child_process');
    _ = require('underscore');

//This would be triggered by a timer
var launchLoop = function(ls, i){
    var p = child.fork("./middleware/streams/SteamFeed.js", [ls]);

    p.on(state.close, function(exitCode){
        console.log("ran process "+ i + "happily. Exited with code "+ exitCode);
    });
};

var x = [76561198256538946];
launchLoop(x, 1);
