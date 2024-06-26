const { query } = require('express-validator');
const { userTypes, gender } = require('../../config/constants');

exports.titlesList = [
	query('gender')
		.custom((value, { req }) => {
			if (
				!value &&
				(req.user.userType == userTypes.visitor ||
					req.user.userType == userTypes.teacher)
			) {
				throw new Error('should exist');
			} else {
				return true;
			}
		})
		.bail()
		.if((value) => value)
		.isIn(Object.values(gender))
		.withMessage([`should be in [${Object.values(gender)}]`]),
];
