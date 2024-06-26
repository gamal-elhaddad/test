const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');

const Section = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	course: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'course',
		immutable: true,
	},
	price: {
		type: Number,
		required: true,
	},
	discountedPrice: {
		type: Number,
	},
	students: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'student',
	},
	lessons: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'lessons',
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in section should not be empty',
		},
	},
});

Section.plugin(generalPlugin);

module.exports = mongoose.model('section', Section);
