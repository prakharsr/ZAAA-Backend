var config = require('../../config');
var userController = require('./userController');
var User = require('../models/User');
var MediaHouse = require('../models/MediaHouse');
var Client = require('../models/Client');
var Invoice = require('../models/Invoice');
var ReleaseOrder = require('../models/ReleaseOrder');
var ClientNote = require('../models/ClientNotes');
var MediaHouseNote = require('../models/MediaHouseNotes');
var mongoose = require('mongoose');
var perPage=20;

module.exports.createClientNote = function(request,response){
    var user =reponse.locals.user;
    Invoice.findOne({invoiceNO: request.body.invoiceNO, firm:user.firm}, (err,invoice) => {
        if(err){
            response.send({
                success: false,
                msg: 'Cannot find Invoice'
            })
        }
        else{
            var clientNote = new ClientNote({
                clientName: invoice.clientName,
                invoiceNO: request.body.invoiceNO,
                amount: request.body.amount,
                amountWords: request.body.amountWords,
                remark: request.body.remark,
                date: request.body.date,
                DocId: invoice._id,
                firm: user.firm,
                user: user._id
            });
            
            clientNote.save((err) => {
                if(err){
                    response.send({
                        success: false,
                        msg:'Cannot save note'
                    })
                }
                else{
                    response.send({
                        success: true,
                        msg:'Note saved'
                    })
                }
            })
        }
    })
}

module.exports.createMediaHouseNote = function(request,response){
    var user = reponse.locals.user;
    ReleaseOrder.findOne({releaseOrderNO: request.body.releaseOrderNO, firm:user.firm}, (err,releaseorder) => {
        var mediaHouseNote = new MediaHouseNote({
            publicationName: releaseorder.publicationName,
            publicationState: releaseorder.publicationState,
            releaseOrderNO: request.body.releaseOrderNO,
            amount: request.body.amount,
            remark: request.body.remark,
            date: request.body.date,
            DocId: releaseorder._id,
            firm: user.firm,
            user: user._id
        });
        
        mediaHouseNote.save((err) => {
            if(err){
                response.send({
                    success: false,
                    msg:'Cannot save note'
                })
            }
            else{
                response.send({
                    success: true,
                    msg:'Note saved'
                })
            }
        })
    })
}

function searchClientID(request, response, user){
    return new Promise((resolve, reject) => {
        Client.find(
            {$and: [
                {firm:mongoose.mongo.ObjectId(user.firm)},
                {'OrganizationName': request.body.clientName},
                {'Address.state': request.body.clientState}
            ]}
        ).exec(function(err, client){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (client.length===0)
            {
                
                resolve(null);
                
            }
            if(client.length!==0){
                clientID =  client[0]._id;
                resolve(clientID);
            }
        });
    });
}
function searchMediahouseID(request, response, user){
    return new Promise((resolve, reject) => {
        MediaHouse.find({$and: [
            {'PublicationName':request.body.publicationName},
            {"Address.edition":request.body.publicationEdition},
            {'firm':mongoose.mongo.ObjectId(user.firm)}
        ]}).exec( function(err, mediahouse){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (mediahouse.length == 0)
            {
                resolve(null)
            }
            if(mediahouse.length!==0){
                console.log("mediahouse found");
                mediahouseID =  mediahouse[0]._id;
                resolve(mediahouseID)
            }
        });
    })
}


function formQuery(mediahouseID, clientID, date, user, request){
    return new Promise((resolve, reject) => {
        var query = {'firm':user.firm};
        if(mediahouseID)
        query['mediahouseID']=mongoose.mongo.ObjectId(mediahouseID);
        if(clientID)
        query['clientID'] = mongoose.mongo.ObjectId(clientID);
        if(request.body.insertionPeriod){
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
        }
        resolve(query);    
    })
}

