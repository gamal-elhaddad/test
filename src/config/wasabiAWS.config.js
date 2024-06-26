const AWS = require('aws-sdk');
const {
	AWS_REGION,
	AWS_ACCESS_KEY_ID,
	AWS_ACCESS_SECRET_KEY,
} = require('./env');

AWS.config.update({
	accessKeyId: AWS_ACCESS_KEY_ID,
	secretAccessKey: AWS_ACCESS_SECRET_KEY,
	region: AWS_REGION,
});

module.exports = AWS;
