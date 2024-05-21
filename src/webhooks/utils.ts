import { PrismaClient } from '@prisma/client';

declare global {
	var prisma: PrismaClient | undefined;
}

type Event = {
	id?: number;
	event?: string;
	userID?: string;
	username?: string;
	message?: string;
	timestamp?: Date;
};

let db: PrismaClient | undefined;

function initDB() {
	const prisma = global.prisma || new PrismaClient();
	if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
	return prisma;
}

export async function closeDB() {
	await db.$disconnect();
}

export async function event_logger(
	event: string,
	userID: string,
	username: string,
	message: string
): Promise<Event> {
	if (process.env.NODE_ENV !== 'production') return {};

	db = initDB();
	const entry = await db.log.create({
		data: {
			event,
			userID,
			username,
			message
		}
	});
	return entry;
}

export async function que_messages(
	endpoint: string,
	payload: string | string[],
	clamp = true
): any {
	const CHAR_LIMIT = 300;

	const msgs = typeof payload === 'string' ? [payload] : payload;
	const chunkRegex = new RegExp(`^[^\\n][\\s\\S]{0,${CHAR_LIMIT}}(?=\\n|$)`, clamp ? 'm' : 'gm');

	const msgChunks = msgs.flatMap((msg) => msg.match(chunkRegex) || []);
	const sent_messages = msgChunks.map(
		async (chunk, idx) => await sendViaRemindGate(endpoint, chunk, idx * 1500)
	);
	await closeDB();

	return sent_messages;
}

// The next two functions manage sending out messages
async function sendViaRemindGate(userID: any, message: string, delay = 0) {
	await event_logger('response', userID, '[SYSTEM]', message);
	await new Promise((r) => setTimeout(r, delay));

	const send = await fetch(`${process.env.HOST}/message/${userID}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			message,
			file: null,
			filename: null
		})
	});
	return send;
}
