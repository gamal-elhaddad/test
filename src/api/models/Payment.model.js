const mongoose = require('mongoose');
const {
	paymentTypes,
	paymentMethodTypes,
	collectingMethodTypes,
} = require('../../config/constants');

const Payment = new mongoose.Schema(
	{
		through: {
			type: String,
			enum: Object.values(paymentTypes),
			default: paymentTypes.external,
			required: true,
		},
		paymentMethod: {
			type: String,
			enum: Object.values(paymentMethodTypes),
			required: function () {
				this.through === paymentTypes.system;
			},
		},
		collectingMethod: {
			type: String,
			enum: Object.values(collectingMethodTypes),
			required: function () {
				this.through === paymentTypes.system;
			},
		},
		paidAmount: {
			type: Number,
			required: true,
		},
		proof: {
			type: String,
			required: function () {
				this.payment === paymentTypes.external;
			},
		},
	},
	{
		_id: false,
	},
);

module.exports = Payment;
