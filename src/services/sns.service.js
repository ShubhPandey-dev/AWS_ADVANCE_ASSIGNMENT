const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// const publishDocumentUploadNotification = async ({
//   userId,
//   fileName,
//   s3Key,
//   uploadedAt,
// }) => {
//   const message = JSON.stringify({
//     event: "DOCUMENT_UPLOADED",
//     userId,
//     fileName,
//     s3Key,
//     uploadedAt,
//   });

//   const command = new PublishCommand({
//     TopicArn: process.env.AWS_SNS_TOPIC_ARN,
//     Message: message,
//   });

//   return await snsClient.send(command);
// };
const publishDocumentUploadNotification = async ({
  userId,
  fileName,
  s3Key,
  uploadedAt,
}) => {
  const message = JSON.stringify({
    event: "DOCUMENT_UPLOADED",
    message:
      "Your document has been uploaded successfully and securely stored.",
    userId,
    fileName,
    s3Key,
    uploadedAt,
  });

  const command = new PublishCommand({
    TopicArn: process.env.AWS_SNS_TOPIC_ARN,
    Message: message,
  });

  const result = await snsClient.send(command);

  console.log("SNS MESSAGE ID:", result.MessageId);

  return result;
};

module.exports = {
  publishDocumentUploadNotification,
};