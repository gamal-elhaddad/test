const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const {
	responseHandler,
	ResponseBody,
} = require('../handlers/response.handler');
const { generateJWT, decodeJWT } = require('../handlers/functions.handler');
const { saveHandler } = require('../handlers/save.handler');
const {
	userTypes,
	twilioVerificationChannels,
	planTypes,
} = require('../../config/constants');
const { CustomError } = require('../handlers/error.handler');
const {
	sendVerificationCode,
	verifyCode,
} = require('../services/twilio.service');
const Users = {
	admin: require('../models/admin.model'),
	teacher: require('../models/teacher.model'),
	student: require('../models/student.model'),
};
const Title = require('../models/title.model');
const Plan = require('../models/plan.model');

const userSignup = async (reqBody, res, next, user) => {
	const {
		userType,
		phone,
		email,
		name,

		gender,
		title,
		password,

		// academicYear,
		// school,
		// dateOfBirth
	} = reqBody;

	user.fullName = name;
	user.email = {
		address: email,
	};
	user.phone = {
		number: phone,
	};
	user.signupToken = generateJWT.signup({
		id: user._id,
		userType: userTypes[userType],
		phone,
	});
	user.devices = undefined;
	user.categories = undefined;
	if (userType == userTypes.teacher) {
		user.password = password;
		user.gender = gender;
		user.title = title;
		if (title) {
			const titleDoc = await Title.findOne({
				_id: title,
				gender: gender,
				hidden: false,
			});

			if (!titleDoc)
				return next(new CustomError(404, 40401, 'title not found'));
		}
		// } else {
		// 	//student
		// user.password = undefined;
		// user.academicYear = academicYear;
		// user.school = school;
		// user.dateOfBirth = dateOfBirth
	}

	await user.save();
	if (userType == userTypes.teacher) {
		try {
			await sendVerificationCode(
				phone,
				twilioVerificationChannels.whatsapp,
			);
		} catch (err) {
			return next(err);
		}
	}

	return responseHandler(
		res,
		201,
		new ResponseBody(
			{
				signupToken: user.signupToken,
			},
			userType == userTypes.teacher
				? `verfication otp has been sent via ${twilioVerificationChannels.whatsapp}`
				: undefined,
		),
	);
};

exports.signup = expressAsyncHandler(async (req, res, next) => {
	const { userType, phone, email } = req.body;
	const users = await Users[userType].find({
		$or: [
			{
				'phone.number': phone,
			},
			{
				'email.address': email,
			},
		],
	});

	if (users.length) {
		for (let user of users) {
			if (user.phone.verified) {
				if (user.phone.number == phone && user.phone.verified)
					// there is a verified account using this phone
					return next(
						new CustomError(
							403,
							40300,
							`phone already on the system as a ${userType}`,
						),
					);
				// there is a verified account using this email
				else
					return next(
						new CustomError(
							403,
							40301,
							`email already on the system as a ${userType} with a verified phone`,
						),
					);
			} else {
				// there is a signupToken in the document
				try {
					decodeJWT.signup(user.signupToken);
				} catch (error) {
					user.signupToken = undefined;
				}
				if (user.signupToken) {
					return next(
						new CustomError(403, 40302, 'user is registering'),
					);
				} else {
					// update the doc and transfer account ownership
					userSignup(req.body, res, next, user);
				}
			}
		}
	} else {
		// create new account
		const user = new Users[userType]({});

		userSignup(req.body, res, next, user);
	}
});

exports.signupResend = expressAsyncHandler(async (req, res, next) => {
	const { channel } = req.params;
	const { phone, id, userType } = req.user;

	const signupTokenInitializationDate = new Date(req.user.iat * 1000);

	if (
		new Date() <
		new Date(signupTokenInitializationDate.getTime() + 2 * 60000)
	) {
		throw new CustomError(
			403,
			40307,
			"can't resend otp, wait 2 minutes after the first sending",
		);
	}
	try {
		await sendVerificationCode(phone, channel);
	} catch (err) {
		return next(err);
	}

	const signupToken = generateJWT.signup({
		id,
		userType,
		phone,
	});

	const user = await Users[userType]
		.findById(id)
		.select('signupToken timeline');

	user.signupToken = signupToken;
	await user.save();

	return responseHandler(
		res,
		200,
		new ResponseBody({
			signupToken,
		}),
	);
});

