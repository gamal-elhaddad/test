const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const {
	statesEnum,
	subscriptionRequestTypes,
	durationTypes,
} = require('../../config/constants');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');
const Payment = require('./Payment.model');

const SubscriptionRequest = new mongoose.Schema({
	type: {
		type: String,
		enum: Object.values(subscriptionRequestTypes),
		default: subscriptionRequestTypes.byAdmin,
		required: true,
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'teacher',
		required: true,
	},
	plan: {
		type: {
			planId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'plan',
				required: true,
			},
			price: {
				type: Number,
				required: true,
			},
			storage: {
				type: Number,
			},
			students: {
				type: Number,
			},
			courses: {
				type: Number,
			},
			characteristics: {
				type: [String],
			},
			_id: false,
		},
		required: true,
	},
	duration: {
		type: String,
		enum: Object.values(durationTypes),
		required: true,
	},
	promocode: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'promocode',
	},
	totalPrice: {
		type: Number,
		required: true,
	},
	status: {
		type: String,
		enum: Object.values(statesEnum),
		default: statesEnum.created,
		required: true,
	},
	installment: {
		type: Boolean,
		required: true,
	},
	subscriptionStart: {
		type: Date,
		required: true,
	},
	subscriptionEnd: {
		type: Date,
		required: true,
	},
	teacherNote: {
		type: String,
	},
	adminNote: {
		type: String,
	},
	payment: {
		type: Payment,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in subscription request should not be empty',
		},
	},
});

SubscriptionRequest.plugin(generalPlugin);

module.exports = mongoose.model('subscriptionRequest', SubscriptionRequest);
