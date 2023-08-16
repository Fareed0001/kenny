// fileValidation.js

require("dotenv").config(); 

const imageFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4'];
const maxFileSize = process.env.UPLOAD_LIMIT * 1024 * 1024; 
function fileValidation(req, file, cb) {
  const fileExtension = getFileExtension(file.originalname);

  if (!imageFileExtensions.includes(fileExtension.toLowerCase())) {
    // Reject the file if it is not an image
    return cb(null, false);
  }

  if (file.size > maxFileSize) {
    // Reject the file if it exceeds the maximum file size
    return cb(null, false);
  }

  // Accept the file if it passes both validations
  cb(null, true);
}

function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

module.exports = fileValidation;
