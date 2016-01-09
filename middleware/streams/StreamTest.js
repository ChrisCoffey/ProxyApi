console.log("Doing important work calling some Stream an api for ids: " + process.argv[2] );

//the idea is that each stream client will work as follows:
//    parse in the required arguments (whatever they may be)
//    save results to Mongo (log failures somewhere too, possibly push to admins?)
//    return correct exit code (failure if a fatal api error occured, otherwise 1)
//
//
//The API can then consume from Mongo without any issues
//
//Anytime a user logs in, the people in their channels will be added to the feed & "subscribed"
//in either the Runner (short term), Mongo, or Redis. I'd probably introduce storage in that order, with Redis being the solution to your upcoming champagne problems
