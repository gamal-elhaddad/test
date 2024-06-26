const expressAsyncHandler = require('express-async-handler');
const {
	responseHandler,
	ResponseBody,
} = require('../handlers/response.handler');
const Category = require('../models/category.model');
const { userTypes } = require('../../config/constants');
const Teacher = require('../models/teacher.model');

exports.categoriesList = expressAsyncHandler(async (req, res) => {
	let filters = {};
	let select;

	if (req.user.userType === userTypes.teacher) {
		const teacher = await Teacher.findById(req.user.id).select(
			'categories',
		);

		filters = {
			$or: [{ hidden: false }, { name: { $in: teacher.categories } }],
		};
		select = 'name';
	} else {
		select = 'name hidden color';
	}

	const categories = await Category.find(filters).select(select);

	responseHandler(res, 200, new ResponseBody({ categories }));
});