exports.verifyPhone = expressAsyncHandler(async (req, res) => {
	const { verificationCode } = req.body;
	const { userType, id } = req.user;
	const { devicetype: deviceType, devicefingerprint: deviceFingerprint } =
		req.headers;
	const user = await Users[userType].findById(id);

	const verificationSid = await verifyCode(
		user.phone.number,
		verificationCode,
	);
	const loginToken = generateJWT.login({
		id,
		userType,
		deviceType,
		deviceFingerprint,
	});

	user.devices = [
		{
			loginToken,
			deviceType,
			deviceFingerprint,
		},
	];
	user.phone.verified = true;
	user.phone.verificationSID = verificationSid;
	let {
		id: planId,
		storage,
		students,
		courses,
		type,
	} = await Plan.findOne({ type: planTypes.free });

	if (userType == userTypes.teacher) {
		user.plan = {
			planId,
			storage,
			students,
			courses,
			type,
			subscriptionStart: new Date(),
		};
	}
	user.signupToken = undefined;
	await user.save();

	return responseHandler(res, 200, new ResponseBody({ loginToken }));
});

exports.login = expressAsyncHandler(async (req, res) => {
	const { devicetype: deviceType, devicefingerprint: deviceFingerprint } =
		req.headers;
	const { phone, password, userType } = req.body;
	const user = await Users[userType].findOne({ 'phone.number': phone });
	let passwordMatch;

	user && (passwordMatch = await bcrypt.compare(password, user.password));

	if (!user) {
		throw new CustomError(401, 40106, "account doesn't exist");
	}
	if (!passwordMatch) {
		throw new CustomError(401, 40105, 'incorrect password');
	}

	let loginToken = generateJWT.login({
		id: user._id,
		userType,
		deviceFingerprint,
		deviceType,
	});

	// ☁️ the next part will change in the next version

	let foundMainDeviceIndex = user.devices.findIndex(
		(device) =>
			device.deviceFingerprint == deviceFingerprint &&
			device.deviceType == deviceType,
	);

	// if (userType !== userTypes.student || user.enrollments) {
	if (foundMainDeviceIndex != -1)
		user.devices[foundMainDeviceIndex].loginToken = loginToken;
	else
		user.devices.push({
			deviceFingerprint,
			deviceType,
			loginToken,
		});
	// } else {
	// 	let foundEnrollmentDeviceIndex = user.enrollments[0].devices.findIndex(
	// 		(device) =>
	// 			device.deviceFingerprint == deviceFingerprint &&
	// 			device.deviceType == deviceType,
	// 	);

	// 	if (foundEnrollmentDeviceIndex != -1) {
	// 		user.devices[foundMainDeviceIndex].loginToken = loginToken;
	// 		user.enrollments[0].devices[foundEnrollmentDeviceIndex].loginToken =
	// 			loginToken;
	// 	} else {
	// 		await user.populate({
	// 			path: 'user.enrollments.teacher',
	// 			select: 'application.permissions.noOfDevices',
	// 		});

	// 		if (
	// 			user.enrollments[0].teacher.application.permissions
	// 				.noOfDevices > user.enrollments[0].devices.length
	// 		) {
	// 			user.devices.push({
	// 				deviceFingerprint,
	// 				deviceType,
	// 				loginToken,
	// 			});
	// 			user.enrollments[0].devices.push({
	// 				deviceFingerprint,
	// 				deviceType,
	// 				loginToken,
	// 			});
	// 		} else {
	// 			throw new CustomError(
	// 				403,
	// 				40310,
	// 				"can't login maximum devices exceeded for this teacher app",
	// 			);
	// 		}
	// 	}
	// }

	await user.save();
	return responseHandler(res, 200, new ResponseBody({ loginToken }));
});

