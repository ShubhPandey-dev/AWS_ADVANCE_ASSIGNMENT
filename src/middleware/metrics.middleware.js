const {putMetric} = require("../services/cloudwatchMetrics.service");

const metricMiddleware = async(req, res, next) =>{
    await putMetric("requestCount")
    res.on("finish", async() =>{
        if(res.statusCode >=500) {
            await putMetric('5xxErrorcount')
        }
    
    });
    next();
}

module.exports = metricMiddleware