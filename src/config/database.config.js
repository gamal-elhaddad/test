const mongoose = require('mongoose');
const { DB_URL } = require('../config/env');

module.exports = () => {
	mongoose.set('strictQuery', 'throw');
	return mongoose.connect(DB_URL);
};
