const { param } = require('express-validator');

exports.paramMongoId = [
	param('id').isMongoId().withMessage('should be mongo id'),
];
