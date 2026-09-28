const {
  uploadToS3,
  getFromS3,
  deleteFromS3,
} = require("../services/s3.service");

const {
  createDocument,
  getDocumentsByUserId,
  getDocumentById,
  deleteDocumentById,
} = require("../repository/document.repository");

const {
  publishDocumentUploadNotification,
} = require("../services/sns.service");

const {
  logToCloudWatch,
} = require("../services/cloudwatch.service");

const {
  putMetric,
} = require("../services/cloudwatchMetrics.service");

const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    // CloudWatch: upload started
    await logToCloudWatch({
      event: "DOCUMENT_UPLOAD_STARTED",
      userId,
      fileName: file?.originalname,
    });

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Document is required",
      });
    }

    const key = `documents/user-${userId}/${file.originalname}`;

    // 1. Upload actual file to S3
    await uploadToS3({
      key,
      buffer: file.buffer,
      contentType: file.mimetype,
    });

    // CloudWatch: S3 upload successful
    await logToCloudWatch({
      event: "S3_UPLOAD_SUCCESS",
      userId,
      fileName: file.originalname,
      s3Key: key,
    });

    // 2. Create S3 URL
    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // 3. Save document metadata in database
    const documentId = await createDocument({
      userId,
      originalName: file.originalname,
      s3Key: key,
      s3Url,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    // CloudWatch: DB metadata saved
    await logToCloudWatch({
      event: "DOCUMENT_METADATA_SAVED",
      userId,
      documentId,
      fileName: file.originalname,
    });

    // 4. Publish SNS notification
    try {
      const snsResult = await publishDocumentUploadNotification({
        userId,
        fileName: file.originalname,
        s3Key: key,
        uploadedAt: new Date().toISOString(),
      });

      console.log("SNS PUBLISHED SUCCESSFULLY:", snsResult);

      // CloudWatch metric: SNS notification successfully sent
      await putMetric("SNSNotificationsSent");

      // CloudWatch log: SNS notification successful
      await logToCloudWatch({
        event: "SNS_NOTIFICATION_SENT",
        userId,
        fileName: file.originalname,
        s3Key: key,
        messageId: snsResult.MessageId,
      });
    } catch (snsError) {
      console.error("SNS notification failed:", snsError);

      // CloudWatch metric: SNS notification failed
      await putMetric("SNSNotificationsFailed");

      // CloudWatch log: SNS notification failed
      await logToCloudWatch({
        event: "SNS_NOTIFICATION_FAILED",
        userId,
        fileName: file.originalname,
        s3Key: key,
        error: snsError.message,
      });
    }

    // CloudWatch: complete upload flow
    await logToCloudWatch({
      event: "DOCUMENT_UPLOAD_COMPLETED",
      userId,
      documentId,
      fileName: file.originalname,
      s3Key: key,
    });

    // CloudWatch metric: successful document upload
    await putMetric("DocumentsUploaded");

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        id: documentId,
        userId,
        originalName: file.originalname,
        s3Key: key,
        s3Url,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Logged-in user sirf apne documents dekh sakta hai
    if (req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own documents",
      });
    }

    const documents = await getDocumentsByUserId(userId);

    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully",
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

const getDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Document database se find karo
    const document = await getDocumentById(id);

    // 2. Document exist nahi karta
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // 3. Ownership check
    if (document.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own documents",
      });
    }

    // 4. Owner hai, therefore allow
    return res.status(200).json({
      success: true,
      message: "Document fetched successfully",
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. DB se document find karo
    const document = await getDocumentById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // 2. Ownership check
    if (document.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own documents",
      });
    }

    // 3. S3 se actual file delete karo
    await deleteFromS3(document.s3_key);

    // 4. DB se metadata delete karo
    await deleteDocumentById(id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocumentsByUser,
  getDocument,
  deleteDocument,
};