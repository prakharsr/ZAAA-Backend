var http = require('http');
var pdf = require('html-pdf');
var path = require('path');
var fs = require('fs');
var config = require('../../config');
var roController = require('./releaseorderController');
var invoiceController = require('./invoiceController');
var receiptController = require('./receiptController');
var summarysheet = require('./mediahouseInvoiceController');

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
        html: text,
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
    fs.readFile(path.resolve(__dirname, '../../public/templates/invoice.html'), 'utf8', (err, templateHtml) => {
        if(err){
            console.log(err);
        }
        else{
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
            var address = Details.add+',<br>'+Details.city+','+Details.state
             .replace('{{logoimage}}', Details.image)
             .replace('{{firmName}}', Details.firmname)
             .replace('{{paymentId}}', Details.paymentId)
             .replace('{{gstin}}', Details.gstin)
             .replace('{{registeredAddress}}',address)
             .replace('{{date}}', today)
             .replace('{{price}}', Details.price)
             .replace('{{fee}}', Details.fee)
             .replace('{{tax}}', Details.tax)
             .replace('{{total}}', total)
             .replace('{{method}}', Details.method)

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
        }
    });
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
                mailFile(
                    request,
                    response,
                    buffer,
                    'RO_'+Details.rno+'_'+Details.cname+'.pdf',
                    response.locals.user.email,
                    request.body.to,
                    request.body.cc,
                    request.body.bcc,
                    'ReleaseOrder_'+Details.rno+'_'+Details.cname,
                    '<html>To,<br><b>'+Details.mediahouse+',<br>'+Details.medition+','+Details.maddress+',</b><br>Greetings of the day!<br>Please find the attached Release Order bearing No.<b>'+Details.rno+'</b> and insert advertisement accordingly.<br><br> If any issue/query, kindly let us know immediately.<br><br>Thanks for your kind cooperation.<br><br>Sincerely,<br><img src="'+Details.image+'" height="100px" width="100px"><br>'+Details.username+'<br>'+Details.firmname+'<br>'+Details.phone+'<br><hr><br><p style="color: #777; font-size: 80%">This e-mail and any files transmitted with it are for the sole use of the intended recipients(s) and may contain confidential and legally privileged information. If you are not the intended recipient, please contact the sender by reply e-mail and destroy all copies and the original message. Any unauthorized review, use, disclosure, dissemination, printing or copying of this email or any action taken in reliance on this e-mail is strictly prohibited. The recipient acknowledges that Zenedo India Private Limited(ZIPL) is unable to exercise control or ensure or guarentee the integrity of/over the contents of the information contained in e-mail transmissions and further acknowledges that any views expressed in this message are those of the individual sender and no binding nature of the messsage shall be implied or assumed unless the sender does so expressly with due authority of ZIPL. Before opening any attachments please check them for viruses and defects. ZIPL makes no warrenty that e-mail communications are timely, secure or free from computer virus or other defects.</p></html>'
                );
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
                    'Content-Disposition': 'attachment; filename="RO_'+Details.rno+'_'+Details.cname+'.pdf"'
                });
                data.pipe(response);
            }
        });
    });
}

