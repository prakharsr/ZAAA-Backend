var Notification = require('../models/Notifications');
var User = require('../../api/models/User');
var Receipt = require('../../api/models/Receipt');
var FCM = require('fcm-push');
var serverkey = 'AAAAu8UiRLk:APA91bG_gPsYwr8q2ChL1LRLeYUCasxKPnMumEuCnmUq0oh0MmiISMD6XeTByhg0BNO_bqDKrzUSzW42doeV70Eb-qvnJYzXM455cOEZGWNW-9cdlWVWPnQxVVVOFhham_eGbHpnYw3S';  //
var fcm = new FCM(serverkey);
var cron = require('node-cron');

function getUsers(){
    return new Promise((reject,resolve)=>{
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
    var tokens = await getUsers();
    var message = {  
        to : tokens,
        notification : {
            title : request.body.title,
            body : request.body.notifBody
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

cron.schedule('* 08 * * *', ()=>{
    sendShadowReminder();
    sendPaymentReminder();
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

async function sendPaymentReminder(){
    var users = await User.find({});
    users.forEach(async user =>{
        var receipts = await Receipt.find({userID: user._id});
        var sum;
        receipts.forEach(receipt => {
            if(receipt.status === 1 )
            sum += receipt.FinalAmount;
        });
        var message = {  
            to : user.deviceTokens,
            notification : {
                title : "Ad Agency Manager",
                body : 'Today you have to collect '+sum+' amount for your receipts'
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
