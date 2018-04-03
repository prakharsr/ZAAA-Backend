var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');
var User = require('../models/User');
var config =  require('../../config');
var usercontroller = require('./userController');
var api_key = config.mailgun_api_key;
var DOMAIN = config.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});


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
var address = Details.address.address+',<br>'+Details.address.city+','+Details.address.state;
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
})
}
