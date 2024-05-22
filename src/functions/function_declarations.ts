import { functionDeclaration as getDirectionsDeclaration, fetchDirections } from './directions';
import { functionDeclaration as defaultDeclaration, getHelp } from './gpt';
import { functionDeclaration as searchEntityDeclaration, entitySearch } from './lookup';
import { functionDeclaration as getNewsDeclaration, fetchNews } from './news';
import {
	getCurrent,
	functionDeclaration as getCurrentWeatherDeclaration,
	getForcast
} from './weather';
import { functionDeclaration as getZmanimDeclaration, generateZmanim } from './zmanim';

interface Params {
	[key: string]: string;
}

export const functionDeclarations = [
	getDirectionsDeclaration,
	searchEntityDeclaration,
	getNewsDeclaration,
	getCurrentWeatherDeclaration,
	getZmanimDeclaration,
	defaultDeclaration
];

export const functions = {
	getDirections: ({ origin, destination }: Params) => fetchDirections(origin, destination),
	searchEntity: ({ entity }: Params) => entitySearch(entity),
	getNews: ({ topic, filters }: Params) => fetchNews(`${topic}%20${filters}`),
	getWeather: ({ location, days }: { location: string; days: number }) =>
		days === 1 ? getCurrent(location, days) : getForcast(location, days),
	getZmanim: ({ location }: Params) => generateZmanim(location),
	getHelp: ({ prompt }: Params) => getHelp(prompt)
};

// msg = `here are services we offer: dictionary, weather, zmanim, news, company info fact checkup and help.
// Reply which one this sentence most closly matches, Alt reply 'help': What does the forecast say for tomorrow in 10977?`

// https://platform.openai.com/docs/assistants/tools/function-calling/quickstart?lang=node.js
