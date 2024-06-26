const jwt = require('jsonwebtoken');
const {
	JWT_LOGIN_SECRET_KEY,
	JWT_SIGNUP_SECRET_KEY,
	JWT_FORGOT_PASSWORD_SECRET_KEY,
	JWT_RESET_PASSWORD_SECRET_KEY,
} = require('../../config/env');
const { JwtError, CustomError } = require('./error.handler');
const { userTypes } = require('../../config/constants');

exports.arrayLengthBetweenRange = (array, min = 0, max = Infinity) => {
	return array.length >= min && array.length <= max;
};

exports.arrayItemsUnique = (array) => {
	// in case it's an array of objectIds or dates...
	array = array.map((item) => JSON.stringify(item));
	return array.length === new Set(array).size;
};

exports.getObjectKeyByValue = (object, value) => {
	return Object.keys(object).find((key) => object[key] === value);
};

exports.escapeRegExp = (string) => {
	return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

exports.isDateValid = (dateStr) => {
	return !isNaN(new Date(dateStr));
};

exports.generateJWT = {
	login: (payload) => {
		if (
			!payload.userType ||
			!Object.values(userTypes).includes(payload.userType) ||
			!payload.id ||
			!payload.deviceFingerprint ||
			!payload.deviceType
		) {
			throw new CustomError(500, 50000, 'invalid token payload');
		}
		return jwt.sign(payload, JWT_LOGIN_SECRET_KEY, {
			expiresIn: '1y',
		});
	},
	signup: (payload) => {
		if (!payload.userType || !payload.id || !payload.phone) {
			throw new CustomError(500, 50000, 'invalid token payload');
		}
		return jwt.sign(payload, JWT_SIGNUP_SECRET_KEY, {
			expiresIn: '10m',
		});
	},
	forgotPassword: (payload) => {
		if (!payload.userType || !payload.id || !payload.phone) {
			throw new CustomError(500, 50000, 'invalid token payload');
		}
		return jwt.sign(payload, JWT_FORGOT_PASSWORD_SECRET_KEY, {
			expiresIn: '10m',
		});
	},
	resetPassword: (date) => {
		if (!this.isDateValid(date))
			throw new CustomError(500, 50000, 'invalid token expiry date');
		const remainingTime = date - Math.floor(Date.now() / 1000);

		return jwt.sign({}, JWT_RESET_PASSWORD_SECRET_KEY, {
			expiresIn: `${remainingTime}s`,
		});
	},
};

exports.decodeJWT = {
	login: (token) => {
		return jwt.verify(token, JWT_LOGIN_SECRET_KEY, (err, decoded) => {
			if (err) {
				let error = new JwtError(401, undefined, err.message);

				if (err.message === 'jwt expired') {
					error.msg.dev = 'login jwt expired';
					error.code = 40104;
				} else if (err.message === 'invalid signature') {
					error.msg.dev = 'invalid bearer token';
					error.code = 40101;
				}
				throw error;
			}
			if (
				!decoded.userType ||
				!Object.values(userTypes).includes(decoded.userType) ||
				!decoded.id ||
				!decoded.deviceFingerprint ||
				!decoded.deviceType
			)
				throw new CustomError(500, 50000, 'invalid token payload');
			return decoded;
		});
	},
	signup: (token) => {
		return jwt.verify(token, JWT_SIGNUP_SECRET_KEY, (err, decoded) => {
			if (err) {
				let error = new JwtError(401, undefined, err.message);

				if (err.message === 'jwt expired') {
					error.msg.dev = 'signup jwt expired';
					error.code = 40107;
				} else if (err.message === 'invalid signature') {
					error.msg.dev = 'invalid bearer token';
					error.code = 40101;
				}
				throw error;
			}
			return decoded;
		});
	},
	forgotPassword: (token) => {
		return jwt.verify(
			token,
			JWT_FORGOT_PASSWORD_SECRET_KEY,
			(err, decoded) => {
				if (err) {
					let error = new JwtError(401, undefined, err.message);

					if (err.message === 'jwt expired') {
						error.msg.dev = 'forgot password jwt expired';
						error.code = 40108;
					} else if (err.message === 'invalid signature') {
						error.msg.dev = 'invalid bearer token';
						error.code = 40101;
					}
					throw error;
				}
				return decoded;
			},
		);
	},
	resetPassword: (token) => {
		return jwt.verify(
			token,
			JWT_RESET_PASSWORD_SECRET_KEY,
			(err, decoded) => {
				if (err) {
					return false;
				}
				return decoded;
			},
		);
	},
};

exports.differenceBetweenDatesInMinites = (date1, date2 = new Date()) => {
	const diffTime = Math.abs(date2 - date1);

	return diffTime / (1000 * 60);
};

// exports.matchArrays = (arr1, arr2) => {
// 	arr1 = arr1.map((item) => JSON.stringify(item));
// 	arr2 = arr2.map((item) => JSON.stringify(item));
// 	for (let i = 0;i < arr2.length;i++) {
// 		if (arr1.includes(arr2[i])) {
// 			return true;
// 		}
// 	}
// 	return false;
// };

// exports.getTodayDateRange = () => {
// 	const startOfDay = new Date();

// 	startOfDay.setHours(0, 0, 0, 0);

// 	//const endOfDay = new Date();
// 	// endOfDay.setHours(23, 59, 59, 999);

// 	return {
// 		startOfDay,
// 		//endOfDay
// 	};
// };
