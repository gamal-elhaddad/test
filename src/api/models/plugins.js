const { timelineStatus } = require('../../config/constants');

exports.generalPlugin = (schema) => {
	schema.pre('validate', async function (next) {
		let timelineObj = {};

		if (this.userType && this.userId) {
			timelineObj.by = { user: this.userId, model: this.userType };
		}

		if (!this.isNew) {
			if (this.hidden) {
				timelineObj.action = this.isModified('hidden')
					? timelineStatus.hidden
					: timelineStatus.updated;
			} else {
				timelineObj.action = this.isModified('hidden')
					? timelineStatus.showen
					: timelineStatus.updated;
			}
			if (this.blocked) {
				timelineObj.action = this.isModified('blocked')
					? timelineStatus.blocked
					: timelineStatus.updated;
			} else {
				timelineObj.action = this.isModified('blocked')
					? timelineStatus.unblocked
					: timelineStatus.updated;
			}
		} else {
			timelineObj.action = timelineStatus.created;
		}
		this.timeline.push(timelineObj);
		next();
	});
	schema.set('toJSON', {
		...schema.options.toJSON,
		versionKey: false,
		transform: (doc, ret) => {
			ret.id = ret._id;
			delete ret._id;
		},
	});
};
