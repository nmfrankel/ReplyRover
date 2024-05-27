import express from 'express';
import { function_calling } from '../../functions/index';
import { signalwire } from '$lib/signalwire';

const router = express.Router();

router.use(async (req, _, next) => {
	if (process.env.NODE_ENV !== 'production') {
		next();
		return;
	}

	const { From: endpoint, To: system_endpoint, Body: body } = req.body;

	const isNewUser = await db.user.findFirst({
		where: {
			endpoint
		}
	});
	const event = isNewUser ? 'message' : 'new_user';

	const loggedEvent = db.event.create({
		data: {
			user: {
				connect: {
					endpoint
				}
			},
			action: event,
			body,
			system_endpoint
		}
	});

	// tslint:disable-next-line:no-console
	console.log(`[SYSTEM] message from ${endpoint} logged [${loggedEvent.id}]`);

	if (event === 'new_user' && HELP_MSG.length > 4) {
		const HELP_MSG = `I'm ready to assist you with whatever you would like.`;

		await new Promise((r) => setTimeout(r, 5000));
		await signalwire(endpoint, HELP_MSG, system_endpoint);
	} else if (event !== 'message') {
		next();
		return;
	}

	next();
});

router.get('/error', async (req, res) => {
	const XML_ERROR = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Our server seems to have a glitched, try again later.</Message></Response>`;

	res.setHeader('content-type', 'application/xml');
	res.send(XML_ERROR);
});

router.post('/', async (req, res) => {
	const { From: endpoint, To: system_endpoint, Body: body } = req.body;

	const [reply, clamp, completed] = await function_calling(body);

	if (process.env.NODE_ENV === 'production') {
		await db.event.create({
			data: {
				userID: 'assistant',
				action: 'response',
				body: reply,
				system_endpoint,
				completed
			}
		});
	}

	res.setHeader('content-type', 'application/xml');
	res.send(`<?xml version="1.0" encoding="UTF-8"?>
	<Response><Message>${reply}</Message></Response>`);
});

export default router;
