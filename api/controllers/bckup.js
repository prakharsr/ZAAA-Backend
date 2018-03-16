
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
	  mailgun.validate('test@mail.com', function (err, body) {
		if(body && body.is_valid){
		  // do something
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
	})
};
