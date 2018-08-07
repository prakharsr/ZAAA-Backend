var http = require('http');
var pdf = require('html-pdf');
var path = require('path')
var config = require('../../config');
var roController = require('./releaseorderController');

var mailgun = require('mailgun-js')({
    apiKey: config.mailgun_api_key,
    domain: config.DOMAIN
});

var mailFile=function (request, response, buffer, filename, from, to, cc, bcc, subject, text){
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

    if (cc)
        data.cc = cc;

    if(bcc)
        data.bcc = bcc;

    mailgun.messages().send(data, function (error, body) {
        console.log(error, body);
        if (error) {
            response.send({
                success: false,
                msg: error + ""
            });
        }
        else {
            response.send({
                success: true,
                msg: "sent" + body
            });
        }
    });
};

module.exports.generateInvoice = function(request,response,Details) {
    var req = http.request(config.domain+'/templates/invoice.html', res => {
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
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
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
                width: '210mm',
                height: '297mm'
            }

            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                }
                else {
                    mailFile(request, response, buffer, 'invoice.pdf', 'Zenedo India <postmaster@adagencymanager.com>', Details.email ,'','','ZAAA Invoice','Following is the invoice of the plan you subscribe at ZAAA');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}


module.exports.mailReleaseOrder = function(request,response,Details) {
    roController.getROhtml(Details, content => {
        var options = {
            width: '210mm',
            height: '297mm'
        }
        pdf.create(content, options).toBuffer(function (err, buffer) {
            if (err) {
                console.log(err);
                response.send({
                    success :false,
                    msg :"cannot create pdf"
                });
            }
            else {
                mailFile(request, response, buffer, 'releaseOrder.pdf', 'rockstarpranjal092@gmail.com' , request.body.to, request.body.cc, request.body.bcc ,'Release Order','Following is the release order');
            }
        });
    });
}

module.exports.generateReleaseOrder =  function(request,response,Details) {
    roController.getROhtml(Details, content => {
        var options = {
            width: '210mm',
            height: '297mm'
        }
        pdf.create(content, options).toStream(function (err, data) {
            if (err) {
                console.log(err);
                response.send({
                    success :false,
                    msg :"cannot create pdf"
                });
            }
            else {
                response.writeHead(200, {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename="ReleaseOrder.pdf"'
                });
                data.pipe(response);
            }
        });
    });
}

module.exports.generatePaymentInvoice =  function(request,response,Details) {
    var req = http.request(config.domain+'/templates/PaymentInvoice.html', res => {
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
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{clientname}}', Details.clientname);
            templateHtml = templateHtml.replace('{{address}}', Details.address);
            templateHtml = templateHtml.replace('{{state}}', Details.state);
            templateHtml = templateHtml.replace('{{PAN}}',Details.pan);
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
            templateHtml = templateHtml.replace('{{ino}}', Details.ino);
            templateHtml = templateHtml.replace('{{TnC}}', Details.tnc);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{disc}}', Details.disc);
            templateHtml = templateHtml.replace('{{gamount}}', Details.gamount);
            templateHtml = templateHtml.replace('{{cgstper}}', Details.cgstper);
            templateHtml = templateHtml.replace('{{sgstper}}', Details.sgstper);
            templateHtml = templateHtml.replace('{{igstper}}', Details.igstper);
            templateHtml = templateHtml.replace('{{cgst}}', Details.cgst);
            templateHtml = templateHtml.replace('{{igst}}', Details.igst);
            templateHtml = templateHtml.replace('{{sgst}}', Details.sgst);
            templateHtml = templateHtml.replace('{{echarges}}', Details.echarges);
            templateHtml = templateHtml.replace('{{amtfig}}', Details.amtfig);
            templateHtml = templateHtml.replace('{{amtwords}}', Details.amtwords);
            var options = {
                width: '210mm',
                height: '297mm'
            }
            pdf.create(templateHtml, options).toStream(function (err, data) {
                if (err) {
                    console.log(err);
                    response.send({
                        success :false,
                        msg :"cannot create pdf"
                    });
                }
                else {
                    response.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="invoice.pdf"'
                    });
                    data.pipe(response);
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}


module.exports.mailPaymentInvoice =  function(request,response,Details) {
    var req = http.request(config.domain+'/templates/PaymentInvoice.html', res => {
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
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{clientname}}', Details.clientname);
            templateHtml = templateHtml.replace('{{address}}', Details.address);
            templateHtml = templateHtml.replace('{{state}}', Details.state);
            templateHtml = templateHtml.replace('{{PAN}}',Details.pan);
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
            templateHtml = templateHtml.replace('{{ino}}', Details.ino);
            templateHtml = templateHtml.replace('{{TnC}}', Details.tnc);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{disc}}', Details.disc);
            templateHtml = templateHtml.replace('{{gamount}}', Details.gamount);
            templateHtml = templateHtml.replace('{{cgstper}}', Details.cgstper);
            templateHtml = templateHtml.replace('{{sgstper}}', Details.sgstper);
            templateHtml = templateHtml.replace('{{igstper}}', Details.igstper);
            templateHtml = templateHtml.replace('{{cgst}}', Details.cgst);
            templateHtml = templateHtml.replace('{{igst}}', Details.igst);
            templateHtml = templateHtml.replace('{{sgst}}', Details.sgst);
            templateHtml = templateHtml.replace('{{echarges}}', Details.echarges);
            templateHtml = templateHtml.replace('{{amtfig}}', Details.amtfig);
            templateHtml = templateHtml.replace('{{amtwords}}', Details.amtwords);
            var options = {
                width: '210mm',
                height: '297mm'
            }
            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                    response.send({
                        success :false,
                        msg :"cannot create pdf"
                    });
                }
                else {
                     mailFile(request, response, buffer, 'invoice.pdf', 'rockstarpranjal092@gmail.com' , request.body.to, request.body.cc, request.body.bcc ,'invoice','Following is the tax invoice');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}

module.exports.generatePaymentReceipt =  function(request,response,Details) {
    var req = http.request(config.domain+'/templates/PaymentReceipt.html', res => {
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
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{faddress}}', Details.faddress);
            templateHtml = templateHtml.replace('{{signature}}', Details.sign);
            templateHtml = templateHtml.replace('{{fcdetails}}', Details.fcdetails);
            templateHtml = templateHtml.replace('{{cname}}', Details.cname);
            templateHtml = templateHtml.replace('{{address}}', Details.address);
            templateHtml = templateHtml.replace('{{rno}}', Details.rno);
            templateHtml = templateHtml.replace('{{amtwords}}', Details.amtwords);
            templateHtml = templateHtml.replace('{{amtfig}}', Details.amtfig);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{details}}', Details.details);
            var options = {
                width: '210mm',
                height: '150mm'
            }
            pdf.create(templateHtml, options).toStream(function (err, data) {
                if (err) {
                    console.log(err);
                    response.send({
                        success :false,
                        msg :"cannot create pdf"
                    });
                }
                else {
                    response.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="receipt.pdf"'
                    });
                    data.pipe(response);
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}


module.exports.mailPaymentReceipt =  function(request,response,Details) {
    var req = http.request(config.domain+'/templates/PaymentReceipt.html', res => {
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
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{faddress}}', Details.faddress);
            templateHtml = templateHtml.replace('{{signature}}', Details.sign);
            templateHtml = templateHtml.replace('{{fcdetails}}', Details.fcdetails);
            templateHtml = templateHtml.replace('{{cname}}', Details.cname);
            templateHtml = templateHtml.replace('{{address}}', Details.address);
            templateHtml = templateHtml.replace('{{rno}}', Details.rno);
            templateHtml = templateHtml.replace('{{amtwords}}', Details.amtwords);
            templateHtml = templateHtml.replace('{{amtfig}}', Details.amtfig);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{details}}', Details.details);
            var options = {
                width: '210mm',
                height: '297mm'
            }
            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                    response.send({
                        success :false,
                        msg :"cannot create pdf"
                    });
                }
                else {
                     mailFile(request, response, buffer, 'receipt.pdf', 'rockstarpranjal092@gmail.com' , request.body.to, request.body.cc, request.body.bcc ,'invoice','Following is the tax invoice');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}

module.exports.generateClientNote =  function(request,response,Details) {
    var req = http.request(config.domain+'/templates/Note.html', res => {
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
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{faddress}}', Details.faddress);
            templateHtml = templateHtml.replace('{{signature}}', Details.sign);
            templateHtml = templateHtml.replace('{{fcdetails}}', Details.fcdetails);
            templateHtml = templateHtml.replace('{{clientname}}', Details.cname);
            templateHtml = templateHtml.replace('{{address}}', Details.address);
            templateHtml = templateHtml.replace('{{amtwords}}', Details.amtwords);
            templateHtml = templateHtml.replace('{{amtfig}}', Details.amtfig);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            var options = {
                width: '210mm',
                height: '150mm'
            }
            pdf.create(templateHtml, options).toStream(function (err, data) {
                if (err) {
                    console.log(err);
                    response.send({
                        success :false,
                        msg :"cannot create pdf"
                    });
                }
                else {
                    response.writeHead(200, {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="Note.pdf"'
                    });
                    data.pipe(response);
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}


module.exports.mailClientNote =  function(request,response,Details) {
    var req = http.request(config.domain+'/templates/PaymentReceipt.html', res => {
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
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{faddress}}', Details.faddress);
            templateHtml = templateHtml.replace('{{signature}}', Details.sign);
            templateHtml = templateHtml.replace('{{fcdetails}}', Details.fcdetails);
            templateHtml = templateHtml.replace('{{cname}}', Details.cname);
            templateHtml = templateHtml.replace('{{address}}', Details.address);
            templateHtml = templateHtml.replace('{{rno}}', Details.rno);
            templateHtml = templateHtml.replace('{{amtwords}}', Details.amtwords);
            templateHtml = templateHtml.replace('{{amtfig}}', Details.amtfig);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{details}}', Details.details);
            var options = {
                width: '210mm',
                height: '150mm'
            }
            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                    response.send({
                        success :false,
                        msg :"cannot create pdf"
                    });
                }
                else {
                    mailFile(request, response, buffer, 'note.pdf', 'rockstarpranjal092@gmail.com' , request.body.to, request.body.cc, request.body.bcc ,'Notes','Following is the debit notes');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}