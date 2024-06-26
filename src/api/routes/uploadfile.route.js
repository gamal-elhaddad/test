const express = require('express');

const controller = require('../controllers/edit-file.controller');
const { isAuthorized, isAuthenticated } = require('../middlewares/auth.mw');
const { userTypes } = require('../../config/constants');
const vc = require('../validations/edit-file.vc');
const validatorMiddleware = require('../middlewares/validator.mw');
const multerService = require('../services/multer.service');

const router = express.Router();

router.use(isAuthenticated);
router.use(
	isAuthorized([userTypes.teacher, userTypes.admin, userTypes.student]),
);

router.post(
	'',
	vc.uploadFile,
	validatorMiddleware,
	multerService.uploadimage,
	controller.uploadFile,
);

module.exports = router;
