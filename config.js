var cfg = {};

cfg.PORT = process.env.PORT|| '8080';
cfg.SECRET = 'ShaamTakKhelenge';

cfg.accountSid = process.env.TWILIO_ACCOUNT_SID;
cfg.authToken = process.env.TWILIO_AUTH_TOKEN;
cfg.twilioNumber = process.env.TWILIO_NUMBER;
cfg.authyKey = process.env.AUTHY_API_KEY;
cfg.enableValidationSMS=1;


module.exports = cfg;