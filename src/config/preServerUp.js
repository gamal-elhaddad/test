const { saveHandler } = require('../api/handlers/save.handler');
const Admin = require('../api/models/admin.model');
const {
	DESAFE_SUPER_ADMIN_PASSWORD,
	DESAFE_SUPER_ADMIN_PHONE,
	DESAFE_SUPER_ADMIN_FULLNAME,
} = require('./env');

/**
 * @desc  create the admin doc when the server is up
 */
module.exports = async () => {
	const adminAcc = new Admin({
		phone: { number: DESAFE_SUPER_ADMIN_PHONE },
		password: DESAFE_SUPER_ADMIN_PASSWORD,
		fullName: DESAFE_SUPER_ADMIN_FULLNAME,
	});
	const admin = await Admin.findOne({
		'phone.number': adminAcc.phone.number,
	});

	if (!admin) {
		await saveHandler(adminAcc);
		// eslint-disable-next-line no-console
		console.log('admin has been created successfully 🎉');
	} else {
		// eslint-disable-next-line no-console
		console.log('admin already exists ✅');
	}
};
