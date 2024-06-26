const mongoose = require('mongoose');
const { timelineStatus } = require('../../config/constants');

const Timeline = new mongoose.Schema(
	{
		action: {
			type: String,
			enum: Object.values(timelineStatus),
			required: true,
		},
		by: {
			type: {
				user: mongoose.Schema.Types.ObjectId,
				model: {
					type: String,
					required: function () {
						this.user !== undefined;
					},
				},
				_id: false,
			},
		},
		at: {
			type: Date,
			immutable: true,
			default: function () {
				return new Date();
			},
		},
	},
	{
		_id: false,
	},
);

module.exports = Timeline;
