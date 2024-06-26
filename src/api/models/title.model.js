const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const { gender } = require('../../config/constants');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');

const Title = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	abbreviation: {
		type: String,
		required: true,
		trim: true,
	},
	gender: {
		type: String,
		enum: Object.values(gender),
		required: true,
	},
	hidden: {
		type: Boolean,
		required: true,
		default: false,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in title should not be empty',
		},
	},
});

Title.plugin(generalPlugin);

module.exports = mongoose.model('title', Title);
