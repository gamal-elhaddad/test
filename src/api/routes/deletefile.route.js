const express = require('express');

const controller = require('../controllers/edit-file.controller');
const { isAuthorized, isAuthenticated } = require('../middlewares/auth.mw');
const vc = require('../validations/edit-file.vc');
const validatorMiddleware = require('../middlewares/validator.mw');
const { userTypes } = require('../../config/constants');

const router = express.Router();

router.use(isAuthenticated);
router.use(
	isAuthorized([userTypes.teacher, userTypes.admin, userTypes.student]),
);

router.delete('', vc.deleteFile, validatorMiddleware, controller.deleteFile);

module.exports = router;
