import { HarmBlockThreshold, HarmCategory, GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const generationConfig = {
	stopSequences: ['_'],
	maxOutputTokens: 200,
	temperature: 0.9,
	topP: 0.1,
	topK: 16
};

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

export const getHelp = async (msg: string) => {
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
	const model = genAI.getGenerativeModel({
		model: 'gemini-1.0-pro',
		generationConfig,
		safetySettings
	});

	const { totalTokens } = await model.countTokens(msg);
	if (totalTokens > 2048) return 'Message is too long. Please keep it under 2048 tokens.';

	const prompt = 'limit answer to 3 full sentences:' + msg;
	let response = '';

	try {
		const result = await model.generateContent(prompt);
		response = result.response.text();
	} catch (error) {
		response = error.message;
	}

	return response;
};

export const helper = {
	descirption:
		'This tool can provide provide for anything not under directions, news, searchEntity, weather or zmanim.',
	parameters: z.object({
		prompt: z.string().optional().describe('pass original input string.')
	}),
	execute: async ({ prompt }: any) => await getHelp(prompt)
	// execute: async (data) => console.log('default tool', data)
};
