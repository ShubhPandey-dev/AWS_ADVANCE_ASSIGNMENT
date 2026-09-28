const {
  CloudWatchClient,
  PutMetricDataCommand,
} = require("@aws-sdk/client-cloudwatch");

const cloudWatchClient = new CloudWatchClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const METRIC_NAMESPACE = "DocumentPlatform";

const putMetric = async (metricName, value = 1) => {
  try {
    const command = new PutMetricDataCommand({
      Namespace: METRIC_NAMESPACE,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: "Count",
        },
      ],
    });

    await cloudWatchClient.send(command);

    console.log(
      `CloudWatch metric recorded: ${metricName} = ${value}`
    );
  } catch (error) {
    console.error(
      `CloudWatch metric failed: ${metricName}`,
      error.message
    );
  }
};

module.exports = {
  putMetric,
};