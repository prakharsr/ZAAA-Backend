var config = require('../../config');
var userController = require('./userController');
var User = require('../models/User');
var Invoice = require('../models/Invoice');
var ReleaseOrder = require('../models/ReleaseOrder');
var ClientNote = require('../models/ClientNotes');
var MediaHouseNote = require('../models/MediaHouseNotes');
var mongoose = require('mongoose');

module.exports.createClientNote = function(request,response){
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err + ""
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "Please Login"
			});
        }
        else{
            var invoice = Invoice.findOne({invoiceNO: request.body.invoiceNO}, (err,invoice) => {
                var clientNote = new ClientNote({
                    clientName: invoice.clientName,
                    invoiceNO: request.body.invoiceNO,
                    amount: request.body.amount,
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
            })
        }
    });
}

module.exports.createMediaHouseNote = function(request,response){
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err + ""
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "Please Login"
			});
        }
        else{
            var releaseOrder = ReleaseOrder.findOne({releaseOrderNO: request.body.releaseOrderNO}, (err,releaseorder) => {
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
    });
}


function searchExecutiveID(request, response, user){
    return new Promise((resolve, reject) => {
        Executive.find({$and: [
            {'ExecutiveName':request.body.executiveName},
            {'OrganizationName':request.body.executiveOrg}
        ]}).exec(function(err, executive){
            if(err)
            {
                console.log(err);
                reject(err);
                return;
            }
            else if (executive.length===0)
            {
                    resolve(null);
            
            }
            if(executive.length!==0){
                executiveID =  executive[0]._id;
                resolve(executiveID);
            }
        })
    })
}

function searchClientID(request, response, user){
    return new Promise((resolve, reject) => {
        Client.find(
            {$and: [
                {$or:[
                    {firm:mongoose.mongo.ObjectId(user.firm)},
                    {global:true}
                ]},
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
            {$or:[{'firm':mongoose.mongo.ObjectId(user.firm)},{global:true}]}
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
         if(request.body.creationPeriod)
        {
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.creationPeriod);
            query['date']={$gte: from, $lte:to} 
        }
        else{
            var to = new Date()
            var from = new Date(1);
            query['date']={$gte: from, $lte:to} 
        }
        if(request.body.insertionPeriod){
            var to = new Date()
            var from = new Date( to.getFullYear(), to.getMonth, to.getDay - request.body.insertionPeriod);
        }
        resolve(query);    
    })
}

module.exports.queryClientNote = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
                var mediahouseID =await searchMediahouseID(request, response, user);
                var clientID = await searchClientID(request, response, user);
                var executiveID = await searchExecutiveID(request, response, user);
                var date = (request.body.date)?(request.body.date):null;
                
                var query = await formQuery(mediahouseID, clientID, date, user, request);
                
                ClientNote.find(query)
                .limit(perPage)
                .skip((perPage * request.body.page) - perPage)
                .exec(function(err, invoice){
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
        }	
	});
};


module.exports.queryMediaHouseNote = async function(request, response){
	var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, async function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "User not found, Please Login"
			});
		}
		else{
                var mediahouseID =await searchMediahouseID(request, response, user);
                var clientID = await searchClientID(request, response, user);
                var executiveID = await searchExecutiveID(request, response, user);
                var date = (request.body.date)?(request.body.date):null;
                
                var query = await formQuery(mediahouseID, clientID, date, user, request);
                
                MediaHouseNote.find(query)
                .limit(perPage)
                .skip((perPage * request.body.page) - perPage)
                .exec(function(err, invoice){
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
        }	
	});
};

/*Pdf creation not working => Not clear on layout of notes*/

