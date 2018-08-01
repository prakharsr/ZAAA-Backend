var cfg = {};

cfg.PORT = process.env.PORT|| '8080';
cfg.SECRET = 'ShaamTakKhelenge';

cfg.accountSid = process.env.TWILIO_ACCOUNT_SID || "AC5be1ca4de8534bb9f59d9c0f30c266ea";
cfg.authToken = process.env.TWILIO_AUTH_TOKEN || "b17d672449db40dc24531ae162ba4582";
cfg.twilioNumber = process.env.TWILIO_NUMBER || "+12017620847";
cfg.authyKey = process.env.AUTHY_API_KEY || "D9wNhG7vy0FadGLM6p0ztQNmsy2mPvu7";
cfg.enableValidationSMS=1;
cfg.mailgun_api_key = 'key-510704fc134355458f91b11bb7a98a57';
cfg.DOMAIN = 'adagencymanager.com';


module.exports = cfg;