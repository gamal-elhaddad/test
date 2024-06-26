const { validationResult } = require('express-validator');
const { NODE_ENV } = require('../../config/env');
const { CustomError } = require('../handlers/error.handler');
const { responseHandler } = require('../handlers/response.handler');

function validationErrorMsgBasedOnMode(err, errors) {
	if (typeof err.msg == 'string') {
		errors[err.path] = err.msg;
	} else {
		if (NODE_ENV === 'dev') {
			errors[err.path] = err.msg[0];
		} else {
			errors[err.path] = err.msg[1] ? err.msg[1] : err.msg[0];
		}
	}
}

const validatorMiddleware = (req, res, next) => {
	const result = validationResult(req);

	if (!result.isEmpty()) {
		let errors = {};

		let notBodyError = result.errors.find((err) => err.location !== 'body');

		if (notBodyError) {
			// error message will be updated in prod mode based on ux messages
			let errorMessage = '';

			notBodyError.path && (errorMessage += `${notBodyError.path} `);
			notBodyError.location &&
				(errorMessage += `${notBodyError.location} `);
			notBodyError.type !== 'alternative' &&
				(errorMessage += `${notBodyError.type} `);
			errorMessage += notBodyError.msg;

			validationErrorMsgBasedOnMode(notBodyError, errors);
			throw new CustomError(422, 42201, errorMessage);
		}

		result.errors.map((err) => {
			validationErrorMsgBasedOnMode(err, errors);
		});

		return responseHandler(res, 422, { errors, code: 42200 });
	}
	next();
};

module.exports = validatorMiddleware;
