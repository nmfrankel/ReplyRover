import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
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
		threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
	}
];

export const getHelp = async (msg: string) => {
	// For debugging!
	// tslint:disable-next-line:no-console
	console.log('GPT processed request');

	const google = createGoogleGenerativeAI({
		headers: {
			safetySettings: JSON.stringify(safetySettings),
			generationConfig: JSON.stringify(generationConfig)
		}
	});

	try {
		const result = await generateText({
			model: google('models/gemini-1.0-pro'),
			prompt: msg,
			maxTokens: 350,
			system: 'Keep answers short, max 3 sentences.'
		});

		return result.text;
	} catch (error) {
		return `I cannot fulfill your request. ${error.message}.`;
	}
};

export const helper = {
	descirption:
		'This tool can provide provide for anything not under directions, news, searchBusinessEntity, weather or zmanim.',
	parameters: z.object({
		prompt: z.string().optional().describe('pass original input string.')
	}),
	execute: async ({ prompt }: any) => await getHelp(prompt)
};
