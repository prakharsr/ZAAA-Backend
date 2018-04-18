var http = require('http');
var pdf = require('html-pdf');

var config = require('../../config');

var mailgun = require('mailgun-js')({
    apiKey: config.mailgun_api_key,
    domain: config.DOMAIN
});

module.exports.do = function() {
    var req = http.request('http://www.mom2k18.co.in/templates/invoice.html', res => {
        var templateHtml = "";

        res.on('data', chunk => {
            templateHtml += chunk;
        });

        res.on('end', () => {
            templateHtml = templateHtml.replace('{{firmName}}', 'Senzu Bean Cartel');

            var options = {
                width: '100mm',
                height: '180mm'
            }

            pdf.create(templateHtml, options).toBuffer(function (err, buffer) {
                if (err) {
                    console.log(err);
                }
                else {
                    var attach = new mailgun.Attachment({
                        data: buffer,
                        filename: 'invoice.pdf'
                    });

                    var data = {
                        from: 'Excited User <postmaster@mom2k18.co.in>',
                        to: 'prakhar03sharma@gmail.com',
                        subject: 'ZAAA Invoice',
                        text: 'Following is the invoice of the plan you subscribe at ZAAA',
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
                }
                
            });
        });
    });

    req.on('error', e => console.log(e));

    req.end();
}