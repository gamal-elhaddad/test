const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const dbConnect = require('./config/database.config');
const { PORT, NODE_ENV } = require('./config/env');
const preServerUp = require('./config/preServerUp');

const routes = require('./api/routes/index');

const app = express();

app.use(morgan('dev'));

app.use(cors());
app.use(express.json());

//end points
routes(app);

app.use((req, res) => {
	res.status(404).json({
		status: 404,
		code: 40400,
		error: 'API not found',
	});
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	let error;
	let details;

	err.status = err.status || 500;
	err.code = err.code || 50000;
	if (err.name == 'Twilio Error') {
		// eslint-disable-next-line no-unused-vars
		let { name, msg, status, ...otherDetails } = err;

		details = otherDetails;
	}
	switch (NODE_ENV) {
		case 'dev':
			error = `${err.name}: ${err.msg ? err.msg.dev : err.message}`;
			break;
		case 'pre-prod':
			error =
				err.msg && err.msg.prod
					? err.msg.prod
					: `${err.name}: ${err.msg ? err.msg.dev : err.message}`;
			break;
		default:
			// prod mode
			error =
				err.msg && err.msg.prod ? err.msg.prod : 'something went wrong';
			break;
	}
	res.status(err.status).json({
		status: err.status,
		code: err.code,
		error,
		details:
			NODE_ENV == 'dev' || NODE_ENV == 'pre-prod' ? details : undefined,
		// stack: NODE_ENV == 'dev' ? err.stack : undefined
	});
});

dbConnect()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Connected to MongoDB');
		await preServerUp();
		// eslint-disable-next-line no-console
		app.listen(PORT, () => console.log(`Listenning to port ${PORT}...`));
	})
	// eslint-disable-next-line no-console
	.catch((err) => console.log('Db Connection Error: ' + err));
