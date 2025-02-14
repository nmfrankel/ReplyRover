import express from 'express';
import { type CoreMessage } from 'ai';
import { db } from '../../lib/db';
import { function_calling } from '../../functions/index';
import { signalwire } from '../../lib/signalwire';

import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// router.use('/', async (req, _, next) => {
// 	if (req.method !== 'POST') {
// 		next();
// 		return;
// 	}

// 	const { From: endpoint, To: systemEndpoint, Body: body } = req.body;

// 	const isNewUser = await db.endpoint.findFirst({
// 		where: {
// 			id: endpoint
// 		}
// 	});
// 	const event = isNewUser ? 'message' : 'new_user';

// 	const loggedEvent = await db.event.create({
// 		data: {
// 			endpoint: {
// 				connectOrCreate: {
// 					create: {
// 						id: endpoint,
// 						user: {
// 							create: {
// 								name: null
// 							}
// 						}
// 					},
// 					where: {
// 						id: endpoint
// 					}
// 				}
// 			},
// 			action: event,
// 			content: body,
// 			system: systemEndpoint
// 		}
// 	});

// 	// tslint:disable-next-line:no-console
// 	console.log(`[SYSTEM] message from ${endpoint} logged [${loggedEvent.id}]`);

// 	if (event === 'new_user' && body.length > 4) {
// 		const HELP_MSG = `I'm ready to assist you with whatever you would like.`;

// 		await new Promise((r) => setTimeout(r, 5000));
// 		await signalwire(endpoint, HELP_MSG, systemEndpoint);
// 	} else if (event !== 'message') {
// 		next();
// 		return;
// 	}

// 	next();
// });

router.get('/error', async (_, res) => {
	const XML_ERROR = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Our server seems to have a glitched, try again later.</Message></Response>`;

	res.setHeader('content-type', 'application/xml');
	res.send(XML_ERROR);
});

router.post('/gameshow', async (req, res) => {
	const supabase = createClient(
		process.env.PUBLIC_SUPABASE_URL,
		process.env.PUBLIC_SUPABASE_ANON_KEY
	);
	const { From: endpoint, To: systemEndpoint, Body: body } = req.body;

	const { error } = await supabase.from('vote').insert({ value: body, user: endpoint });

	// supabase.channel('votes').send({
	// 	type: 'broadcast',
	// 	event: 'incoming_vote',
	// 	payload: {
	// 		endpoint,
	// 		body
	// 	}
	// });

	res.setHeader('content-type', 'application/xml');
	res.send(`<?xml version="1.0" encoding="UTF-8"?>
	<Response><Message>Received</Message></Response>`);
});

router.post('/', async (req, res) => {
	const { From: endpoint, To: systemEndpoint } = req.body;

	const messages = await db.event.findMany({
		where: {
			endpointID: endpoint
		},
		take: 5,
		orderBy: {
			timestamp: 'desc'
		}
	});

	const thread = messages.reverse().map((m) => ({
		role: m.action === 'message' ? 'user' : 'assistant',
		content: m.content
	})) as CoreMessage[];

	const [reply, clamp, completed] = await function_calling(thread);

	if (process.env.NODE_ENV === 'production') {
		await db.event.create({
			data: {
				endpointID: endpoint,
				action: 'response',
				content: reply + (completed ? '[END]' : ''),
				system: systemEndpoint
			}
		});
	}

	res.setHeader('content-type', 'application/xml');
	res.send(`<?xml version="1.0" encoding="UTF-8"?>
	<Response><Message>${reply}</Message></Response>`);
});

export default router;
