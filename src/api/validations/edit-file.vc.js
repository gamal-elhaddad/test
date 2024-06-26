const { query, body } = require('express-validator');
const { fileTypes } = require('../../config/constants');
const { AWS_BUCKET_NAME } = require('../../config/env');

exports.uploadFile = [
	query('type')
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.isIn(Object.values(fileTypes))
		.withMessage(`should be ${Object.values(fileTypes).join(' or ')}`),
];

exports.deleteFile = [
	body('file')
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.isURL()
		.withMessage('should be url')
		.matches(new RegExp(`^https://${AWS_BUCKET_NAME}.s3.wasabisys.com/`))
		.withMessage('invalid URL'),
];
