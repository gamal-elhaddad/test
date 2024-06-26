const expressAsyncHandler = require('express-async-handler');
const { decodeJWT } = require('../handlers/functions.handler');
const { JwtError, CustomError } = require('../handlers/error.handler');
const { deviceTypes, userTypes } = require('../../config/constants');

/* 🔴🔴 some mw are not tested yet, it will be tested when used 🔴🔴 */
const Users = {
	admin: require('../models/admin.model'),
	teacher: require('../models/teacher.model'),
	student: require('../models/student.model'),
};

const validateBearerToken = (authHeader) => {
	if (
		!authHeader ||
		!authHeader.startsWith('Bearer') ||
		authHeader.endsWith('undefined')
	) {
		throw new JwtError(
			401,
			40100,
			'Authorization header does not contain Bearer valid token',
		);
	}
};

const validateDeviceDataInHeaders = (deviceFingerprint, deviceType) => {
	if (!deviceType || !deviceFingerprint) {
		throw new CustomError(
			401,
			40111,
			'no deviceType or deviceFingerPrint in headers',
		);
	}
	if (!Object.values(deviceTypes).includes(deviceType)) {
		throw new CustomError(401, 40112, 'deviceType not allowed');
	}
};

exports.validateDeviceDataInHeaders = validateDeviceDataInHeaders;

const validateLoginSession = async (
	token,
	decodedToken,
	deviceFingerprint,
	deviceType,
) => {
	const { userType, id } = decodedToken;
	const userProjection =
		userType === userTypes.student
			? 'devices enrollments.devices enrollments'
			: 'devices';

	const user = await Users[userType].findById(id).select(userProjection);

	if (!user) {
		// happens only in development in case you manually deleted the user doc
		throw new CustomError(401, 40102, "user doesn't exist");
	}
	let device;
	let studentHasEnrolledToTeacher;

	if (userType == userTypes.student) {
		/* if the student is enrolled to a teacher, validate the device inside enrollment
			else validate the device within the direct devices in the student
		*/
		if (user.enrollments) {
			device = user.enrollments[0].devices.find((device) => {
				if (device.loginToken === token) {
					if (
						device.deviceFingerprint == deviceFingerprint &&
						device.deviceType == deviceType
					) {
						return device;
					} else {
						throw new CustomError(401, 40110, 'wrong device');
					}
				}
			});
			studentHasEnrolledToTeacher = true;
			await user.populate({
				path: 'enrollments.teacher',
				select: 'blocked plan.subscriptionEnd',
			});
			allowStudentAccessToTeacherContent(
				user.enrollments[0].teacher.blocked,
				user.enrollments[0].teacher.plan.subscriptionEnd,
			);
		} else {
			device = user.devices.find((device) => {
				if (device.loginToken === token) {
					if (
						device.deviceFingerprint == deviceFingerprint &&
						device.deviceType == deviceType
					) {
						return device;
					} else {
						throw new CustomError(401, 40110, 'wrong device');
					}
				}
			});
			studentHasEnrolledToTeacher = false;
		}
	} else {
		// userType is teacher or admin
		device = user.devices.find((device) => {
			if (device.loginToken === token) {
				if (
					device.deviceFingerprint == deviceFingerprint &&
					device.deviceType == deviceType
				) {
					return device;
				} else {
					throw new CustomError(401, 40110, 'incorrect device');
				}
			}
		});
	}
	if (!device) {
		// mostly the user has logged out
		throw new JwtError(401, 40103, 'token does not exist for this user');
	}
	return studentHasEnrolledToTeacher;
};

const validateSignupSession = async (token, decodedToken) => {
	const userType = decodedToken.userType;

	const user = await Users[userType]
		.findById(decodedToken.id)
		.select('password signupToken');

	if (!user) {
		// happens only in development in case you manually deleted the user doc
		throw new CustomError(401, 40102, "user doesn't exist");
	}
	if (!user.signupToken) {
		// user phone is verified
		throw new CustomError(403, 40306, 'already signed up');
	}
	if (userType == userTypes.student && !user.password) {
		throw new CustomError(403, 40318, "user hasn't set his password yet");
	}
	if (user.signupToken != token) {
		// signup session has been replaced (while resending code)
		throw new CustomError(401, 40113, 'signup token has been replaced');
	}
};