exports.logout = expressAsyncHandler(async (req, res) => {
	const { id, userType, deviceFingerprint, deviceType } = req.user;

	const user = await Users[userType].findById(id);

	// ☁️ the next part will change in the next version

	let foundMainDeviceIndex = user.devices.findIndex(
		(device) =>
			device.deviceFingerprint == deviceFingerprint &&
			device.deviceType == deviceType,
	);

	user.devices[foundMainDeviceIndex].loginToken = undefined;

	if (userType == userTypes.student && user.enrollments.length) {
		let foundEnrollmentDeviceIndex = user.enrollments[0].devices.findIndex(
			(device) =>
				device.deviceFingerprint == deviceFingerprint &&
				device.deviceType == deviceType,
		);

		user.enrollments[0].devices[foundEnrollmentDeviceIndex].loginToken =
			undefined;
	}

	await user.save();

	return responseHandler(res, 200);
});

exports.forgotPassword = expressAsyncHandler(async (req, res, next) => {
	const { phone, userType } = req.body;
	const user = await Users[userType].findOne({
		'phone.number': phone,
		'phone.verified': true,
	});

	if (!user) {
		throw new CustomError(401, 40106, "account doesn't exist");
	}
	const forgotPasswordToken = generateJWT.forgotPassword({
		id: user._id,
		userType,
		phone,
	});

	if (user.forgotPasswordToken) {
		try {
			decodeJWT.forgotPassword(user.forgotPasswordToken);
		} catch (error) {
			user.forgotPasswordToken = undefined;
		}
		if (user.forgotPasswordToken) {
			throw new CustomError(403, 40320, 'user is reseting password');
		}
	}

	user.resetToken = undefined;
	user.forgotPasswordToken = forgotPasswordToken;
	await user.save();
	try {
		await sendVerificationCode(user.phone.number);
	} catch (err) {
		return next(err);
	}

	return responseHandler(
		res,
		200,
		new ResponseBody(
			{ forgotPasswordToken },
			'verification code sent successfully',
		),
	);
});

exports.forgotPasswordResend = expressAsyncHandler(async (req, res, next) => {
	const { channel } = req.params;
	const { phone, id, userType, iat } = req.user;

	const forgotPasswordTokenInitializationDate = new Date(iat * 1000);

	if (
		new Date() <
		new Date(forgotPasswordTokenInitializationDate.getTime() + 2 * 60000)
	) {
		throw new CustomError(
			403,
			40308,
			"can't resend otp, wait 2 minutes after the first sending",
		);
	}
	try {
		await sendVerificationCode(phone, channel);
	} catch (err) {
		return next(err);
	}

	const forgotPasswordToken = generateJWT.forgotPassword({
		id,
		userType,
		phone,
	});

	const user = await Users[userType]
		.findById(id)
		.select('forgotPasswordToken timeline');

	user.forgotPasswordToken = forgotPasswordToken;
	await user.save();

	return responseHandler(
		res,
		200,
		new ResponseBody({
			forgotPasswordToken,
		}),
	);
});

exports.verifyForgotPassword = expressAsyncHandler(async (req, res) => {
	const { verificationCode } = req.body;
	const { phone, id, userType, iat } = req.user;
	const user = await Users[userType].findById(id);

	if (user.resetToken) {
		throw new CustomError(
			403,
			40304,
			'You have already verified the password reset',
		);
	}

	await verifyCode(phone, verificationCode);

	user.devices.map((device) => (device.loginToken = undefined));

	user.resetToken = generateJWT.resetPassword(iat);

	await user.save();

	return responseHandler(
		res,
		200,
		new ResponseBody({ resetPasswordToken: user.resetToken }),
	);
});

exports.resetPassword = expressAsyncHandler(async (req, res) => {
	const { newPassword: password, resetPasswordToken: resetToken } = req.body;
	const { id, userType } = req.user;

	const user = await Users[userType].findById(id);

	if (!user.resetToken) {
		throw new CustomError(403, 40323, 'you should first verify your phone');
	} else if (user.resetToken !== resetToken) {
		throw new CustomError(498, 49800, 'incorrect reset token');
	}
	const isOldPasswordMatch = await bcrypt.compare(password, user.password);

	if (isOldPasswordMatch) {
		throw new CustomError(409, 40901, 'you cannot reuse previous password');
	}
	user.password = password;
	user.forgotPasswordToken = undefined;
	user.resetToken = undefined;

	await saveHandler(user);

	return responseHandler(
		res,
		200,
		new ResponseBody(undefined, 'password reset successfully'),
	);
});
