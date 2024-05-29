import { SignalWire } from '@signalwire/realtime-api';
import { db } from './db';

export async function signalwire(
	recipient: string,
	body: string,
	sender: string = process.env.SIGNALWIRE_PHONE_NUMBER
) {
	const client = await SignalWire({
		project: process.env.SIGNALWIRE_PROJECT_ID,
		token: process.env.SIGNALWIRE_TOKEN
	});

	await db.event.create({
		data: {
			endpointID: recipient,
			action: 'response',
			content: body,
			system: sender
		}
	});

	try {
		return await client.messaging.send({
			from: sender,
			to: recipient,
			body
		});
	} catch (e) {
		// tslint:disable-next-line:no-console
		console.error(e.message);
	}
}