module.exports.mailClientNotePdf = function(request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err + ""
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "Please Login"
			});
        }
        else {
            Receipt.findById(request.body.id, async function(err, receipt){
                if(err){
                    console.log(err);
                    response.send({
                        success :false,
                        msg: err 
                    });
                }
                else if(!receipt){
                    response.send({
                        success :false,
                        msg: 'Receipt not found' 
                    });
                }
                else{
                    var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
                    var client = await Client.findById(receipt.clientID);
                    var invoice = await Invoice.findById(receipt.invoiceID);
                    var Add = firm.OfficeAddress;
                    var Address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
                    var Add = client.Address;
                    var address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
                    var cdetails = '';
                    var details='';
                    if(firm.Mobile) cdetails += 'MOB '+firm.Mobile;
                    if(firm.OtherMobile) cdetails += ' '+firm.OtherMobile;
                    if(firm.Email) cdetails += ' '+firm.Email;
                    var insertions = '<tr><td>'+client.OrganizationName+'</td><td>'+invoice.InvoiceNo+'</td><td>'+receipt.paymentAmount+'</td><td></td></tr>';
                    insertions+= '<tr><td>'+receipt.paymentType+'</td><td>'+'</td><td>'+'</td><td>'+receipt.p+'</td><td>';
                    if(receipt.paymentType == 'NEFT'){
                        details+='<p> Payment ID:'+receipt.paymentNo+'</p>\n<p> Payment Date'+ receipt.paymentDate+'</p>';
                    }
                    else if(receipt.paymentType == 'Cheque'){
                        details+='<p> Cheque No. :'+receipt.paymentNo+'</p>\n<p> Payment Date :'+ receipt.paymentDate+'</p>\n<p> Bank :'+receipt.paymentBankName;
                    }
                    else{
                        details+='<p> Payment Date :'+receipt.paymentDate;
                    }
                    
                    var Details = {
                        image : 'http://www.mom2k18.co.in/'+firm.LogoURL,
                        sign : 'http://www.mom2k18.co.in/'+user.signature,
                        faddress : Address,
                        fcdetails : cdetails,
                        cname : client.OrganizationName,
                        address :address,
                        rno :receipt.ReceiptNo,
                        amtwords :receipt.paymentAmountWords,
                        amtfig: receipt.paymentAmount,
                        insertions : insertions,
                        details : details
                    }
                    pdf.mailPaymentReceipt(request,response,Details);
                }
            })
        }
    });
}

module.exports.generateClientNotePdf = function(request, response) {
    var token = userController.getToken(request.headers);
    var user = userController.getUser(token,request,response, function(err, user){
		if(err){
			console.log(err);
			response.send({
				success:false,
				msg:err + ""
			});
		}
		else if(!user){
			console.log("User not found");
			response.send({
				success:false,
				msg : "Please Login"
			});
        }
        else {
            Receipt.findById(request.body.id, async function(err, receipt){
                if(err){
                    console.log(err);
                    response.send({
                        success :false,
                        msg: err 
                    });
                }
                else if(!receipt){
                    response.send({
                        success :false,
                        msg: 'Receipt not found' 
                    });
                }
                else{
                    var firm =  await Firm.findById(mongoose.mongo.ObjectId(user.firm));
                    var client = await Client.findById(receipt.clientID);
                    var invoice = await Invoice.findById(receipt.invoiceID);
                    var Add = firm.OfficeAddress;
                    var Address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
                    var Add = client.Address;
                    var address = Add.address+', '+Add.city+', '+Add.state+' '+Add.pincode;
                    var cdetails = '';
                    var details='';
                    if(firm.Mobile) cdetails += 'MOB '+firm.Mobile;
                    if(firm.OtherMobile) cdetails += ' '+firm.OtherMobile;
                    if(firm.Email) cdetails += ' '+firm.Email;
                    var insertions = '<tr><td>'+client.OrganizationName+'</td><td>'+invoice.InvoiceNo+'</td><td>'+receipt.paymentAmount+'</td><td></td></tr>';
                    insertions+= '<tr><td>'+receipt.paymentType+'</td><td>'+'</td><td>'+'</td><td>'+receipt.p+'</td><td>';
                    if(receipt.paymentType == 'NEFT'){
                        details+='<p> Payment ID:'+receipt.paymentNo+'</p>\n<p> Payment Date'+ receipt.paymentDate+'</p>';
                    }
                    else if(receipt.paymentType == 'Cheque'){
                        details+='<p> Cheque No. :'+receipt.paymentNo+'</p>\n<p> Payment Date :'+ receipt.paymentDate+'</p>\n<p> Bank :'+receipt.paymentBankName;
                    }
                    else{
                        details+='<p> Payment Date :'+receipt.paymentDate;
                    }
                    
                    var Details = {
                        image : 'http://www.mom2k18.co.in/'+firm.LogoURL,
                        sign : 'http://www.mom2k18.co.in/'+user.signature,
                        faddress : Address,
                        fcdetails : cdetails,
                        cname : client.OrganizationName,
                        address :address,
                        rno :receipt.ReceiptNo,
                        amtwords :receipt.paymentAmountWords,
                        amtfig: receipt.paymentAmount,
                        insertions : insertions,
                        details : details
                    }
                    pdf.generatePaymentReceipt(request,response,Details);
                }
            })
            
        }
    })
}
