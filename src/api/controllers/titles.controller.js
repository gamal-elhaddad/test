const expressAsyncHandler = require('express-async-handler');
const Title = require('../models/title.model');
// const Teacher = require('../models/teacher.model');

const {
	ResponseBody,
	responseHandler,
} = require('../handlers/response.handler');
const { userTypes } = require('../../config/constants');

exports.titlesList = expressAsyncHandler(async (req, res) => {
	let query = {},
		select;
	let { gender } = req.query;

	if (req.user.userType == userTypes.visitor) {
		query.hidden = false;
		select = 'name abbreviation';
		// } else if (req.user.userType == userTypes.teacher) {
		// 	const teacher = await Teacher.findById(req.user.id).select('title');

		// 	query = { $or: [{ hidden: false }, { _id: teacher.title ? teacher.title : { $exists: true } }] };
		// 	select = 'name abbreviation';
		// } else {
		// 	//admin
		// 	hidden && (query = { ...query, hidden });
		// 	select = 'name abbriviation gender hidden';
	}
	gender && (query = { ...query, gender });

	const titles = await Title.find(query).select(select);

	responseHandler(
		res,
		200,
		new ResponseBody({
			titles,
		}),
	);
});
