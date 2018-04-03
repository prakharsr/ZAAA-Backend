var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');
var User = require('../models/User');
var config =  require('../../config');
var usercontroller = require('./userController');
var api_key = config.mailgun_api_key;
var DOMAIN = config.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});


module.exports.generateRazorpayInvoice = function(FirmDetails){
    
var today = new Date();
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


var template = path.join(__dirname,'../../public/templates/invoice.html');
var filename = template.replace('.html','.pdf');
var templateHtml = fs.readFileSync(template,'utf8');
templateHtml = templateHtml.replace('{{firmName}}', FirmDetails.firmname);
templateHtml = templateHtml.replace('{{paymentId}}', FirmDetails.paymentId);
templateHtml = templateHtml.replace('{{gstin}}', FirmDetails.gstin);
templateHtml = templateHtml.replace('{{registeredAddress}}', FirmDetails.address);
templateHtml = templateHtml.replace('{{date}}', FirmDetails.date)
var options = {
    width: '100mm',
    height: '180mm'
}
var file;
pdf.create(templateHtml, options).toFile(filename, function(err,pdf){
    if(err) console.log(err+ "");
    else{
        console.log(pdf.filename);
        fs.existsSync(pdf.filename);
        file = fs.readFileSync(pdf.filename);
    }
})

var data = {
    from: 'Excited User <postmaster@mom2k18.co.in>',
    to: 'sonumeewa@gmail.com',
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
