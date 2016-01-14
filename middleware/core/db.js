var mongoose = require('mongoose');
var dbUri = "mongodb://localhost/proxy"

mongoose.connect(dbUri);

mongoose.connection.on('connected', function(){
    console.log('Mongoose connected to ' + dbUri);
});

mongoose.connection.on('error', function(er){
    console.log('Mongoose error: ' + er);
});

mongoose.connection.on('disconnected', function(){
    console.log('Mongoose disconnected from ' + dbUri);
});

var closeConnection = function (msg, callback) {
    mongoose.connection.close(function(){
        console.log('Mongoose disconnected from '+msg);
        callback();
    });
};

process.on('SIGINT', function(){
    closeConnection('signalled termination', function(){
        process.exit(0); 
    });
});