module.exports.mailinvoice = function(request,response,Details) {
    invoiceController.getinvoicehtml(Details, content => {
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
                mailFile(
                    request,
                    response,
                    buffer,
                    'IN_'+Details.rno+'_'+Details.cname+'.pdf',
                    response.locals.user.email,
                    request.body.to,
                    request.body.cc,
                    request.body.bcc,
                    'Invoice'+Details.rno+'_'+Details.cname,
                    '<html>To,<br><b>'+Details.cname+',<br>'+','+Details.caddress+',</b><br>Greetings of the day!<br>Please find the attached Invoice bearing No.<b>'+Details.rno+'</b> and insert advertisement accordingly.<br><br> If any issue/query, kindly let us know immediately.<br><br>Thanks for your kind cooperation.<br><br>Sincerely,<br><img src="'+Details.image+'" height="100px" width="100px"><br>'+Details.username+'<br>'+Details.firmname+'<br>'+Details.phone+'<br><hr><br><p style="color: #777; font-size: 80%">This e-mail and any files transmitted with it are for the sole use of the intended recipients(s) and may contain confidential and legally privileged information. If you are not the intended recipient, please contact the sender by reply e-mail and destroy all copies and the original message. Any unauthorized review, use, disclosure, dissemination, printing or copying of this email or any action taken in reliance on this e-mail is strictly prohibited. The recipient acknowledges that Zenedo India Private Limited(ZIPL) is unable to exercise control or ensure or guarentee the integrity of/over the contents of the information contained in e-mail transmissions and further acknowledges that any views expressed in this message are those of the individual sender and no binding nature of the messsage shall be implied or assumed unless the sender does so expressly with due authority of ZIPL. Before opening any attachments please check them for viruses and defects. ZIPL makes no warrenty that e-mail communications are timely, secure or free from computer virus or other defects.</p></html>'
                );
                mailFile(request, response, buffer, 'IN_'+Details.rno+'_'+Details.cname+'.pdf', response.locals.user.email , request.body.to, request.body.cc, request.body.bcc ,'Release Order','Following is the release order');
            }
        });
    });
}

module.exports.generateinvoice =  function(request,response,Details) {
    invoiceController.getinvoicehtml(Details, content => {
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
                    'Content-Disposition': 'attachment; filename="IN_'+Details.rno+'_'+Details.cname+'.pdf"'
                });
                data.pipe(response);
            }
        });
    });
}

module.exports.mailPaymentReceipt = function(request,response,Details) {
    receiptController.getreceipthtml(Details, content => {
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
                mailFile(request, response, buffer, 'RE_'+Details.rno+'_'+Details.cname+'.pdf', response.locals.user.email , request.body.to, request.body.cc, request.body.bcc ,'Release Order','Following is the release order');
            }
        });
    });
}

module.exports.generatePaymentReceipt =  function(request,response,Details) {
    receiptController.getreceipthtml(Details, content => {
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
                    'Content-Disposition': 'attachment; filename="RE_'+Details.rno+'_'+Details.cname+'.pdf"'
                });
                data.pipe(response);
            }
        });
    });
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


module.exports.mailSummarySheet = function(request,response,Details) {
    summarysheet.getSShtml(Details, content => {
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
                mailFile(
                    request,
                    response,
                    buffer,
                    'SS_'+Details.rno+'_'+Details.cname+'.pdf',
                    response.locals.user.email,
                    request.body.to,
                    request.body.cc,
                    request.body.bcc,
                    'ReleaseOrder_'+Details.rno+'_'+Details.cname,
                    '<html>To '+Details.mediahouse+',<br>Greetings of the day!<br>Please find the attached Release Order bearing No.'+Details.rno+' and insert advertisement accordingly.<br><br> If any issue/query, kindly let us know immediately.<br><br>Thanks for your kind cooperation.<br><br>Sincerely,<br><img src="'+Details.image+'" height="200px" width="200px"><br>'+Details.username+'<br>'+Details.firmname+'<br>'+Details.phone+'<br><p style="color: #777; font-size: 80%">This e-mail and any files transmitted with it are for the sole use of the intended recipients(s) and may contain confidential and legally privileged information. If you are not the intended recipient, please contact the sender by reply e-mail and destroy all copies and the original message. Any unauthorized review, use, disclosure, dissemination, printing or copying of this email or any action taken in reliance on this e-mail is strictly prohibited. The recipient acknowledges that Zenedo India Private Limited(ZIPL) is unable to exercise control or ensure or guarentee the integrity of/over the contents of the information contained in e-mail transmissions and further acknowledges that any views expressed in this message are those of the individual sender and no binding nature of the messsage shall be implied or assumed unless the sender does so expressly with due authority of ZIPL. Before opening any attachments please check them for viruses and defects. ZIPL makes no warrenty that e-mail communications are timely, secure or free from computer virus or other defects.</p></html>'
                );
            }
        });
    });
}

module.exports.generateSummarySheet =  function(request,response,Details) {
    summarysheet.getSShtml(Details, content => {
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
                    'Content-Disposition': 'attachment; filename="RO_'+Details.rno+'_'+Details.cname+'.pdf"'
                });
                data.pipe(response);
            }
        });
    });
}