module.exports.queryClientNote = async function(request, response){
	var user = response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    
    var query = await formQuery(mediahouseID, clientID, date, user, request);
    console.log(query);
    ClientNote.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, note){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            ClientNote.count(query, function(err, count){
                console.log(note, count)
                response.send({
                    success:true,
                    note: note,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
};


module.exports.queryMediaHouseNoteForRO = async function(request, response){
	var user =response.locals.user;

    MediaHouseNote.find({firm:user.firm, DocId: request.body.DocId} )
    .sort('-createdAt')
    .exec(function(err, note){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
                console.log(note, note.length);
                response.send({
                    success:true,
                    notes: note,
                });            
        }
    });
};


module.exports.queryMediaHouseNote = async function(request, response){
	var user =response.locals.user;
    var mediahouseID =await searchMediahouseID(request, response, user);
    var clientID = await searchClientID(request, response, user);
    var date = (request.body.date)?(request.body.date):null;
    
    var query = await formQuery(mediahouseID, clientID, date, user, request);
    console.log(query);
    MediaHouseNote.find(query)
    .limit(perPage)
    .skip((perPage * request.body.page) - perPage)
    .exec(function(err, note){
        if(err){
            console.log(err+ "");
            response.send({
                success:false,
                msg: err +""
            });
        }
        else{
            MediaHouseNote.count(query, function(err, count){
                console.log(note, count)
                response.send({
                    success:true,
                    note: note,
                    page: request.body.page,
                    perPage:perPage,
                    pageCount: Math.ceil(count/perPage)
                });
            })
            
        }
    });
};

/*Pdf creation not working => Not clear on layout of notes*/

module.exports.mailClientNotePdf = function(request, response) {
    var user = response.locals.user;
    ClientNote.findById(request.body.id, async function(err, note){
        if(err){
            console.log(err);
            response.send({
                success :false,
                msg: err 
            });
        }
        else if(!note){
            response.send({
                success :false,
                msg: 'Note not found' 
            });
        }
        else{
            var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
            var client = await Client.findById(note.DocId);
            var Add = firm.OfficeAddress;
            var Address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var Add = client.Address;
            var address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var cdetails = '';
            if(firm.Mobile) cdetails += 'MOB '+firm.Mobile;
            if(firm.OtherMobile) cdetails += ' '+firm.OtherMobile;
            if(firm.Email) cdetails += ' '+firm.Email;
            var insertions = '<tr><td>'+client.OrganizationName+'</td><td>'+'</td><td>'+note.amount+'</td><td></td></tr>';
            
            var Details = {
                image : 'http://adagencymanager.com/'+firm.LogoURL,
                sign : 'http://adagencymanager.com/'+user.signature,
                faddress : Address,
                fcdetails : cdetails,
                cname : client.OrganizationName,
                address :address,
                amtwords :note.amountWords,
                amtfig: note.amount,
                insertions : insertions
            }
            pdf.mailClientNote(request,response,Details);
        }
    })
}

module.exports.generateClientNotePdf = function(request, response) {
    var user = response.locals.user;
    ClientNote.findById(request.body.id, async function(err, note){
        if(err){
            console.log(err);
            response.send({
                success :false,
                msg: err 
            });
        }
        else if(!note){
            response.send({
                success :false,
                msg: 'Note not found' 
            });
        }
        else{
            var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
            var client = await Client.findById(note.DocId);
            var Add = firm.OfficeAddress;
            var Address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var Add = client.Address;
            var address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
            var cdetails = '';
            if(firm.Mobile) cdetails += 'MOB '+firm.Mobile;
            if(firm.OtherMobile) cdetails += ' '+firm.OtherMobile;
            if(firm.Email) cdetails += ' '+firm.Email;
            var insertions = '<tr><td>'+client.OrganizationName+'</td><td>'+'</td><td>'+note.amount+'</td><td></td></tr>';
            
            var Details = {
                image : config.domain+'/'+firm.LogoURL,
                sign : config.domain+'/'+user.signature,
                faddress : Address,
                fcdetails : cdetails,
                cname : client.OrganizationName,
                address :address,
                amtwords :note.amountWords,
                amtfig: note.amount,
                insertions : insertions
            }
            pdf.generateClientNote(request,response,Details);
        }
    })
}
