const expressAsyncHandler = require('express-async-handler');
const {
	responseHandler,
	ResponseBody,
} = require('../handlers/response.handler');
const { CustomError } = require('../handlers/error.handler');
const wasabiService = require('../services/wasabi.service');
const { wasabiFolders } = require('../../config/constants');

exports.uploadFile = expressAsyncHandler(async (req, res, next) => {
	const userId = req.user.id;

	if (!req.file) {
		return next(new CustomError(422, 42201, 'No file uploaded'));
	}
	let file = await wasabiService.uploadFile(
		req.file,
		`${wasabiFolders.teacher}/${userId}/${wasabiFolders.draft}`,
	);

	responseHandler(res, 200, new ResponseBody({ file }));
});

exports.deleteFile = expressAsyncHandler(async (req, res) => {
	const { file } = req.body;

	await wasabiService.deleteFile(file);

	responseHandler(
		res,
		200,
		new ResponseBody(undefined, 'This file has been deleted'),
	);
});
