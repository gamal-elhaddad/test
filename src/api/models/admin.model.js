const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../../config/env');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const { generalPlugin } = require('./plugins');
const Timeline = require('./timeline.model');
const Device = require('./device.model');

const Admin = new mongoose.Schema({
	fullName: {
		type: String,
		required: true,
		trim: true,
	},
	phone: {
		type: {
			number: {
				type: String,
				trim: true,
				required: true,
			},
			verified: {
				type: Boolean,
				default: false,
				required: true,
			},
			verificationSID: {
				type: String,
				trim: true,
				required: function () {
					return this.verified;
				},
			},
			_id: false,
		},
		required: true,
	},
	email: {
		type: {
			address: {
				type: String,
				trim: true,
				required: true,
			},
			verified: {
				type: Boolean,
				default: false,
				required: true,
			},
			verificationId: {
				type: String,
				trim: true,
				required: function () {
					return this.verified;
				},
			},
			_id: false,
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
	},
	resetToken: { type: String, trim: true },
	newPhone: { type: String, trim: true },
	devices: {
		type: [Device],
	},
	blocked: {
		type: Boolean,
		required: true,
		default: false,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in admin should not be empty',
		},
	},
});

Admin.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
	}
	next();
});

Admin.plugin(generalPlugin);

module.exports = mongoose.model('admin', Admin);
