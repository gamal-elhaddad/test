const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const { statesEnum } = require('../../config/constants');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');
const { CustomError } = require('../handlers/error.handler');

const Category = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		trim: true,
		required: true,
	},
	color: {
		type: String,
		trim: true,
	},
	hidden: {
		type: Boolean,
		default: false,
		required: true,
	},
	archived: {
		type: Boolean,
		default: false,
		required: true,
	},
	status: {
		type: String,
		enum: Object.values(statesEnum),
		default: statesEnum.created,
		required: true,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (timeline) => arrayLengthBetweenRange(timeline, 1),
			message: 'Timeline in category should not be empty',
		},
	},
});

Category.plugin(generalPlugin);

Category.post('save', function (error, doc, next) {
	if (error) {
		let err = new CustomError(409, error.message);

		if (error.name === 'MongoServerError' && error.code === 11000) {
			// err.msg.prod = '🎨 ux error message';
			throw new CustomError(409, 'Category name already exists');
		}
		return next(err);
	}
	next();
});

Category.plugin(generalPlugin);

module.exports = mongoose.model('category', Category);
