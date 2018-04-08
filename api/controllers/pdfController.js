var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');
var User = require('../models/User');
var mailController = require('./mailController');
var config =  require('../../config');
var usercontroller = require('./userController');
var instance = new Razorpay({
    key_id: 'rzp_test_qIUnr51XOjxMYX',
    key_secret: 'YyZvGQN9o8YlUSJTuu7KVeIY'
  })

module.exports.generateRazorpayInvoice = function(request, response){
    var token = userController.getToken(request.headers);
	var user = userController.getUser(token,request,response, function(err, user){
		if(err||!user){
			console.log("User not found");
			response.send({
				success:false,
				msg:err
			});
		}
		else{
			Firm.findById(user.firm,function(err,firm){
				if(err){
					console.log("error in finding firm" + err);
				}
				if(!firm){
					console.log("firm does not exist for this admin");
				}
                else{
                    instance.payments.capture(request.body.paymentID, request.body.cost).then((data) => {
                    var Details={
                        firmname:firm.FirmName,
                        paymentId:firm.plan.paymentID,
                        gstin:firm.GSTIN,
                        address:firm.RegisteredAddress,
                        price: data.amount,
                        fee: data.fee,
                        tax: data.tax,
                        date: data.created_at,
                        method:data.method
                    }
                    var today = new Date(Date.now());
                    var dd = today.getDate();
                    var mm = today.getMonth()+1; 
                    var yyyy = today.getFullYear();
                    if(dd<10){
                        dd='0'+dd;
                    } 
                    if(mm<10){
                        mm='0'+mm;
                    } 
                    var today = dd+'/'+mm+'/'+yyyy;
                    var total = Details.price + Details.fee + Details.tax;
                    var address = Details.address.address+',<br>'+Details.address.city+','+Details.address.state;
                    var template = '/templates/invoice.html';
                    var filename = template.replace('.html','.pdf');
                    var templateHtml = fs.readFileSync(template,'utf8');
                    templateHtml = templateHtml.replace('{{firmName}}', Details.firmname);
                    templateHtml = templateHtml.replace('{{paymentId}}', Details.paymentId);
                    templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
                    templateHtml = templateHtml.replace('{{registeredAddress}}',address);
                    templateHtml = templateHtml.replace('{{date}}', today)
                    templateHtml = templateHtml.replace('{{price}}', Details.price)
                    templateHtml = templateHtml.replace('{{fee}}', Details.fee)
                    templateHtml = templateHtml.replace('{{tax}}', Details.tax)
                    templateHtml = templateHtml.replace('{{total}}', total)
                    templateHtml = templateHtml.replace('{{method}}', Details.method)
                    var options = {
                        width: '100mm',
                        height: '180mm'
                    }
                    pdf.create(templateHtml, options).toFile(filename, function(err,pdf){
                        if(err) console.log(err+ "");
                        else{
                            var file = pdf.filename;
                            fs.existsSync(file);
                            mailController.mail(file,request.body.to, request.body.cc, request.body.bcc,'ZAAA Invoice','Following is the invoice of the plan you subscribe at ZAAA')
                        }1
                    })
                    })
                    .catch((err) => {
                        console.log("error in capturing payment");
                        res.send({
                            success:false,
                            msg: error + ""
                        });
                    });
                }
            });
            }
        });

}


   