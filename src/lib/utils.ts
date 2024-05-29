import { DateTime } from 'luxon';
import { signalwire } from './signalwire';

interface GeoCode extends Coordinates {
	formatted_address: string;
}

interface Coordinates {
	lat: number;
	lng: number;
}

/**
 * Fetches the geocode information for a given location.
 * @param location - The location to geocode.
 * @param region - The region to search in. Defaults to 'us'.
 * @returns A tuple containing the formatted address of the location if found, otherwise an error message.
 * @example
 * const [error, geoLocation] = await geocode('New York');
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(geoLocation);
 * }
 */
export async function geocode(
	location: string,
	region = 'us'
): Promise<[string | null, GeoCode | null]> {
	location = location.replace(/la?ke?wo?o?d/i, 'Lakewood, NJ');

	const baseURL = 'https://maps.googleapis.com/maps/api';
	const endpoint = `${baseURL}/geocode/json?
	address=${location}&
	region=${region}&
	key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`;

	try {
		const response = await fetch(endpoint);
		if (!response.ok) {
			throw new Error('An error occurred while searching your requested location.');
		}

		const geocodeResponse = await response.json();

		const coordinates = geocodeResponse.results[0]?.geometry.location as Coordinates;
		const formattedAddress = geocodeResponse.results[0]?.formatted_address as string;

		if (!coordinates || !formattedAddress) {
			throw new Error(`No matching locations were found for ${location}.`);
		}

		const geoLocation = {
			formatted_address: formattedAddress,
			...coordinates
		} as GeoCode;

		return [null, geoLocation];
	} catch (error) {
		return [error.message, null];
	}
}

/**
 * Formats a timestamp into a string representation of the date.
 * If the timestamp is null, returns 'N/A'.
 * The formatted date string is in the format 'DayOfWeek Month/Day'.
 *
 * @param timestamp - The timestamp to format. Both a luxon DateTime or JavaScript Date objects are valid.
 * @param timezoneId - The timezone identifier to use for converting DateTime objects. Defaults to 'Eastern Standard Time'.
 * @returns The formatted date string.
 * @example
 * const timestamp = new Date();
 * const formattedDate = formatDate(timestamp);
 * console.log(formattedDate); // e.g. "Mon 10/25"
 */
export function formatDate(
	timestamp: Date | DateTime | null,
	timezoneId: string = 'Eastern Standard Time'
) {
	if (!timestamp) {
		return 'N/A';
	} else if (timestamp.toJSDate instanceof Function) {
		timestamp = timestamp.setZone(timezoneId).toJSDate();
	}

	const dayOfWeek = timestamp.toLocaleString('en-us', { weekday: 'short' });
	const month = timestamp.getMonth() + 1;
	const day = timestamp.getDate().toString().padStart(2, '0');

	return `${dayOfWeek} ${month}/${day}`;
}

/**
 * Queues messages for sending via Signalwire.
 * @param endpoint - The Signalwire endpoint to send the messages to.
 * @param payload - The message or array of messages to send.
 * @param clamp - Whether to clamp each message to a maximum character limit. Defaults to true.
 * @returns An array of promises representing the sent messages.
 * @example
 * const messages = ['Hello', 'World'];
 * const sentMessages = await que_messages('+17182531293', messages);
 */
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
