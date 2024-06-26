const { AWS_BUCKET_NAME, AWS_REGION } = require('./env');

exports.timelineStatus = {
	created: 'created',
	blocked: 'blocked',
	unblocked: 'unblocked',
	updated: 'updated',
	hidden: 'hidden',
	showen: 'showen',
};

exports.deviceTypes = {
	website: 'website',
	mobile: 'mobile',
};

exports.gender = {
	male: 'ذكر',
	female: 'أنثى',
};

exports.academiceYears = {
	grade1: 'الصف الأول',
	grade2: 'الصف الثاني',
	grade3: 'الصف الثالث',
	grade4: 'الصف الرابع',
	grade5: 'الصف الخامس',
	grade6: 'الصف السادس',
	grade7: 'الصف السابع',
	grade8: 'الصف الثامن',
	grade9: 'الصف التاسع',
	grade10: 'الصف العاشر',
	grade11: 'الصف الحادي عشر',
	grade12: 'الصف الثاني عشر',
	universitylevel1: 'المستوي الجامعي الاول',
	universitylevel2: 'المستوي الجامعي الثاني',
	universitylevel3: 'المستوي الجامعي الثالث',
	universitylevel4: 'المستوي الجامعي الرابع',
	universitylevel5: 'المستوي الجامعي الخامس',
	universitylevel6: 'المستوي الجامعي السادس',
	universitylevel7: 'المستوي الجامعي السابع',
};

exports.statesEnum = {
	created: 'created',
	cancelled: 'cancelled',
	rejected: 'rejected',
	pending: 'pending',
	sent: 'sent',
	accepted: 'accepted',
};

exports.paymentTypes = {
	external: 'external',
	system: 'system',
};

exports.paymentMethodTypes = {
	paymob: 'paymob',
	moyasar: 'moyasar',
	visa: 'visa',
};

exports.collectingMethodTypes = {
	depaxVodafoneCash: 'depax vodafone cash',
	depaxMasterCard: 'depax master card',
	momenNBE: 'momen NBE',
};

exports.subscriptionRequestTypes = {
	byAdmin: 'by admin',
	byTeacher: 'by teacher',
};

exports.durationTypes = {
	month: 'شهر',
	threeMonths: '3 شهور',
	sixMonths: '6 شهور',
	year: 'سنة',
};

exports.planTypes = {
	free: 'free',
	normal: 'normal',
	enterprise: 'enterprise',
};

exports.wasabiGeneralUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.wasabisys.com/`;

exports.maxFileSize = 2 * 1024 * 1024; // 2MB

exports.fileAllowedExtensions = {
	image: ['.png', '.jpeg', '.jpg'],
};

exports.fileTypes = {
	applicationLogo: 'applicationLogo',
	profileImage: 'profileImage',
	courseImage: 'courseImage',
	lessonPdf: 'lessonPdf',
	lessonVideo: 'lessonVideo',
	proofOfPayment: 'proofOfPayment',
};

exports.wasabiFolders = {
	teacher: 'teachers',
	student: 'students',
	draft: 'draft',
};

exports.imageUrlForTeacher = `^https://${AWS_BUCKET_NAME}.s3.wasabisys.com/teachers/(?:.*draft/)`;
exports.imageUrlForStudent = `^https://${AWS_BUCKET_NAME}.s3.wasabisys.com/students/(?:.*draft/)`;

exports.twilioVerificationStates = {
	pending: 'pending',
	approved: 'approved',
	canceled: 'canceled',
	max_attempts_reached: 'max_attempts_reached',
};

exports.applicationSettingsDataType = {
	settings: 'settings',
	permissions: 'permissions',
};

exports.phone_E164FormatRegex = /^\+[1-9]\d{1,14}$/;

exports.passwordValidationOptions = {
	minLength: 8,
	minNumbers: 1,
	minUppercase: 1,
	minLowercase: 1,
	minSymbols: 1,
};

exports.datePattern = /^\d{4}-\d{2}-\d{2}$/;

exports.userTypes = {
	admin: 'admin',
	teacher: 'teacher',
	student: 'student',
	visitor: 'visitor',
};

// eslint-disable-next-line
exports.hexacodePattern = /^\#[a-f0-9]{6}$/i;

exports.twilioVerificationChannels = {
	sms: 'sms',
	whatsapp: 'whatsapp',
};

exports.phone_E164FormatRegex = /^\+[1-9]\d{1,14}$/;
