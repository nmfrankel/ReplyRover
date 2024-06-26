import { google } from '@ai-sdk/google';
import { type CoreMessage, generateText, GenerateTextResult } from 'ai';
import { helper } from './gpt/index';
import { directions } from './directions/index';
import { searchEntity } from './lookup/index';
import { news } from './news/index';
import { weather } from './weather/index';
import { zmanim } from './zmanim/index';

const tools = {
	directions,
	news,
	searchEntity,
	weather,
	zmanim,
	default: helper
};

export async function function_calling(thread: CoreMessage[]): Promise<[string, boolean, boolean]> {
	let result: GenerateTextResult<typeof tools>;
	let response = '';

	try {
		result = await generateText({
			model: google('models/gemini-1.0-pro'),
			messages: thread,
			maxTokens: 400,
			system: 'Keep answers short, max 3 sentences. If question is not within directions, news, directory assitance, weather or zmanim, then use "default" function. On "help", respond with sample queries.',
			tools
		});

		if (result.toolResults?.length) {
			const { toolName, args } = result.toolCalls[0];

			// tslint:disable-next-line:no-console
			console.log(toolName, args);

			if (!(toolName in tools)) {
				response = result.text;
				return [response, false, false];
			}

			response =
				typeof result.toolResults[0].result === 'string'
					? result.toolResults[0].result
					: result.toolResults[0].result.join();
		} else {
			response = result.text;
		}
	} catch (error) {
		response =
			'An error occured while processing your request. Please change your request and try again.';
	}

	return [response, false, false];
}

// msg = `here are services we offer: dictionary, weather, zmanim, news, company info fact checkup and help.
// Reply which one this sentence most closly matches, Alt reply 'help': What does the forecast say for tomorrow in 10977?`

// https://platform.openai.com/docs/assistants/tools/function-calling/quickstart?lang=node.js
