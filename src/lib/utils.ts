import { signalwire } from './signalwire';

export async function que_messages(endpoint: string, payload: string | string[], clamp = true) {
	const CHAR_LIMIT = 1600; // 300;

	const msgs = typeof payload === 'string' ? [payload] : payload;
	const chunkRegex = new RegExp(`^[^\\n][\\s\\S]{0,${CHAR_LIMIT}}(?=\\n|$)`, clamp ? 'm' : 'gm');

	const msgChunks = msgs.flatMap((msg) => msg.match(chunkRegex) || []);
	const sentMessages = msgChunks.map(
		async (chunk, idx) => await sendViaSignalwire(endpoint, chunk, idx * 1500)
	);

	return sentMessages;
}

// The next two functions manage sending out messages
async function sendViaSignalwire(userID: any, message: string, delay = 0) {
	await new Promise((r) => setTimeout(r, delay));
	return await signalwire(userID, message);
}
