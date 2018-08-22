var Notification = require('../models/Notifications');
var User = require('../../api/models/User');
var Receipt = require('../../api/models/Receipt');
var FCM = require('fcm-push');
var serverkey = 'AAAAvsBQ9YQ:APA91bFjafZx6SqnGXcC3ujNH_qtaOQNFN-gBeqxpsr3MQaUMUdNJIxEL6h-x-dgFajjfP6a2R0nZpHA7TEl1xtflpia_pXVhVPhJwdRJoUDHXgyIGzMJHixvdveMDTbJRHcbiO-5C_R96SzJUafHKSFlZJQ2PmKXw';  //
var fcm = new FCM(serverkey);
var CronJob = require('cron').CronJob;

function getTokens(){
    return new Promise((resolve, reject)=>{
        User.find({}, function(err,users){
            if(err){
                reject(err);
            }
            else{
                var userTokens = [];
                users.forEach(obj => {
                    obj.deviceTokens.forEach(object => {
                        userTokens.push(object.token);
                    })
                })
                resolve(userTokens);
            }
        });
    });
}

module.exports.sendNotifs = async (request,response) => {
    var tokens = await getTokens();
    var message = {  
        to : tokens,
        notification : {
            title : request.body.title,
            body : request.body.notifBody
        }
    };
    fcm.send(message, function(err,res){  
        if(err) {
            response.send({
                success: false,
                msg : "Something has gone wrong! "+err
            });
        } else {
            response.send({
                success: true,
                msg : "Sent Notifications to users"
            });
        }
    });
    if(!request.body.oneTime){
        var notification = new Notification({
            title : request.body.title,
            body : request.body.notifBody
        });
        notification.save((err) => {
            if(err){
                comsole.log('Cannot save notification but it was sent');
            }
        })
    }
}

module.exports.getNotifications = (request,response) =>{
    Notification.find({})
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, notifications){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            Notification.count(query, function(err, count){
                response.send({
                    success:true,
                    notifications: notifications,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
}

module.exports.deleteNotification = (request,response) => {
    Notification.findByIdAndRemove(request.params.id,function(err){
        if(err){
            console.log(err);
            response.send({
                success:false,
                msg: err + ""
            });
        }
        else{
            response.send({
                success:true,
                msg: "Notification deleted"
            });
        }  
    })
}

var CronJob1 = new CronJob({
    cronTime: '00 00 09 * * * ',
    onTick: function () {
        sendShadowReminder();
    },
    start: true,
    runOnInit: false
});

async function sendShadowReminder(){
    var users = await User.find({});
    users.forEach(async user =>{
        var receipts = await Receipt.find({userID: user._id});
        var sum;
        receipts.forEach(receipt => {
            if(receipt.status === 0 )
            sum += receipt.FinalAmount;
        });
        var message = {  
            to : user.deviceTokens,
            notification : {
                title : "Ad Agency Manager",
                body : 'Today you have to collect '+sum+' amount from your employees'
            }
        };
        fcm.send(message, function(err,response){  
            if(err) {
                response.send({
                    success: false,
                    msg : "Something has gone wrong! "+err
                });
            } else {
                response.send({
                    success: true,
                    msg : "Sent Notifications to users"
                });
            }
        });
    })
}
