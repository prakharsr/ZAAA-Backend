var config = require('../../config');
var userController = require('./userController');
var noteController = require('./Accounts/creditDebit');
var User = require('../models/User');
var CreditNote = require('../models/CreditNote');
var DebitNote = require('../models/DebitNote');
var mongoose = require('mongoose');



module.exports.mailDebitNotePdf = function(request, response) {
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

module.exports.generateDebitNotePdf = function(request, response) {
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
