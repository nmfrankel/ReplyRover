import { HarmBlockThreshold, HarmCategory, GoogleGenerativeAI } from '@google/generative-ai';

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
	const result = await model.generateContent(prompt);
	const text = result.response.text();

	return text;
};

export const functionDeclaration = {
	name: 'default',
	description:
		'This function is a jack of all trades. Use as fallback to answer any question or specific task, if no other function call is found for the prompt.',
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
