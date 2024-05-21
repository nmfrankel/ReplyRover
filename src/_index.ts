import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { closeDB, logger, queRemindGate } from './utils.js';

import { getDefinition } from './functions/definition/index.js';
import { fetchDirections } from './functions/directions/index.js';
import { entitySearch } from './functions/lookup/index.js';
// import { fetchNews } from './functions/news/index.js'
import { getForcast } from './functions/weather/index.js';
import { generateZmanim } from './functions/zmanim/index.js';
import { getHelp } from './functions/bot/index.js';
// import { PrismaClient } from '@prisma/client'
// import * as fs from 'node:fs/promises';

const WELCOME_MSG = 'Welcome to ZmanimBot. Reply with a zipcode or city, state to get zmanim.';
const HELP_MSG = `Here's how our team can assist:
[Weather] Text 'weather' + zip code or city, state.
[Zmanim] Text 'zmanim' + your location.
[Directions] Text 'directions' + where you're leaving from 'to' your destination.
[Business Info] Text 'lookup' + business name + zip code or city, state.
[Word Definition] Text 'define' +  the word you'd like defined.`;

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
	res.send('Hello world!');
});

app.post('/', async (req, res) => {
	const { event, user_id, user_name, message } = req.body;

	const logged = await logger(event, user_id, user_name, message);
	// tslint:disable-next-line:no-console
	console.log(JSON.stringify(logged));

	if (event === 'new_user') {
		await new Promise((r) => setTimeout(r, 5000));
		await queRemindGate(user_id, WELCOME_MSG);
	}

	if (event !== 'message') return;

	const [command, prompt = ''] = message.toLowerCase().split(/\s+(.*)/);
	let clamp = true;
	let reply: string | string[];

	switch (command) {
		case 'answer':
			reply = await getHelp(prompt);
			break;

		case 'define':
			// reply = await getDefinition(prompt)
			reply = 'The define service has been blocked due false flagging issues.';
			break;

		case 'directions':
			clamp = false;
			// reply = await fetchDirections(prompt)
			reply = 'The directions service has been blocked due false flagging issues.';
			break;

		case 'help':
			reply = HELP_MSG;
			break;

		case 'lookup':
			// reply = await entitySearch(prompt)
			reply = 'The lookup service has been blocked due false flagging issues.';
			break;

		case 'news':
			reply = 'The news service has been blocked due false flagging issues.';
			break;

		case 'weather':
		case 'wether':
			reply = await getForcast(prompt);
			break;

		case 'zmanim':
		default:
			reply = await generateZmanim(prompt || message);
			break;
	}

	if (app.get('env') === 'production') {
		const remindGateReply = await queRemindGate(user_id, reply, clamp);
		await closeDB();
	}

	res.setHeader('content-type', 'text/plain');
	res.send(reply);
});

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`);
});
