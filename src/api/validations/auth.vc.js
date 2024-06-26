const { body, param } = require('express-validator');
const {
	userTypes,
	gender,
	passwordValidationOptions,
	phone_E164FormatRegex,
	twilioVerificationChannels,
} = require('../../config/constants');

const paramTwilioChannel = param('channel')
	.isIn(Object.values(twilioVerificationChannels))
	.withMessage(`should be in [${Object.values(twilioVerificationChannels)}]`);

const BodyTwilioVerificationCode = body('verificationCode')
	.exists()
	.withMessage(['should exist'])
	.bail()
	.trim()
	.notEmpty()
	.withMessage(['should not be empty'])
	.bail()
	.isNumeric()
	.withMessage(['should be number'])
	.bail()
	.isLength(4)
	.withMessage(['should be 4 number']);

exports.signup = [
	body('userType')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isIn([userTypes.teacher, userTypes.student])
		.withMessage(
			`should be in [${[userTypes.teacher, userTypes.student]}]`,
		),
	body('name')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isString()
		.withMessage('should be string')
		.isLength({ min: 5, max: 40 })
		.withMessage('length should be between 5 and 40'),
	body('phone')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isMobilePhone()
		.withMessage('should be valid phone number')
		.bail()
		.matches(phone_E164FormatRegex)
		.withMessage(['should match E.164 format']),
	body('email')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isEmail()
		.withMessage('should be valid email address'),

	body('title')
		.optional()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isMongoId()
		.withMessage('should be valid mongo id'),
	body('gender')
		.if((value, { req }) => req.body.userType == userTypes.teacher)
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isIn(Object.values(gender))
		.withMessage(`should be in [${Object.values(gender)}]`),
	body('password')
		.if((value, { req }) => req.body.userType == userTypes.teacher)
		.exists()
		.withMessage('should exist')
		.bail()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isStrongPassword(passwordValidationOptions)
		.withMessage(
			'should be strong, with minimum 8 characters length, include at least 1 number, 1 uppercase letter, 1 lowercase letter, and 1 symbol',
		),

	// body('academicYear').if((value, { req }) => req.body.userType == userTypes.student),
	// body('school').if((value, { req }) => req.body.userType == userTypes.student),
	// body('dateOfBirth').if((value, { req }) => req.body.userType == userTypes.student)
];

exports.signupResend = [paramTwilioChannel];

exports.verifyPhone = [BodyTwilioVerificationCode];

exports.userLogin = [
	body('userType')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isIn(Object.values(userTypes))
		.withMessage(`should be in [${Object.values(userTypes)}]`),
	body('phone')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty'),
	body('password')
		.exists()
		.withMessage('should exist')
		.bail()
		.notEmpty()
		.withMessage('should not be empty'),
];

exports.forgotPassword = [
	body('userType')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isIn([userTypes.teacher, userTypes.student])
		.withMessage(
			`should be in [${[userTypes.teacher, userTypes.student]}]`,
		),
	body('phone')
		.exists()
		.withMessage(['should exist'])
		.bail()
		.trim()
		.notEmpty()
		.withMessage(['should not be empty'])
		.bail()
		.isMobilePhone()
		.withMessage(['Invalid phone number'])
		.bail()
		.matches(phone_E164FormatRegex)
		.withMessage(['should match E.164 format']),
];

exports.forgotPasswordResend = [paramTwilioChannel];

exports.verifyForgotPassword = [BodyTwilioVerificationCode];

exports.resetPassword = [
	body('resetPasswordToken')
		.exists()
		.withMessage('should exist')
		.bail()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isString()
		.withMessage('should be string'),
	body('newPassword')
		.exists()
		.withMessage('should exist')
		.bail()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isStrongPassword(passwordValidationOptions)
		.withMessage(
			'should be strong, with minimum 8 characters length, include at least 1 number, 1 uppercase letter, 1 lowercase letter, and 1 symbol',
		),
];
