import { getHelp } from './gpt';
import { getForcast } from './weather';
import { generateZmanim } from './zmanim';

const getCurrentWeatherFunctionDeclaration = {
	name: 'getCurrentWeather',
	description: 'Get the weather for a given location, with the option for a specified time.',
	parameters: {
		type: 'OBJECT',
		properties: {
			location: {
				type: 'STRING',
				description:
					'location to get the weather for. Can be a zip code, city, or other location identifier.'
			},
			days: {
				type: 'INTEGER',
				description: 'Number of days to get the forecast for.'
			}
		},
		required: ['location']
	}
};

const getZmanimFunctionDeclaration = {
	name: 'getZmanim',
	description: 'Get zmanim for a given location, with the option for a specified time.',
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

const defaultFunctionDeclaration = {
	name: 'default',
	description: 'Answer general questions or run as default function call.',
	parameters: {
		type: 'OBJECT',
		properties: {
			prompt: {
				type: 'STRING',
				description: 'return the input string.'
			}
		},
		required: ['prompt']
	}
};

export const functionDeclarations = [
	getCurrentWeatherFunctionDeclaration,
	getZmanimFunctionDeclaration,
	defaultFunctionDeclaration
];

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
export const functions = {
	getCurrentWeather: ({ location, days }) => {
		return getForcast(location, days);
	},
	// getWeatherForcast: ({ location, days }) => {
	// 	return false;
	// },
	getZmanim: ({ location }) => {
		return generateZmanim(location);
	},
	// getNews: ({ topic, filters }) => {
	// 	return false;
	// },
	// searchEntity: ({ entity }) => {
	// 	return entitySearch(entity);
	// },
	// entityLookup: ({ entity }) => {
	// 	return entitySearch(entity);
	// },
	// getDirections: ({ from, to }) => {
	// 	return false;
	// },
	default: ({ prompt }) => {
		return getHelp(prompt);
	}
};
