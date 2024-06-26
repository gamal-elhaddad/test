const expressAsyncHandler = require('express-async-handler');
const {
	responseHandler,
	ResponseBody,
} = require('../handlers/response.handler');
const Teacher = require('../models/teacher.model');
const wasabiService = require('../services/wasabi.service');
const { wasabiFolders, fileTypes } = require('../../config/constants');
const { saveHandler } = require('../handlers/save.handler');
const { CustomError } = require('../handlers/error.handler');

exports.updateTeacher = expressAsyncHandler(async (req, res) => {
	const teacherId = req.user.id;
	const {
		name,
		gender,
		email,
		title,
		image,
		brief,
		categories,
		whatsapp,
		instagram,
		facebook,
		twitter,
	} = req.body;

	const teacher = await Teacher.findById(teacherId);

	if (!teacher.socialMediaContacts) {
		teacher.socialMediaContacts = {};
	}

	if (name) teacher.fullName = name;
	if (title !== undefined) teacher.title = title;
	if (gender) teacher.gender = gender;
	if (email) teacher.email.address = email;
	if (whatsapp) teacher.socialMediaContacts.whatsapp = whatsapp;
	if (instagram !== undefined)
		teacher.socialMediaContacts.instagram = instagram
			? instagram
			: undefined;
	if (facebook !== undefined)
		teacher.socialMediaContacts.facebook = facebook ? facebook : undefined;
	if (twitter !== undefined)
		teacher.socialMediaContacts.twitter = twitter ? twitter : undefined;
	if (brief) teacher.brief = brief;
	if (categories) teacher.categories = categories;
	if (image) {
		const newPath = await wasabiService.moveFile(
			image,
			`${wasabiFolders.teacher}/${teacherId}/${fileTypes.profileImage}`,
		);

		teacher.image = newPath;
	}

	await saveHandler(teacher, req.user.id, req.user.userType);

	responseHandler(
		res,
		200,
		new ResponseBody(undefined, 'your data updated successfully'),
	);
});

exports.updateApp = expressAsyncHandler(async (req, res, next) => {
	const teacherId = req.user.id;

	const { color, logo, textDirectionRTL } = req.body;

	const teacher = await Teacher.findById(teacherId);

	if (!teacher.application) {
		if (!color || !logo || !textDirectionRTL)
			return next(
				new CustomError(
					422,
					42201,
					'color, logo and textDirectionRTL should exist',
				),
			);
		teacher.application = {};
	}

	if (color !== undefined) teacher.application.color = color;
	if (textDirectionRTL !== undefined)
		teacher.application.textDirectionRTL = textDirectionRTL;

	if (logo !== undefined) {
		const newPath = await wasabiService.moveFile(
			logo,
			`${wasabiFolders.teacher}/${teacherId}/${fileTypes.applicationLogo}`,
		);

		teacher.application.logo = newPath;
	}

	await saveHandler(teacher, req.user.id, req.user.userType);

	responseHandler(
		res,
		200,
		new ResponseBody(undefined, 'your app updated successfully'),
	);
});
