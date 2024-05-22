import { HarmBlockThreshold, HarmCategory, GoogleGenerativeAI } from '@google/generative-ai';
import { functionDeclarations, functions } from './function_declarations';

const safetySettings = [
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
	}
];

export async function function_calling(prompt: string) {
	let clamp = true;
	let completed = false;

	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
	const model = genAI.getGenerativeModel({
		model: 'gemini-1.0-pro',
		safetySettings,
		tools: {
			functionDeclarations
		}
	});

	const { totalTokens } = await model.countTokens(prompt);
	if (totalTokens > 100) {
		console.log('Total tokens:', totalTokens);
		return 'Your message is too long. Please shorten and try again.';
	}

	const chat = model.startChat();
	const result = await chat.sendMessage(prompt);

	// For simplicity, this uses the first function call found.
	const call = result.response.functionCalls()?.[0];

	if (call) {
		// tslint:disable-next-line:no-console
		console.log(call.name, call.args);
		const message = await functions[call.name](call.args);

		return [message, clamp, completed];
	}

	const message = result.response.text();
	completed = false;

	return [message, clamp, completed];
}
