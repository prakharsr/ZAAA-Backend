var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');
var User = require('../models/User');
var usercontroller = require('./userController');


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
    width: '50mm',
    height: '90mm'
}
pdf.create(templateHtml, options).toFile(filename, function(err,pdf){
    if(err) console.log(err);
    else{
        console.log(pdf.filename);
        fs.existsSync(pdf.filename);
    }
})
}
