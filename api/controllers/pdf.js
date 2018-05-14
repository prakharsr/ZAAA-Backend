var http = require('http');
var pdf = require('html-pdf');
var path = require('path')
var config = require('../../config');

var mailgun = require('mailgun-js')({
    apiKey: config.mailgun_api_key,
    domain: config.DOMAIN
});

var mailFile=function (buffer, filename, from, to, cc, bcc, subject, text){
    var attach = new mailgun.Attachment({
        data: buffer,
        filename: filename
    });

    var data = {
        from: from,
        to: to,
        cc:cc,
        bcc:bcc,
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
                    mailFile(buffer, 'invoice.pdf', request.body.from, request.body.to ,'','','ZAAA Invoice','Following is the invoice of the plan you subscribe at ZAAA');
                }
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}


module.exports.mailReleaseOrder = function(Details,request,response) {
    var req = http.request('http://www.mom2k18.co.in/templates/releaseOrder.html', res => {
        var templateHtml = "";
        res.on('data', chunk => {
            templateHtml += chunk;
        });
        res.on('end', () => {
            var image = http.request('http://www.mom2k18.co.in/'+Details.logo, resp => {
                var img = "";
                resp.on('data', chunk => {
                    img += chunk;
                })
                resp.on('end', ()=> {
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
                    var filename = path.basename(Details.logo);
                    var imgPath = __dirname+''+filename;
                    templateHtml = templateHtml.replace('{{mediahouse}}', Details.mediahouse);
                    templateHtml = templateHtml.replace('{{pgstin}}', Details.pgstin);
                    templateHtml = templateHtml.replace('{{cname}}', Details.cname);
                    templateHtml = templateHtml.replace('{{cgstin}}',Details.cgstin);
                    templateHtml = templateHtml.replace('{{date}}', today);
                    templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
                    templateHtml = templateHtml.replace('{{scheme}}', Details.scheme);
                    templateHtml = templateHtml.replace('{{gmaount}}', Details.gamount);
                    templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
                    templateHtml = templateHtml.replace('{{dper}}', Details.dper);
                    templateHtml = templateHtml.replace('{{damonut}}', Details.damount);
                    templateHtml = templateHtml.replace('{{namount}}', Details.namount);
                    templateHtml = templateHtml.replace('{{logoimage}}', imgPath);
                    var options = {
                        width: '100mm',
                        height: '180mm'
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
                            mailFile(buffer, 'releaseOrder.pdf', request.body.from , request.body.to, request.body.cc, request.body.bcc ,'Release Order','Following is the release order');
                        }
                    });
                });
                image.on('error', e=> console.log(e));
                image.end();
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}

module.exports.generateReleaseOrder =  function(Details,request,response) {
    var req = http.request('http://www.mom2k18.co.in/templates/releaseOrder.html', res => {
        var templateHtml = "";
        res.on('data', chunk => {
            templateHtml += chunk;
        });
        res.on('end', () => {
            var image = http.request('http://www.mom2k18.co.in/'+Details.logo, resp => {
                var img = "";
                resp.on('data', chunk => {
                    img += chunk;
                })
                resp.on('end', ()=> {
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
                    var filename = path.basename(Details.logo);
                    var imgPath = __dirname+''+filename;
                    templateHtml = templateHtml.replace('{{mediahouse}}', Details.mediahouse);
                    templateHtml = templateHtml.replace('{{pgstin}}', Details.pgstin);
                    templateHtml = templateHtml.replace('{{cname}}', Details.cname);
                    templateHtml = templateHtml.replace('{{cgstin}}',Details.cgstin);
                    templateHtml = templateHtml.replace('{{date}}', today);
                    templateHtml = templateHtml.replace('{{gstin}}', Details.gstin);
                    templateHtml = templateHtml.replace('{{scheme}}', Details.scheme);
                    templateHtml = templateHtml.replace('{{gmaount}}', Details.gamount);
                    templateHtml = templateHtml.replace('{{insertions}}', Details.insertions);
                    templateHtml = templateHtml.replace('{{dper}}', Details.dper);
                    templateHtml = templateHtml.replace('{{damonut}}', Details.damount);
                    templateHtml = templateHtml.replace('{{namount}}', Details.namount);
                    templateHtml = templateHtml.replace('{{logoimage}}', imgPath);
                    var options = {
                        width: '100mm',
                        height: '180mm'
                    }
                    pdf.create(templateHtml, options).toBuffer(function (err, data) {
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
                                'Content-Disposition': 'inline; filename=releaseOrder.pdf',
                                'Content-Length': data.length
                              });
                              response.send({
                                success: true,
                                pdf: data
                              });
                        }
                    });
                });
                image.on('error', e=> console.log(e));
                image.end();
            });
        });
    });
    req.on('error', e => console.log(e));
    req.end();
}
            