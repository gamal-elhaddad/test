const express = require('express');

const controller = require('../controllers/auth.controller');

const vc = require('../validations/auth.vc');
const validatorMiddleware = require('../middlewares/validator.mw');
const {
	hasSignedUp,
	validateDeviceDataInHeaders,
	isAuthenticated,
	hasForgottenPassword,
} = require('../middlewares/auth.mw');

const router = express.Router();

router.post('/signup', vc.signup, validatorMiddleware, controller.signup);

router.post(
	'/signup-resend-verification-code/:channel',
	hasSignedUp,
	vc.signupResend,
	validatorMiddleware,
	controller.signupResend,
);

router.put(
	'/verify-phone',
	hasSignedUp,
	vc.verifyPhone,
	validatorMiddleware,
	controller.verifyPhone,
);

router.post(
	'/login',
	(req, res, next) => {
		const { devicetype: deviceType, devicefingerprint: deviceFingerprint } =
			req.headers;

		validateDeviceDataInHeaders(deviceFingerprint, deviceType);
		next();
	},
	vc.userLogin,
	validatorMiddleware,
	controller.login,
);

router.post('/logout', isAuthenticated, controller.logout);

router.post(
	'/forgot-password',
	vc.forgotPassword,
	validatorMiddleware,
	controller.forgotPassword,
);

router.post(
	'/forgot-password-resend-verification-code/:channel',
	hasForgottenPassword,
	vc.forgotPasswordResend,
	validatorMiddleware,
	controller.forgotPasswordResend,
);

router.post(
	'/verify-forgot-password',
	hasForgottenPassword,
	vc.verifyForgotPassword,
	validatorMiddleware,
	controller.verifyForgotPassword,
);

router.put(
	'/reset-password',
	hasForgottenPassword,
	vc.resetPassword,
	validatorMiddleware,
	controller.resetPassword,
);

module.exports = router;
