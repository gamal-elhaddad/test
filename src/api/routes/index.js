const {
	responseHandler,
	ResponseBody,
} = require('../handlers/response.handler');
const uploadFileRoutes = require('./uploadfile.route');
const deleteFileRoutes = require('./deletefile.route');
const titlesRoutes = require('./titles.route');
const authRoutes = require('./auth.route');
const teachersRoutes = require('./teachers.route');
const categoriesRoutes = require('./categories.route');
const coursesRoutes = require('./courses.route');

const routes = (app) => {
	app.get('', (req, res) => {
		return responseHandler(
			res,
			200,
			new ResponseBody(undefined, 'Welcome to Desafe!'),
		);
	});
	app.use('', authRoutes);
	app.use('/upload-file', uploadFileRoutes);
	app.use('/delete-file', deleteFileRoutes);
	app.use('/titles', titlesRoutes);
	app.use('/categories', categoriesRoutes);
	app.use('/courses', coursesRoutes);
	app.use('/teachers', teachersRoutes);
};

module.exports = routes;
