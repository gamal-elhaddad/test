const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const { statesEnum, planTypes } = require('../../config/constants');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');
const GeneralPermission = require('./generalPermission.model');

const Plan = new mongoose.Schema({
	logo: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	color: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: Object.values(planTypes),
		required: true,
		immutable: true,
	},
	monthlyPrice: {
		type: Number,
		required: function () {
			this.plan !== planTypes.free;
		},
	},
	monthlyDiscountedPrice: {
		type: Number,
	},
	duration: {
		type: {
			quarterly: {
				type: {
					hidden: {
						type: Boolean,
						default: false,
						required: true,
					},
					discountedPrice: {
						type: Number,
					},
					_id: false,
				},
				required: true,
			},
			semiAnnually: {
				type: {
					hidden: {
						type: Boolean,
						default: false,
						required: true,
					},
					discountedPrice: {
						type: Number,
					},
					_id: false,
				},
				required: true,
			},
			annually: {
				type: {
					hidden: {
						type: Boolean,
						default: false,
						required: true,
					},
					discountedPrice: {
						type: Number,
					},
					_id: false,
				},
				required: true,
			},
		},
		required: function () {
			this.plan !== planTypes.free;
		},
	},
	storage: {
		type: Number,
		required: true,
	},
	students: {
		type: Number,
		required: true,
	},
	courses: {
		type: Number,
		required: true,
	},
	characteristics: {
		type: [String],
	},
	status: {
		type: String,
		enum: Object.values(statesEnum),
		required: true,
	},
	hidden: {
		type: Boolean,
		default: false,
		required: true,
	},
	permissions: {
		type: GeneralPermission,
		required: true,
	},
	permissionsImmutableByTeacher: {
		type: Boolean,
		default: false,
		required: true,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in plan should not be empty',
		},
	},
});

Plan.plugin(generalPlugin);

module.exports = mongoose.model('plan', Plan);
