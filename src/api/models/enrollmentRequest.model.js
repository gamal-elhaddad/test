const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const { statesEnum } = require('../../config/constants');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');
const Payment = require('./Payment.model');

const EnrollmentRequest = new mongoose.Schema({
	student: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'student',
		required: true,
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'teacher',
		required: true,
	},
	course: {
		type: {
			courseId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'course',
				required: true,
			},
			sections: {
				type: [mongoose.Schema.Types.ObjectId],
				ref: 'section',
				required: true,
				validate: {
					validator: (sections) =>
						arrayLengthBetweenRange(sections, 1),
					message:
						'sections in Course in enrollment request should not be empty',
				},
			},
			_id: false,
		},
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	payment: {
		type: Payment,
		required: true,
	},
	studentNote: {
		type: String,
	},
	teacherNote: {
		type: String,
	},
	status: {
		type: String,
		enum: Object.values(statesEnum),
		default: statesEnum.sent,
		required: true,
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (timeline) => arrayLengthBetweenRange(timeline, 1),
			message: 'Timeline in enrollment request should not be empty',
		},
	},
});

EnrollmentRequest.plugin(generalPlugin);

module.exports = mongoose.model('enrollmentRequest', EnrollmentRequest);
