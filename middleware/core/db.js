const S = require('./appStates.js');
var mongoose = require('mongoose');
var dbUri = process.env.MONGO_PATH;

mongoose.connect(dbUri);

mongoose.connection.on( S.CONNECTED, function(){
    console.log('Mongoose connected to ' + dbUri);
});

mongoose.connection.on( S.ERROR, function(er){
    console.log('Mongoose error: ' + er);
});

mongoose.connection.on( S.DISCONNECTED, function(){
    console.log('Mongoose disconnected from ' + dbUri);
});

var closeConnection = function (msg, callback) {
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected from '+msg);
        callback();
    });
};

process.on(S.SIGINT, function(){
    closeConnection('signalled termination', function(){
        process.exit(0); 
    });
});

require('./models');
