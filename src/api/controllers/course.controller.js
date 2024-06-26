const expressAsyncHandler = require('express-async-handler');
const {
	responseHandler,
	ResponseBody,
} = require('../handlers/response.handler');
const Course = require('../models/course.model');
const wasabiService = require('../services/wasabi.service');
const { wasabiFolders, fileTypes } = require('../../config/constants');
const { saveHandler } = require('../handlers/save.handler');

exports.createCourse = expressAsyncHandler(async (req, res) => {
	const {
		name,
		image,
		price,
		discountedPrice,
		categories,
		description,
		goals,
	} = req.body;
	const teacher = req.user.id;

	const course = new Course({
		name,
		image,
		price,
		teacher,
	});
	const newPath = await wasabiService.moveFile(
		image,
		`${wasabiFolders.teacher}/${teacher}/${fileTypes.courseImage}`,
	);

	discountedPrice && (course.discountedPrice = discountedPrice);
	categories?.length && (course.categories = categories);
	description && (course.description = description);
	goals?.length && (course.goals = goals);

	course.image = newPath;
	await saveHandler(course, req.user.id, req.user.userType);
	responseHandler(
		res,
		200,
		new ResponseBody(undefined, 'Course created successfully'),
	);
});
