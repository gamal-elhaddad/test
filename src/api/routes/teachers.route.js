const express = require('express');
const controller = require('../controllers/teacher.controller');
const { isAuthorized, isAuthenticated } = require('../middlewares/auth.mw');
const { userTypes } = require('../../config/constants');
const vc = require('../validations/teacher.vc');
const validatorMiddleware = require('../middlewares/validator.mw');

const router = express.Router();

router.use(isAuthenticated);
router.use(isAuthorized(userTypes.teacher));

router.put(
	'/personal-data',
	vc.updateTeacher,
	validatorMiddleware,
	controller.updateTeacher,
);
router.put(
	'/application-settings',
	vc.updateApp,
	validatorMiddleware,
	controller.updateApp,
);

module.exports = router;
