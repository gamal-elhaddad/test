const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../../config/env');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const { gender, planTypes } = require('../../config/constants');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');
const Device = require('./device.model');
const GeneralPermission = require('./generalPermission.model');
const { CustomError } = require('../handlers/error.handler');
const { deleteFile } = require('../services/wasabi.service');

const Plan = new mongoose.Schema(
	{
		payment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'subscriptionRequest',
			required: function () {
				return this.type != planTypes.free;
			},
		},
		planId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'plan',
			required: true,
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
		type: {
			type: String,
			enum: Object.values(planTypes),
			required: true,
		},
		subscriptionStart: {
			type: Date,
			required: true,
		},
		subscriptionEnd: {
			type: Date,
			required: function () {
				return this.type != planTypes.free;
			},
		},
	},
	{
		_id: false,
	},
);

const Application = new mongoose.Schema(
	{
		color: {
			type: String,
			required: true,
		},
		logo: {
			type: String,
			trim: true,
			required: true,
		},
		textDirectionRTL: {
			type: Boolean,
			required: true,
		},
		permissions: {
			type: GeneralPermission,
			required: true,
			default: function () {
				return {
					website: true,
					mobileApp: false,
					noOfDevices: 5,
					studentNameOnVideo: false,
					studentNameAsAudio: false,
					mobileAppPermissions: {
						screenshot: false,
						screenRecord: false,
					},
				};
			},
		},
	},
	{
		_id: false,
	},
);

const Teacher = new mongoose.Schema({
	title: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'title',
		trim: true,
	},
	gender: {
		type: String,
		enum: Object.values(gender),
		required: true,
	},
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
		required: true,
	},
	password: {
		type: String,
		required: true,
		trim: true,
	},
	resetToken: { type: String, trim: true },
	signupToken: { type: String, trim: true },
	forgotPasswordToken: { type: String, trim: true },
	newPhone: { type: String, trim: true },
	devices: {
		type: [Device],
	},
	blocked: {
		type: Boolean,
		required: true,
		default: false,
	},
	image: {
		type: String,
		trim: true,
	},
	plan: {
		type: Plan,
	},
	availableStorageInGB: {
		type: {
			total: {
				type: Number,
				required: true,
			},
			notOccupied: {
				type: Number,
				required: true,
			},
			_id: false,
		},
	},
	application: Application,
	socialMediaContacts: {
		type: {
			whatsapp: {
				type: String,
				required: true,
			},
			facebook: {
				type: String,
			},
			instagram: {
				type: String,
			},
			X: {
				type: String,
			},
			_id: false,
		},
	},
	categories: {
		type: [mongoose.Types.ObjectId],
		ref: 'category',
	},
	brief: {
		type: String,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in teacher should not be empty',
		},
	},
});

Teacher.path('image').set(function (newValue) {
	this.oldImage = this.image;
	return newValue;
});

Teacher.path('application.logo').set(function (newValue) {
	this.oldApplicationLogo = this.logo;
	return newValue;
});

Teacher.pre('validate', async function (next) {
	if (!this.isNew) {
		if (this.isModified('image') && this.oldImage) {
			await deleteFile(this.oldImage);
		}
		if (
			this.isModified('application.logo') &&
			this.application.oldApplicationLogo
		) {
			await deleteFile(this.application.oldApplicationLogo);
		}
	}
	next();
});

Teacher.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
	}

	if (this.categories && this.isModified('categories')) {
		const Category = mongoose.model('category');
		const categories = await Category.find({
			_id: { $in: this.categories },
		});

		if (categories.length !== this.categories.length) {
			return next(
				new CustomError(404, 40401, 'There is Incorrect category Id'),
			);
		}
	}
	next();
});

Teacher.plugin(generalPlugin);

module.exports = mongoose.model('teacher', Teacher);
