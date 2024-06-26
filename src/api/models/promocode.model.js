const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');

const Promocode = new mongoose.Schema({
	code: {
		type: String,
		required: true,
		trim: true,
		immutable: true,
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'teacher',
		required: true,
		immutable: true,
	},
	users: {
		type: [
			{
				teacher: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'teacher',
					required: true,
				},
				usedAt: {
					type: Date,
					required: true,
				},
				_id: false,
			},
		],
	},
	discount: {
		type: Number,
		required: true,
		immutable: true,
	},
	active: {
		type: Boolean,
		required: true,
		default: true,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in promocode should not be empty',
		},
	},
});

Promocode.plugin(generalPlugin);

module.exports = mongoose.model('promocode', Promocode);
