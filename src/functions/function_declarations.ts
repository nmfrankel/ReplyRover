import { functionDeclaration as defaultDeclaration, getHelp } from './gpt';
import { functionDeclaration as getCurrentWeatherDeclaration, getForcast } from './weather';
import { functionDeclaration as getZmanimDeclaration, generateZmanim } from './zmanim';

export const functionDeclarations = [
	getCurrentWeatherDeclaration,
	getZmanimDeclaration,
	defaultDeclaration
];

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
export const functions = {
	getCurrentWeather: ({ location, days }) => getForcast(location, days),
	// getWeatherForcast: ({ location, days }) => {
	// 	return false;
	// },
	getZmanim: ({ location }) => generateZmanim(location),
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
	getHelp: ({ prompt }) => getHelp(prompt)
};

// msg = `here are services we offer: dictionary, weather, zmanim, news, company info fact checkup and help.
// Reply which one this sentence most closly matches, Alt reply 'help': What does the forecast say for tomorrow in 10977?`

// https://platform.openai.com/docs/assistants/tools/function-calling/quickstart?lang=node.js
