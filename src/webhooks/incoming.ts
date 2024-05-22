import express from 'express';
import { function_calling } from '../functions';
import { event_logger, que_messages } from './utils';

const router = express.Router();
const HELP_MSG = `Here's how our team can assist:
[Weather] Text 'weather' + zip code or city, state.
[Zmanim] Text 'zmanim' + your location.
[Directions] Text 'directions' + where you're leaving from 'to' your destination.
[Business Info] Text 'lookup' + business name + zip code or city, state.
[Word Definition] Text 'define' +  the word you'd like defined.`;

router.post('/', async (req, res) => {
	const { event, user_id, user_name, message } = req.body;

	const logged = await event_logger(event, user_id, user_name, message);
	// tslint:disable-next-line:no-console
	console.log(`[SYSTEM] ${event} event logged [${logged.id}]`);

	if (event === 'new_user') {
		await new Promise((r) => setTimeout(r, 5000));
		await que_messages(user_id, HELP_MSG);
	} else if (event !== 'message') {
		return;
	}

	let [reply, clamp, completed] = await function_calling(message);

	if (process.env.NODE_ENV === 'production') {
		await que_messages(user_id, reply, clamp);
	}

	res.setHeader('content-type', 'text/plain');
	res.send(reply);
});

export default router;
