const mongoose = require('mongoose');
const { arrayLengthBetweenRange } = require('../handlers/functions.handler');
const Timeline = require('./timeline.model');
const { generalPlugin } = require('./plugins');
const { CustomError } = require('../handlers/error.handler');
const { deleteFile } = require('../services/wasabi.service');

const Course = new mongoose.Schema({
	categories: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'category',
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'teacher',
		required: true,
		immutable: true,
	},
	name: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	sections: {
		type: [mongoose.Schema.Types.ObjectId],
		ref: 'section',
	},
	price: {
		type: Number,
		required: true,
	},
	discountedPrice: {
		type: Number,
	},
	hidden: {
		type: Boolean,
		default: false,
		required: true,
	},
	archived: {
		type: Boolean,
		default: false,
		required: true,
	},
	goals: {
		type: [String],
	},
	timeline: {
		type: [Timeline],
		required: true,
		validate: {
			validator: (timeline) => arrayLengthBetweenRange(timeline, 1),
			message: 'Timeline in course should not be empty',
		},
	},
});

Course.path('image').set(function (newValue) {
	this.oldImage = this.image;
	return newValue;
});

Course.pre('validate', async function (next) {
	if (!this.isNew) {
		if (this.isModified('image') && this.oldImage) {
			await deleteFile(this.oldImage);
		}
	}
	next();
});

Course.pre('save', async function (next) {
	if (this.isNew || this.isModified('teacher')) {
		const Teacher = mongoose.model('teacher');
		const teacher = await Teacher.findById(this.teacher);

		if (!teacher) {
			return next(
				new CustomError(404, 40401, 'Teacher Id is Incorrect '),
			);
		}
	}

	if (
		this.categories.length &&
		(this.isNew || this.isModified('categories'))
	) {
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

	if (this.sections.length && this.isModified('sections')) {
		const Section = mongoose.model('section');
		const sections = await Section.find({
			_id: { $in: this.sections },
		});

		if (sections.length !== this.sections.length) {
			return next(
				new CustomError(404, 40401, 'There is Incorrect section Id'),
			);
		}
	}

	next();
});

Course.plugin(generalPlugin);

module.exports = mongoose.model('course', Course);
