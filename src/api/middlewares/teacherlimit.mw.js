const expressAsyncHandler = require('express-async-handler');
const Teacher = require('../models/teacher.model');
const Course = require('../models/course.model');
const { CustomError } = require('../handlers/error.handler');

exports.teacherLimit = expressAsyncHandler(async (req, res, next) => {
	const teacherId = req.user.id;

	const teacherlimit =
		await Teacher.findById(teacherId).select('-_id plan.courses');
	const teacherCourses = await Course.countDocuments({ teacher: teacherId });

	if (teacherCourses && teacherlimit.plan.courses === teacherCourses) {
		return next(
			new CustomError(
				403,
				40321,
				`You have reached the maximum number of courses in your plan: ${teacherlimit.plan.courses} `,
			),
		);
	}

	next();
});
