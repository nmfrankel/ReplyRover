import { find } from 'geo-tz';
import * as KosherZmanim from 'kosher-zmanim';
import { DateTime } from 'luxon';
import { Zmanim, Zman } from './utils.js';
import { geocode, formatDate } from '../library.js';

export const generateZmanim = async (location: string) => {
	const [error, locationData] = await geocode(location);

	if (error) {
		return error;
	}

	const baseURL = 'https://maps.googleapis.com/maps/api';
	const endpoint = `${baseURL}/elevation/json?
	locations=${locationData.lat},${locationData.lng}&
	key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`;

	const elevationResponse = await fetch(endpoint);
	const elvRes = await elevationResponse.json();
	const elevation = elvRes.results[0].elevation;
	const timeZoneId = find(locationData.lat, locationData.lng)[0];

	// Init location for zmanim
	const geolocation = new KosherZmanim.GeoLocation(
		locationData.formatted_address,
		locationData.lat,
		locationData.lng,
		elevation,
		timeZoneId
	);
	const calendar = new KosherZmanim.ComplexZmanimCalendar(geolocation);
	const now: DateTime = DateTime.local().setZone(timeZoneId);
	const todaysZmanim = new Zmanim(calendar);
	const zmanimList: Zman[] = todaysZmanim.list();

	// Create the starting message
	let response = `\n${locationData.formatted_address}\n- ${formatDate(
		calendar.getAlos16Point1Degrees(),
		timeZoneId
	)} -\n`;

	let hasZmanimToday = false;
	// Loop through the zmanim
	for (const i of [...Array(zmanimList.length).keys()]) {
		// If the zman is in the past,
		if (zmanimList[i].time < now) {
			// If there are no more zmanim for today, skip
			if (i === zmanimList.length - 1) continue;
			// If the next zman is not in the future, skip
			if (zmanimList[i + 1].time < now) continue;
		}
		response = response.concat(zmanimList[i].toStr(timeZoneId) + '\n');
		hasZmanimToday = true;
	}

	// reset if no zmanim are returned for the first day
	if (!hasZmanimToday) response = locationData.formatted_address;

	// Add 1 day to the calendar
	calendar.setDate(calendar.getDate().plus({ days: 1 }));
	const tommorowsZmanim = new Zmanim(calendar);
	const tommorowsZmanimList: Zman[] = tommorowsZmanim.list();
	response += `\n- ${formatDate(calendar.getAlos16Point1Degrees(), timeZoneId)} -`;
	for (const i of [...Array(tommorowsZmanimList.length).keys()]) {
		response = response.concat('\n' + tommorowsZmanimList[i].toStr(timeZoneId));
	}

	return response;
};

export const functionDeclaration = {
	name: 'getZmanim',
	description: 'Get zmanim for a given location, with the optional day count.',
	parameters: {
		type: 'OBJECT',
		properties: {
			location: {
				type: 'STRING',
				description:
					'location to get the zmanim for. Can be a zip code, city, or other location identifier.'
			},
			days: {
				type: 'INTEGER',
				description: 'Number of days to get the forecast for.'
			}
		},
		required: ['location']
	}
};
