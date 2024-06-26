const { CustomError } = require('./error.handler');

const saveHandler = async (doc, userId, userType) => {
	if (!doc) {
		throw new CustomError(500, 50000, 'doc required');
	} else if ((!userId && userType) || (userId && !userType)) {
		throw new CustomError(
			500,
			50000,
			'userType & userId should return together',
		);
	} else if (!userId && !userType) {
		return await doc.save();
	} else {
		doc.userId = userId;
		doc.userType = userType;
		return await doc.save();
	}
};

module.exports = { saveHandler };
