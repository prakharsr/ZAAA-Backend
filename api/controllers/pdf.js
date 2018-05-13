var http = require('http');
var pdf = require('html-pdf');
var path = require('path')
var config = require('../../config');

var mailgun = require('mailgun-js')({
    apiKey: config.mailgun_api_key,
    domain: config.DOMAIN
});

var mailFile=function (buffer, filename, from, to, subject, text){
    var attach = new mailgun.Attachment({
        data: buffer,
        filename: filename
    });

    var data = {
        from: from,
        to: to,
        subject: subject,
        text: text,
        attachment: attach
    };
    
    mailgun.messages().send(data, function (error, body) {
        console.log(error, body);
        if (error) {
            console.log({
                success: false,
                msg: error + ""
            });
        }
        else {
            console.log({
                success: true,
                msg: "sent" + body
            });
        }
    });
};

module.exports.generateInvoice = function(Details) {
    var req = http.request('http://www.mom2k18.co.in/templates/invoice.html', res => {
        var templateHtml = "";

        res.on('data', chunk => {
            templateHtml += chunk;
        });
        res.on('end', () => {
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

            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                }
                else {
                    mailFile(buffer, 'invoice.pdf', 'Excited User <postmaster@mom2k18.co.in>', 'pranjalsri092@gmail.com','ZAAA Invoice','Following is the invoice of the plan you subscribe at ZAAA');
                }
                
            });
        });
    });

    req.on('error', e => console.log(e));

    req.end();
}


module.exports.generateReleaseOrder = function(Details) {
    var req = http.request('http://www.mom2k18.co.in/templates/releaseOrder.html', res => {
        var templateHtml = "";

        res.on('data', chunk => {
            templateHtml += chunk;
        });
        res.on('end', () => {
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

            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                }
                else {
                    
                }
            });
        });
    });

    req.on('error', e => console.log(e));

    req.end();
    
}
