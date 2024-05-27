import express from 'express';
import { function_calling } from '../../functions/index';
import { event_logger, que_messages } from '../utils';

const router = express.Router();
const HELP_MSG = `I'm ready to assist you with whatever you would like.`;

router.get('/error', async (req, res) => {
	const XML_ERROR = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Our server seems to have a glitch, try again later.</Message></Response>`;

	res.setHeader('content-type', 'application/xml');
	res.send(XML_ERROR);
});

router.post('/', async (req, res) => {
	const { From, To, Body: body } = req.body;

	const logged = await event_logger('message', From, 'N/A', body);
	// tslint:disable-next-line:no-console
	console.log(`[SYSTEM] message from ${From} logged [${logged.id}]`);

	const [reply, clamp, completed] = await function_calling(body);

	if (process.env.NODE_ENV === 'production') {
		await que_messages(From, reply, clamp);
	}

	res.setHeader('content-type', 'application/xml');
	res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
});

export default router;
