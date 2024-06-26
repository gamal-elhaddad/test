const { body, oneOf, query } = require('express-validator');
const {
	gender,
	phone_E164FormatRegex,
	hexacodePattern,
	imageUrlForTeacher,
	applicationSettingsDataType,
} = require('../../config/constants');
const { arrayItemsUnique } = require('../handlers/functions.handler');

exports.updateTeacher = [
	oneOf(
		[
			body('title').exists(),
			body('instagram').exists(),
			body('facebook').exists(),
			body('twitter').exists(),
			body('name').exists(),
			body('gender').exists(),
			body('email').exists(),
			body('image').exists(),
			body('brief').exists(),
			body('categories').exists(),
			body('whatsapp').exists(),
		],
		{
			message: ['there are no updates'],
			errorType: 'least_errored',
		},
	),
	body('title')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isMongoId()
		.withMessage('should be mongo id'),
	body('instagram').optional().trim().isURL().withMessage('should be url'),
	body('facebook').optional().trim().isURL().withMessage('should be url'),
	body('twitter').optional().trim().isURL().withMessage('should be url'),
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty'),
	body('gender')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isIn(Object.values(gender))
		.withMessage(`should be ${Object.values(gender).join(' or ')}`),
	body('email')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isEmail()
		.withMessage('should be valid email address'),
	body('image')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.matches(new RegExp(imageUrlForTeacher))
		.withMessage('invalid image Url'),
	body('brief')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty'),
	body('categories')
		.optional()
		.isArray({ min: 1 })
		.withMessage('should be array with at least 1 element')
		.bail()
		.custom((value) => {
			if (!arrayItemsUnique(value)) {
				return Promise.reject('should be unique');
			}
			return true;
		}),
	body('categories.*').trim().isMongoId().withMessage('should be mongo id'),
	body('whatsapp')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isMobilePhone()
		.withMessage('should be valid phone number')
		.bail()
		.matches(phone_E164FormatRegex)
		.withMessage(['should match E.164 format']),
];

exports.updateApp = [
	query('data')
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.isIn(Object.values(applicationSettingsDataType))
		.withMessage(
			`should be ${Object.values(applicationSettingsDataType).join(' or ')}`,
		),
	oneOf(
		[
			body('color').exists(),
			body('logo').exists(),
			body('textDirectionRTL').exists(),
		],
		{
			message: ['there are no updates'],
			errorType: 'least_errored',
		},
	),
	body('color')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.matches(new RegExp(hexacodePattern))
		.withMessage('invalid color'),
	body('logo')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.matches(new RegExp(imageUrlForTeacher))
		.withMessage('invalid image Url'),
	body('textDirectionRTL')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isBoolean()
		.withMessage('should be boolean value')
		.toBoolean(),
];
