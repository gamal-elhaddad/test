const { body } = require('express-validator');
const { imageUrlForTeacher } = require('../../config/constants');
const { arrayItemsUnique } = require('../handlers/functions.handler');

exports.createCourse = [
	body('name')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty'),
	body('image')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.matches(new RegExp(imageUrlForTeacher))
		.withMessage('invalid image Url'),
	body('price')
		.exists()
		.withMessage('should exist')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isNumeric()
		.withMessage('should be number')
		.custom((value) => value > 0)
		.withMessage('must be more than 0'),
	body('discountedPrice')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty')
		.bail()
		.isNumeric()
		.withMessage('should be number'),
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
	body('description')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('should not be empty'),
	body('goals')
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
];
