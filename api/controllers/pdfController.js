var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');
var User = require('../models/User');
var api_key = config.mailgun_api_key;
var DOMAIN = config.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
var ReleaseOrder = require('../models/ReleaseOrder');
var Firm = require('../models/Firm');
var mailController = require('./mailController');
var config =  require('../../config');
var userController = require('./userController');
var Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: "rzp_test_86QLf2LFy65g2j",
    key_secret: "xtGWMVp65bw8bGdXg04TEPMg"
  })

module.exports.generateRazorpayInvoice = function(Details){
    
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
var address = Details.add+',<br>'+Details.city+','+Details.state;
var template = path.join(__dirname,'../../public/templates/invoice.html');
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
        console.log(file);
        fs.existsSync(file);
        var data = {
            from: 'Excited User <postmaster@mom2k18.co.in>',
            to: 'pranjalsri092@gmail.com',
            subject: 'ZAAA Invoice',
            text: 'Following is the invoice of the plan you subscribe at ZAAA',
            attachment : file
          };
        
        mailgun.messages().send(data, function (error, body) {
            console.log(error,body);
            if(error){
            console.log({
                success:false,
                msg: error + ""
            });
        }
        else{
            console.log({
                success:true,
                msg: "sent" + body
            });
        }
          });
    }
})
}

module.exports.generateReleaseOrder = function(request,response){
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
    ReleaseOrder.findById(mongoose.mongo.ObjectId(request.body.id), (err, releaseorder) => {
        Firm.findById(mongoose.mongo.ObjectId(releaseorder.firm), (err, firm)=>{
            
            var template = path.join(__dirname,'../../public/templates/releaseOrder.html');
            var filename = template.replace('.html','.pdf');
            var templateHtml = fs.readFileSync(template,'utf8');
            templateHtml = templateHtml.replace('{{logoimage}}', firm.LogoURL);
            templateHtml = templateHtml.replace('{{mediahouse}}', releaseorder.publicationName);
            templateHtml = templateHtml.replace('{{pgstin}}', releaseorder.publicationGSTIN);
            templateHtml = templateHtml.replace('{{rno}}',releaseorder.releaseOrderNO);
            templateHtml = templateHtml.replace('{{date}}', today)
            templateHtml = templateHtml.replace('{{gstin}}', releaseorder.agencyGSTIN)
            templateHtml = templateHtml.replace('{{cname}}', releaseorder.clientName)
            templateHtml = templateHtml.replace('{{cgstin}}', releaseorder.clientGSTIN)
            templateHtml = templateHtml.replace('{{scheme}}', releaseorder.adSchemePaid+'+'+releaseorder.adSchemeFree)
            var options = {
                width: '100mm',
                height: '180mm'
            }
            pdf.create(templateHtml, options).toFile(filename, function(err,pdf){
                if(err) console.log(err+ "");
                else{
                    var file = path.join(pdf.filename, '../'+releaseorder.releaseOrderNO+'.pdf');
                    console.log(file);
                    fs.existsSync(file);
                    var data = {
                        from: 'Excited User <postmaster@mom2k18.co.in>',
                        to: 'pranjalsri092@gmail.com',
                        subject: 'Release Order '+ releaseorder.releaseOrderNO,
                        text: 'The Release Order is attached below',
                        attachment : file
                      };
                    
                    

                    mailgun.messages().send(data, function (error, body) {
                        console.log(error,body);
                        if(error){
                        console.log({
                            success:false,
                            msg: error + ""
                        });
                    }
                    else{
                        console.log({
                            success:true,
                            msg: "sent" + body
                        });
                    }
                });
            }
            });
        })
    })
   
}