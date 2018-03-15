var cfg = {};

cfg.PORT = process.env.PORT|| '8080';
cfg.SECRET = 'ShaamTakKhelenge';

cfg.accountSid = process.env.TWILIO_ACCOUNT_SID;
cfg.authToken = process.env.TWILIO_AUTH_TOKEN;
cfg.twilioNumber = process.env.TWILIO_NUMBER;
cfg.authyKey = process.env.AUTHY_API_KEY;
cfg.enableValidationSMS=1;
cfg.mailgun_api_key = 'key-510704fc134355458f91b11bb7a98a57';
cfg.DOMAIN = 'mom2k18.co.in';


module.exports = cfg;