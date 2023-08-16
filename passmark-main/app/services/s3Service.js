// s3Service.js

const AWS = require('aws-sdk');
require("dotenv").config();
const path = require('path');
require("aws-sdk/lib/maintenance_mode_message").suppress = true;


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

class S3Service {
  constructor() {
    this.s3 = new AWS.S3();
  }

  async uploadFile(fieldName, file) {
    try {
      const params = {
        Bucket: process.env.S3_BUCKET,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Metadata: { fieldName },
        Key: file.originalname,
        Body: file.buffer,
      };

      const data = await this.s3.upload(params).promise();
      return { fieldname: fieldName, url: data.Location };
    } catch (error) {
      throw new Error('Failed to upload file to S3: ' + error.message);
    }
  }
}

module.exports = S3Service;
