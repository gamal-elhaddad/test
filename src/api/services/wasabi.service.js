const { AWS_ENDPOINT, AWS_BUCKET_NAME } = require('../../config/env');
const AWS = require('../../config/wasabiAWS.config');
const { AwsError } = require('../handlers/error.handler');
const fs = require('fs');
const ep = new AWS.Endpoint(AWS_ENDPOINT);
const s3 = new AWS.S3({ endpoint: ep });

exports.uploadFile = async (file, path) => {
	const fileStream = fs.createReadStream(file.path);
	const uniqueKey = `${path}/${file.filename}`;

	const params = {
		Bucket: AWS_BUCKET_NAME,
		Key: uniqueKey,
		Body: fileStream,
		ContentType: file.mimetype,
	};

	const uploadData = await s3.upload(params).promise();

	return uploadData.Location;
};

exports.deleteFile = async (fileUrl) => {
	const parsedUrl = new URL(fileUrl);
	const filekey = parsedUrl.pathname.substring(1);
	const deleteParams = {
		Bucket: AWS_BUCKET_NAME,
		Key: filekey,
	};

	try {
		await s3.deleteObject(deleteParams).promise();
	} catch (err) {
		throw new AwsError(err.statusCode, err.statusCode, err.message);
	}
};

exports.moveFile = async (fileUrl, newPath) => {
	const parsedUrl = new URL(fileUrl);
	const filekey = parsedUrl.pathname.substring(1);
	const segments = filekey.split('/');
	const fileName = segments.pop();

	const Params = {
		Bucket: AWS_BUCKET_NAME,
		CopySource: `${AWS_BUCKET_NAME}/${filekey}`,
		Key: `${newPath}/${fileName}`,
	};

	try {
		await s3.copyObject(Params).promise();
		const url = `https://${AWS_BUCKET_NAME}.s3.wasabisys.com/${Params.Key}`;

		await s3
			.deleteObject({
				Bucket: AWS_BUCKET_NAME,
				Key: filekey,
			})
			.promise();
		return url;
	} catch (err) {
		if (err.code === 'NoSuchKey') {
			throw new AwsError(
				404,
				40402,
				'image does not exist in wasasbi cloud storage',
			);
		}
		throw new AwsError(err.statusCode, err.statusCode, err.message);
	}
};
