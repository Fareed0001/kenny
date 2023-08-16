const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
require("dotenv").config();


// Set up AWS configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});



// Users can upload following file type
const fileValidation = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'||
    file.mimetype === 'audio/mpeg'||
    file.mimetype === 'video/mpeg'||
    file.mimetype === 'application/pdf'||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/vnd.ms-powerpoint' ||
    file.mimetype === 'application/zip' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.mimetype === 'application/vnd.rar'
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type, only Images, Video, PDF, XLS, DOC, ZIP, RAR files are allowed!'
      ),
      false
    );
  }
};

const S3 = new AWS.S3();
const upload = multer({
  storage: multerS3({
    s3: S3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      cb(null, Date.now().toString() + extension);
    },
    fileFilter: fileValidation,
    limits: {
      fileSize: 1024 * 1024 * process.env.UPLOAD_LIMIT
    },
  }),
});

const uploader = (fieldName)=>upload.single(fieldName);

// Export the upload middleware
module.exports = {
  s3Uploader: uploader
};
