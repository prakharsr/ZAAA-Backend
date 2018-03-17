var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');
var User = require('../models/User');
var config =  require('../../config');
var usercontroller = require('./userController');
var api_key = config.mailgun_api_key;
var DOMAIN = config.DOMAIN;
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});


module.exports.generateRazorpayInvoice = function(request, response){
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

var user = {
    'name' : 'Theta',
    'phone' : '+19275273827',
    'plan' : 'Silver',
    'plancost': '5000',
    'date' : today
};

var template = path.join(__dirname,'../../public/templates/invoice.html');
var filename = template.replace('.html','.pdf');
var templateHtml = fs.readFileSync(template,'utf8');
// templateHtml = templateHtml.replace('{{user}}', user.name)
// templateHtml = templateHtml.replace('{{phone}}', user.phone)
// templateHtml = templateHtml.replace('{{plan}}', user.plan)
// templateHtml = templateHtml.replace('{{plancost}}', user.plancost)
// templateHtml = templateHtml.replace('{{date}}', user.date)
var options = {
    width: '100mm',
    height: '180mm'
}
var data1;
pdf.create(templateHtml, options).toFile(filename, function(err,pdf){
    if(err) console.log(err);
    else{
        console.log(pdf.filename);
        fs.existsSync(pdf.filename);
        data1 = fs.readFileSync(pdf.filename);
    }
})

var data = {
    from: 'Excited User <postmaster@mom2k18.co.in>',
    to: request.body.email,
    subject: 'Attachment',
    attachment : [
        {data: data1, filename: 'zaaa-invoice.pdf'}
    ]
  };

mailgun.messages().send(data, function (error, body) {
    console.log(error,body);
    if(error){
    response.send({
        success:false,
        msg: error + ""
    });
}
else{
    response.send({
        success:true,
        msg: "sent" + body
    });
}
  });
}
