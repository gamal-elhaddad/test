const express = require('express');
const controller = require('../controllers/course.controller');
const { isAuthorized, isAuthenticated } = require('../middlewares/auth.mw');
const { teacherLimit } = require('../middlewares/teacherlimit.mw');
const { userTypes } = require('../../config/constants');
const vc = require('../validations/course.vc');
const validatorMiddleware = require('../middlewares/validator.mw');

const router = express.Router();

router.use(isAuthenticated);
router.use(isAuthorized(userTypes.teacher));

router.post(
	'',
	teacherLimit,
	vc.createCourse,
	validatorMiddleware,
	controller.createCourse,
);

module.exports = router;
