const express = require('express');

const controller = require('../controllers/titles.controller');
const { isAuthorized, isAuthenticated } = require('../middlewares/auth.mw');
const { userTypes } = require('../../config/constants');
const expressAsyncHandler = require('express-async-handler');
const vc = require('../validations/titles.vc');
const validatorMiddleware = require('../middlewares/validator.mw');

const router = express.Router();

router.get(
	'',
	expressAsyncHandler(async (req, res, next) => {
		if (req.headers.authorization) {
			isAuthenticated(req, res, next);
			isAuthorized([userTypes.admin, userTypes.teacher]);
		} else {
			req.user = {
				userType: userTypes.visitor,
			};
			next();
		}
	}),
	vc.titlesList,
	validatorMiddleware,
	controller.titlesList,
);

module.exports = router;
