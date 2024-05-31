import { z } from 'zod';
import type { DirectionResponse, TripInfoType } from './types';
import { geocode } from '../../lib/utils';

// https://developers.google.com/maps/documentation/directions/get-directions

// tslint:disable-next-line:variable-name
const cleanHTML = (string: string) => {
	return string
		.replace(/<\/?(b|wbr)\/?>/g, '')
		.replace(/<[\w\s]+.*?>/g, '\n-  ')
		.replace(/<\/[\w\s]+.*?>/g, '');
};

const formatStep = (step: TripInfoType['steps'][0], stepNumber: number) => {
	const instructions = cleanHTML(step.html_instructions);
	const distance = step.distance.text;
	return `\n\n${stepNumber}) ${instructions} [${distance}]`;
};

const baseURL = 'https://maps.googleapis.com/maps/api/directions/json';

export const fetchDirections = async (
	origin: string,
	destination: string,
	mode: string = 'driving'
) => {
	const endpoint = `${baseURL}?mode=${mode}&origin=${origin}&destination=${destination}&language=en-US&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`;

	if (!origin || !destination) {
		return `Text \'directions\' + where you're leaving from 'to' your destination.\nI.e. directions from 433 S Pascack Rd to Evergreen Kosher, 10952`;
	}

	const response = await fetch(endpoint);
	const options: DirectionResponse = await response.json();
	let tripInfo: TripInfoType;
	let steps: TripInfoType['steps'] = [];

	try {
		tripInfo = options.routes[0].legs[0];
		steps = options.routes[0].legs[0].steps;
	} catch (err) {
		const [originError, originGeocode] = await geocode(origin);
		const [destinationError, destinationGeocode] = await geocode(destination);

		if (originError || !originGeocode.formatted_address) {
			return `I couldn't find '${origin}'. Where are you leaving from?`;
		} else if (destinationError || !destinationGeocode) {
			return `I couldn't find '${destination}'. Where are you going to?`;
		} else {
			return `An error occured while searching for a ${mode} route based on your given input [${origin} - ${destination}]. Text directions [where you're leaving from] to [your destination].\nI.e. directions from 433 S Pascack Rd to Evergreen Kosher, 10952`;
		}
	}

	const formattedDirections = [
		`Directions for ${tripInfo.start_address} to ${tripInfo.end_address}\n${steps.length} steps | ${tripInfo.duration.text} | ${tripInfo.distance.text}`
	];
	formattedDirections.push(steps.map((step, i) => formatStep(step, i + 1)).join(''));

	return formattedDirections;
};

export const directions = {
	descirption: 'This tool is for directions from between two locations.',
	parameters: z.object({
		origin: z.string().describe('Departing location, address or landmark.'),
		destination: z.string().describe('Destination location, address or landmark.'),
		mode: z
			.enum(['driving', 'walking', 'bicycling', 'transit'])
			.describe('The mode of travel, If not explictly defined, return driving.')
			.optional()
	}),
	execute: async ({ origin, destination, mode }: any) =>
		await fetchDirections(origin, destination, mode)
};
