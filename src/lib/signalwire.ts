import { SignalWire } from '@signalwire/realtime-api';

export const client = await SignalWire({
	project: process.env.SIGNALWIRE_PROJECT_ID,
	token: process.env.SIGNALWIRE_TOKEN
});

export async function signalwire(endpoint: string, msg: string) {
	try {
		const sendResult = await client.messaging.send({
			from: process.env.SIGNALWIRE_PHONE_NUMBER,
			to: endpoint,
			body: msg
		});
	} catch (e) {
		// tslint:disable-next-line:no-console
		console.error(e.message);
	}
}
