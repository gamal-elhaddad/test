const express = require('express');

const controller = require('../controllers/category.controller');
const { isAuthorized, isAuthenticated } = require('../middlewares/auth.mw');
const { userTypes } = require('../../config/constants');

const router = express.Router();

router.use(isAuthenticated);

router.get(
	'',
	isAuthorized([userTypes.teacher, userTypes.admin]),
	controller.categoriesList,
);

module.exports = router;
