var googleCloudStorage = require('@google-cloud/storage');
var path = require('path');

var storage = new googleCloudStorage.Storage({
    projectId: 'aaman-217909',
    keyFilename: 'aaman-217909-59c3727cef6b.json'
})
  
var BUCKET_NAME = 'gooball';
var bucket = storage.bucket(BUCKET_NAME)


module.exports = function(req, res, next) {
    var firm = res.locals.firm;
    var user = res.locals.user;
    console.log("In Bucket");
    if (!req.file) {
        return next();
    }

    var gcsname = "";

    if(req.originalUrl == '/api/user/image')
        gcsname = 'user-'+user._id+''+path.extname(req.file.originalname);
    else if(req.originalUrl == '/api/user/sign')
        gcsname = 'sign-'+user._id+''+path.extname(req.file.originalname);
    else if(req.originalUrl == '/firm/logo')
        gcsname = 'firm-'+firm._id+''+path.extname(req.file.originalname);
    else gcsname = 'client-'+firm._id+''+path.extname(req.file.originalname);
    
    var file = bucket.file(gcsname);

    var stream = file.createWriteStream({
        metadata: {
        contentType: req.file.mimetype
        },
        resumable: false
    });

    stream.on('error', (err) => {
        req.file.cloudStorageError = err;
        console.log(err);
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
    return 'https://storage.googleapis.com/gooball/'+filename;
  }