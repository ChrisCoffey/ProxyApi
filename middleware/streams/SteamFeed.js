var Steam = require('steam');
var username = process.env.STEAM_USER
var password = process.env.STEAM_PW

//NOTE this code will be spawned by the runner

var steamClient = new Steam.SteamClient();
var steamUser = new Steam.SteamUser(steamClient);
steamClient.connect();
steamClient.on('connected', function() {
      steamUser.logOn({
              account_name: 'username',
              password: 'password'
            });
});
steamClient.on('logOnResponse', function() { /* ... */});

//need to create a feed manager
