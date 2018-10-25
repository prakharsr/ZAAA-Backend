var gcs=require('@google-cloud/storage');
var path = require('path');
var bucket = gcs.bucket('gs://aaman-217909.appspot.com')

module.exports = function(req, res, next) {
    if (!req.file) {
        return next();
    }
    if(req.originalUrl == '/api/user/image')
        const gcsname = 'user-'+user._id+''+path.extname(req.file.originalname);
    else if(req.originalUrl == '/api/user/sign')
        const gcsname = 'sign-'+user._id+''+path.extname(req.file.originalname);
    else if(req.originalUrl == '/firm/logo')
        const gcsname = 'firm-'+firm._id+''+path.extname(req.file.originalname);
    else
        const gcsname = 'client-'+firm._id+''+path.extname(req.file.originalname);
    
    const file = bucket.file(gcsname);

    const stream = file.createWriteStream({
        metadata: {
        contentType: req.file.mimetype
        },
        resumable: false
    });

    stream.on('error', (err) => {
        req.file.cloudStorageError = err;
        next(err);
    });

    stream.on('finish', () => {
        req.file.cloudStorageObject = gcsname;
        file.makePublic().then(() => {
        req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
        next();
        });
    });

    stream.end(req.file.buffer);
}

function getPublicUrl (filename) {
    return 'https://storage.googleapis.com/aaman-217909.appspot.com/'+filename;
  }