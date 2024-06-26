const multer = require('multer');
const { MulterError } = require('../handlers/error.handler');
const {
	fileAllowedExtensions,
	maxFileSize,
} = require('../../config/constants');

const storage = multer.diskStorage({
	filename: async function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const originalname = file.originalname;
		const filename =
			uniqueSuffix +
			'-' +
			originalname.toLowerCase().split(' ').join('-');

		cb(null, filename);
	},
});

const uploadMulter = multer({
	limits: {
		fileSize: maxFileSize,
	},
	fileFilter(req, file, cb) {
		const { type } = req.query;

		const fileExtension = file.originalname
			.toLowerCase()
			.slice(file.originalname.lastIndexOf('.'));

		if (fileAllowedExtensions.image.includes(fileExtension)) {
			cb(null, true);
		} else {
			cb(
				new MulterError(
					415,
					41500,
					`Invalid ${type} extension. Only ${fileAllowedExtensions.image.join(
						' or ',
					)} are allowed`,
				),
			);
		}
	},
	storage,
}).single('file');

exports.uploadimage = (req, res, next) => {
	uploadMulter(req, res, (err) => {
		if (err) {
			if (
				err instanceof multer.MulterError ||
				err instanceof MulterError
			) {
				if (err.code === 'LIMIT_FILE_SIZE') {
					return next(
						new MulterError(
							413,
							41300,
							`file size limit exceeded, max is ${
								maxFileSize / (1024 * 1024)
							} MB`,
						),
					);
				}
				return next(new MulterError(err.status, err.code, err.message));
			}
			return next(new MulterError(err.status, err.code, err.message));
		}
		next();
	});
};
