const {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  PutLogEventsCommand,
} = require("@aws-sdk/client-cloudwatch-logs");

const cloudWatchLogsClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const LOG_GROUP_NAME = process.env.CLOUDWATCH_LOG_GROUP_NAME;
const LOG_STREAM_NAME = "document-platform-local";

let logStreamCreated = false;

const createLogStream = async () => {
  if (logStreamCreated) {
    return;
  }

  try {
    const command = new CreateLogStreamCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamName: LOG_STREAM_NAME,
    });

    await cloudWatchLogsClient.send(command);

    console.log("CloudWatch log stream created:", LOG_STREAM_NAME);
  } catch (error) {
    if (error.name !== "ResourceAlreadyExistsException") {
      throw error;
    }
  }

  logStreamCreated = true;
};

const logToCloudWatch = async (message) => {
  try {
    await createLogStream();

    const logEvent = {
      timestamp: Date.now(),
      message:
        typeof message === "string" ? message : JSON.stringify(message),
    };

    const command = new PutLogEventsCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamName: LOG_STREAM_NAME,
      logEvents: [logEvent],
    });

    await cloudWatchLogsClient.send(command);
  } catch (error) {
    console.error("CloudWatch logging failed:", error);
  }
};

module.exports = {
  logToCloudWatch,
};