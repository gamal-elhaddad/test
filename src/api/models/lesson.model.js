const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const Timeline = require('./timeline.model');
const { CustomError } = require('../handlers/error.handler');
const { generalPlugin } = require('./plugins');

const Lesson = new mongoose.Schema({
	section: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'section',
	},
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	video: {
		type: String,
	},
	pdf: {
		type: String,
	},
	hidden: {
		type: Boolean,
		default: false,
		required: true,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (timeline) => arrayLengthBetweenRange(timeline, 1),
			message: 'Timeline in lesson should not be empty',
		},
	},
});

Lesson.pre('validate', async function (next) {
	if (this.video && this.pdf) {
		return next(new CustomError(403, 'you should add video Or pdf'));
	}
	next();
});

Lesson.plugin(generalPlugin);

module.exports = mongoose.model('lesson', Lesson);
