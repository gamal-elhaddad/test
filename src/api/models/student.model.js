const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS } = require('../../config/env');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const { academiceYears } = require('../../config/constants');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');
const Device = require('./device.model');

const Enrollment = new mongoose.Schema(
	{
		devices: {
			type: [Device],
			required: true,
		},
		teacher: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'teacher',
			required: true,
		},
		courses: {
			type: [
				{
					courseId: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'course',
						required: true,
					},
					sections: {
						type: [
							{
								sectionId: {
									type: mongoose.Schema.Types.ObjectId,
									ref: 'section',
									required: true,
								},
								hidden: {
									type: Boolean,
									required: true,
									default: false,
								},
								_id: false,
							},
						],
						required: true,
						validate: {
							validator: (sections) =>
								arrayLengthBetweenRange(sections, 1),
							message:
								'sections in Courses in enrollment in student should not be empty',
						},
					},
					_id: false,
				},
			],
			required: true,
		},
		blocked: {
			type: Boolean,
			default: false,
			required: true,
		},
		enrollmentDate: {
			type: Date,
			required: true,
		},
		note: {
			type: String,
			trim: true,
		},
	},
	{
		_id: false,
	},
);

const Student = new mongoose.Schema({
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
		trim: true,
	},
	resetToken: { type: String, trim: true },
	signupToken: { type: String, trim: true },
	forgotPasswordToken: { type: String, trim: true },
	newPhone: { type: String, trim: true },
	devices: {
		type: [Device],
		required: true,
		validate: {
			validator: (devices) => arrayLengthBetweenRange(devices, 1),
			message: 'devices in student should not be empty',
		},
	},
	enrollments: [Enrollment],
	academiceYear: {
		type: String,
		trim: true,
		required: true,
		enum: Object.values(academiceYears),
	},
	dateOfBirth: {
		type: Date,
		required: true,
	},
	school: {
		type: String,
		trim: true,
	},
	enrollmentRequests: {
		type: [mongoose.Types.ObjectId],
		ref: 'enrollmentRequest',
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (Timeline) => arrayLengthBetweenRange(Timeline, 1),
			message: 'Timeline in student should not be empty',
		},
	},
});

Student.pre('save', async function (next) {
	if (this.isModified('password') && this.password) {
		this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
	}
	next();
});

Student.plugin(generalPlugin);

module.exports = mongoose.model('student', Student);
