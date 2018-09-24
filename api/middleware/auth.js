var config = require('../../config');
var User = require('../models/User');
var jwt = require('jsonwebtoken');
var Firm = require('../models/Firm');



var unAuthRoutes = [
    {method:'POST',path:'/api/user/signup'},
    {method:'POST',path:'/api/user/login'},
    {method:'POST',path:'/api/user/forgotPassword'}
    ];

function getUser(token,req,res, cb){
    var decoded = jwt.verify(token, config.SECRET, function(err,decoded){
        if (!decoded) {
            cb(null, null);
        }
        else {
            User.findById(decoded.id, function(err, doc) {
                if (err || !doc) {
                    return  cb(err,null);
                }
                else{
                    return cb(null, doc);
                }
            });
        }
    });
}
function getFirm(user,req,res, cb){
    var id = user.firm;
        Firm.findById(id, function(err, doc) {
            if (err || !doc) {
                return  cb(err,null);
            }
            else{
                return cb(null, doc);
            }
        });
}
        
function getToken(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
}
var roCreateRoutes = [

    ];
var roBlockRoutes = [

    ];
var roViewRoutes = [

    ];
var inCreateRoutes = [

    ];
var inBlockRoutes = [

    ];
var inViewRoutes = [

    ];
var prCreateRoutes = [

    ];
var prBlockRoutes = [

    ];
var prViewRoutes = [

    ];

var accCreateRoutes = [

    ];
var accBlockRoutes = [
   
    ];
var accViewRoutes = [
   
    ];

function hasPermissions(request, user){
    if(roCreateRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Release_order == 1)
        return true;
        else
        return false;
    }
    if(roViewRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Release_order == 2)
        return true;
        else
        return false;
    }
    if(roBlockRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Release_order == 3)
        return true;
        else
        return false;
    }
    if(inCreateRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Invoice == 1)
        return true;
        else
        return false;
    }
    if(inViewRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Invoice == 2)
        return true;
        else
        return false;
    }
    if(inBlockRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Invoice == 3)
        return true;
        else
        return false;
    }
    if(prCreateRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Payment_receipts == 1)
        return true;
        else
        return false;
    }
    if(prBlockRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Payment_receipts == 2)
        return true;
        else
        return false;
    }
    if(prViewRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Payment_receipts == 3)
        return true;
        else
        return false;
    }
    if(accCreateRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Accounts == 1)
        return true;
        else
        return false;
    }
    if(accViewRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Accounts == 2)
        return true;
        else
        return false;
    }
    if(accBlockRoutes.findIndex(element => element.method == request.method && element.path == req.originalUrl) != -1)
    {
        if(user.roles.Accounts == 3)
        return true;
        else
        return false;
    }
    
}

module.exports = function(req, res, next){
    //var query = {method:req.method,path:req.originalUrl};
    //if(JSON.stringify(unAuthRoutes).indexOf(JSON.stringify(query)) >= 0)
    if (unAuthRoutes.findIndex(element => element.method == req.method && element.path == req.originalUrl) != -1)
    {
        next();
    }
    else{
        var token = getToken(req.headers);
        var user = getUser(token,req,res, function(err, user){
            if(err||!user){
                res.send({
                    succes:false,
                    msg:"User Not Found"
                })
            }
            else{
                if(hasPermissions(user, req)){
                    var firm = getFirm(user, req, res, function(err, firm){
                        if(err||!firm){
                            res.send({
                                succes:false,
                                msg:"Firm Not Found"
                            })
                        }
                        else{
                            res.locals.user = user;
                            res.locals.firm = firm;
                            next();
                        }
                    })
                }
                else{
                    res.send({
                        succes:false,
                        msg:"You don't have permissions for this module."
                    })
                }
            }
        })
    }
};