const multer = require('multer');
// const multerS3 = require('multer-s3');
// const aws = require('aws-sdk');
require("dotenv").config();
// const fileValidation = require('../services/fileValidation');
// require("aws-sdk/lib/maintenance_mode_message").suppress = true;

// aws.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// const S3 = new aws.S3();

// function getFileExt(filename) { 
//   return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
// }

const upload = multer(
//   {
//   storage: multerS3({
//     s3: S3,
//     bucket: process.env.S3_BUCKET,
//     acl: 'public-read',
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) { 
//       const extension = getFileExt(file.originalname);
//       cb(null, Date.now().toString() + extension);
//     },
//     fileFilter: fileValidation,
//     limits: {
//       fileSize: process.env.UPLOAD_LIMIT * 1024 * 1024,
//     },
//   }),
// }
);





module.exports = upload;