/*
when student is trying to:
	enroll to a teacher
	view teacher profile

	view course (content=true)

	get courses list
*/
const allowStudentAccessToTeacherContent = (
	teacherBlocked,
	teacherPlanSubscriptionEnd,
) => {
	if (teacherBlocked) {
		throw new CustomError(403, 40316, 'teacher is blocked');
	}
	if (new Date() > teacherPlanSubscriptionEnd) {
		throw new CustomError(403, 40317, "teacher's plan is expired");
	}
};

const validateForgotPasswordSession = async (token, decodedToken) => {
	const userType = decodedToken.userType;

	const user = await Users[userType]
		.findById(decodedToken.id)
		.select('password forgotPasswordToken');

	if (!user) {
		// happens only in development in case you manually deleted the user doc
		throw new CustomError(401, 40102, "user doesn't exist");
	}
	if (!user.forgotPasswordToken) {
		// no forgot password session, probably user has successfully rest his password
		throw new CustomError(
			403,
			40322,
			'there is no forgot password session',
		);
	}
	if (user.forgotPasswordToken != token) {
		// forgotPassword session has been replaced (while resending code)
		throw new CustomError(
			401,
			40116,
			'forgot password token has been replaced',
		);
	}
};

exports.isAuthenticated = expressAsyncHandler(async (req, res, next) => {
	const {
		authorization: authHeader,
		devicefingerprint: deviceFingerprint,
		devicetype: deviceType,
	} = req.headers;

	validateBearerToken(authHeader);
	validateDeviceDataInHeaders(deviceFingerprint, deviceType);
	const token = authHeader.split(' ')[1];
	const decodedToken = decodeJWT.login(token);

	await validateLoginSession(
		token,
		decodedToken,
		deviceFingerprint,
		deviceType,
	);

	req.user = { ...req.user, ...decodedToken };

	next();
});

exports.isAuthorized = (allowedUserTypes) => {
	return (req, res, next) => {
		if (!allowedUserTypes.includes(req.user.userType)) {
			throw new CustomError(403, 40305, 'user type not allowed');
		}
		next();
	};
};

exports.hasSignedUp = expressAsyncHandler(async (req, res, next) => {
	const {
		authorization: authHeader,
		devicefingerprint: deviceFingerprint,
		devicetype: deviceType,
	} = req.headers;

	validateBearerToken(authHeader);
	const token = authHeader.split(' ')[1];

	const decodedToken = decodeJWT.signup(token);

	await validateSignupSession(token, decodedToken);

	if (req.path == '/verify-phone') {
		validateDeviceDataInHeaders(deviceFingerprint, deviceType);
	}

	req.user = decodedToken;

	next();
});

exports.hasForgottenPassword = expressAsyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	validateBearerToken(authHeader);
	const token = authHeader.split(' ')[1];
	const decodedToken = decodeJWT.forgotPassword(token);

	await validateForgotPasswordSession(token, decodedToken);

	req.user = decodedToken;
	next();
});

// /*
// 	* prevent enrolled students from
// 		** enrolling to another teacher
// */
// exports.preventEnrolledStudents = expressAsyncHandler(async (req, res, next) => {
// 	if (req.user.userType === userTypes.student && req.user.studentHasEnrolledToTeacher == true) {
// 		throw new CustomError(403, 40311, 'student already enrolled to a teacher');
// 	}
// 	next();
// });

// /*
// 	* prevent not enrolled students from
// 		** viewing application settings
// 		** listing courses
// */
// exports.allowEnrolledStudents = expressAsyncHandler(async (req, res, next) => {
// 	if (req.user.userType === userTypes.student && req.user.studentHasEnrolledToTeacher == false ) {
// 		throw new CustomError(403, 40312, 'student did not enroll to a teacher');
// 	}
// 	next();
// });
