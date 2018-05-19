var http = require('http');
var pdf = require('html-pdf');
var path = require('path')
var config = require('../../config');

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
                width: '100mm',
                height: '180mm'
            }

            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                }
                else {
                    mailFile(request, response, buffer, 'invoice.pdf', 'Zenedo India <postmaster@mom2k18.co.in>', Details.email ,'','','ZAAA Invoice','Following is the invoice of the plan you subscribe at ZAAA');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}


module.exports.mailReleaseOrder = function(request,response,Details) {
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
            templateHtml = templateHtml.replace('{{logoimage}}', Details.image);
            templateHtml = templateHtml.replace('{{mediahouse}}', Details.mediahouse);
            templateHtml = templateHtml.replace('{{pgstin}}', Details.pgstin);
            templateHtml = templateHtml.replace('{{cname}}', Details.cname);
            templateHtml = templateHtml.replace('{{cgstin}}',Details.cgstin);
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
            templateHtml = templateHtml.replace('{{scheme}}', Details.scheme);
            templateHtml = templateHtml.replace('{{gamount}}', Details.gamount);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{dper}}', Details.dper);
            templateHtml = templateHtml.replace('{{damount}}', Details.damount);
            templateHtml = templateHtml.replace('{{namount}}', Details.namount);
            var options = {
                width: '600mm',
                height: '400mm'
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
                    mailFile(request, response, buffer, 'releaseOrder.pdf', 'rockstarpranjal092@gmail.com' , request.body.to, request.body.cc, request.body.bcc ,'Release Order','Following is the release order');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}

module.exports.generateReleaseOrder =  function(request,response,Details) {
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
            templateHtml = templateHtml.replace('{{mediahouse}}', Details.mediahouse);
            templateHtml = templateHtml.replace('{{pgstin}}', Details.pgstin);
            templateHtml = templateHtml.replace('{{cname}}', Details.cname);
            templateHtml = templateHtml.replace('{{cgstin}}',Details.cgstin);
            templateHtml = templateHtml.replace('{{date}}', today);
            templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
            templateHtml = templateHtml.replace('{{scheme}}', Details.scheme);
            templateHtml = templateHtml.replace('{{gamount}}', Details.gamount);
            templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
            templateHtml = templateHtml.replace('{{dper}}', Details.dper);
            templateHtml = templateHtml.replace('{{damount}}', Details.damount);
            templateHtml = templateHtml.replace('{{namount}}', Details.namount);
            var options = {
                width: '600mm',
                height: '400mm'
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
                        'Content-Disposition': 'attachment; filename="ReleaseOrder.pdf"'
                    });
                    data.pipe(response);
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}
            


module.exports.generatePaymentInvoice =  function(request,response,Details) {
    var req = http.request('http://www.mom2k18.co.in/templates/PaymentInvoice.html', res => {
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
            templateHtml = templateHtml.replace('{{aname}}', Details.cgst);
            templateHtml = templateHtml.replace('{{bank}}', Details.cgst);
            templateHtml = templateHtml.replace('{{branch}}', Details.cgst);
            templateHtml = templateHtml.replace('{{atype}}', Details.cgst);
            templateHtml = templateHtml.replace('{{ano}}', Details.cgst);
            templateHtml = templateHtml.replace('{{ifsc}}', Details.cgst);
            var options = {
                width: '600mm',
                height: '400mm'
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
                        'Content-Disposition': 'attachment; filename="ReleaseOrder.pdf"'
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
    var req = http.request('http://www.mom2k18.co.in/templates/PaymentInvoice.html', res => {
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
            templateHtml = templateHtml.replace('{{aname}}', Details.cgst);
            templateHtml = templateHtml.replace('{{bank}}', Details.cgst);
            templateHtml = templateHtml.replace('{{branch}}', Details.cgst);
            templateHtml = templateHtml.replace('{{atype}}', Details.cgst);
            templateHtml = templateHtml.replace('{{ano}}', Details.cgst);
            templateHtml = templateHtml.replace('{{ifsc}}', Details.cgst);
            var options = {
                width: '600mm',
                height: '400mm'
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
                     mailFile(request, response, buffer, 'invoice.pdf', 'rockstarpranjal092@gmail.com' , request.body.to, request.body.cc, request.body.bcc ,'invoice','Following is the tax invoice');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}