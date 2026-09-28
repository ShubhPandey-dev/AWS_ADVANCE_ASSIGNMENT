const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const s3Client = require("../config/aws.config");

const uploadToS3 = async ({ key, buffer, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  return await s3Client.send(command);
};

const getFromS3 = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  return await s3Client.send(command);
};

const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  return await s3Client.send(command);
};

module.exports = {
  uploadToS3,
  getFromS3,
  deleteFromS3,
};