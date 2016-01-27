var Subscription = function(userId){
    this.userId = userId;
};

Subscription.prototype.cancel = function(){
};


exports.subscribe = function()

//client calls subscribe()
//server creates a subscription
//subscription calls firebase and gets channels
//subscription adds subscriptions for all channel+user combos
//feed handles it from there

//
