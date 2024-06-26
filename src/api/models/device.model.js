const mongoose = require('mongoose');
const { deviceTypes } = require('../../config/constants');

const Devices = new mongoose.Schema(
	{
		loginToken: {
			type: String,
			trim: true,
		},
		deviceFingerprint: {
			type: String,
			required: true,
			immutable: true,
			trim: true,
		},
		deviceType: {
			type: String,
			enum: Object.values(deviceTypes),
			immutable: true,
			trim: true,
		},
	},
	{
		_id: false,
	},
);

module.exports = Devices;
