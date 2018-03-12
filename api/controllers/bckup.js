
var mailgun = require("mailgun-js");
var api_key = 'key-510704fc134355458f91b11bb7a98a57';
var DOMAIN = 'mom2k18.co.in';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

module.exports.sendMailFromMailgun = function(request, response){
	var data = {
		from: 'Excited User <postmaster@mom2k18.co.in>',
		to: 'sonumeewa@gmail.com',
		subject: 'Hello',
		text: 'Testing some Mailgun awesomness!'
	  };
	  
	  mailgun.messages().send(data, function (error, body) {
		console.log(error,body);
	  });
	  
}