const mongoose = require('mongoose');

const GeneralPermission = new mongoose.Schema(
	{
		website: {
			type: Boolean,
			required: true,
			default: true,
		},
		mobileApp: {
			type: Boolean,
			required: true,
			default: false,
		},
		noOfDevices: {
			type: Number,
			required: true,
			default: 5, //for example
		},
		studentNameOnVideo: {
			type: Boolean,
			required: true,
			default: false,
		},
		studentNameAsAudio: {
			type: Boolean,
			required: true,
			default: false,
		},
		mobileAppPermissions: {
			type: {
				screenshot: {
					type: Boolean,
					required: true,
					default: false,
				},
				screenRecord: {
					type: Boolean,
					required: true,
					default: false,
				},
				_id: false,
			},
		},
		_id: false,
	},
	{
		_id: false,
	},
);

module.exports = GeneralPermission;
