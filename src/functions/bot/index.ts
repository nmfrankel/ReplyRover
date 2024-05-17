import { HarmBlockThreshold, HarmCategory, GoogleGenerativeAI } from '@google/generative-ai'
import { getForcast } from '../weather/index.js'

const generationConfig = {
	stopSequences: ['red'],
	maxOutputTokens: 200,
	temperature: 0.9,
	topP: 0.1,
	topK: 16
}

const safetySettings = [
	{
		category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
		threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
	},
	{
		category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
		threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
	}
]

// Function declaration, to pass to the model.
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
}

// Executable function code. Put it in a map keyed by the function name
// so that you can call it once you get the name string from the model.
const functions = {
	getCurrentWeather: ({ location, days }) => {
		return getForcast(location, days)
	}
}

export const getHelp = async (msg: string) => {
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
	const model = genAI.getGenerativeModel({
		model: 'gemini-1.0-pro',
		generationConfig,
		safetySettings,
		tools: {
			functionDeclarations: [getCurrentWeatherFunctionDeclaration]
		}
	})

	const { totalTokens } = await model.countTokens(msg)
	if (totalTokens > 2048) return 'Message is too long. Please keep it under 2048 tokens.'
	console.log('Total tokens:', totalTokens)

	const chat = model.startChat()
	const prompt = 'Only answer up to 2 sentence to:' + msg

	// Send the message to the model.
	const result = await chat.sendMessage(prompt)

	// For simplicity, this uses the first function call found.
	const call = result.response.functionCalls()?.[0]

	if (call) {
		// Call the executable function named in the function call
		// with the arguments specified in the function call and
		// let it call the hypothetical API.
		const apiResponse = await functions[call.name](call.args)
		console.log(call.name, call.args)
		console.log(apiResponse)

		return apiResponse

		// Send the API response back to the model so it can generate
		// a text response that can be displayed to the user.
		// const result2 = await chat.sendMessage([{
		// 	functionResponse: {
		// 		name: 'getWeatherResponse',
		// 		response: apiResponse
		// 	}
		// }]);

		// Log the text response.
		// console.log(result2.response.text());
	}

	// const result = await model.generateContent(prompt);
	const response = result.response
	const text = response.text()

	return text
}

// msg = `here are services we offer: dictionary, weather, zmanim, news, company info fact checkup and help.
// Reply which one this sentence most closly matches, Alt reply 'help': What does the forecast say for tomorrow in 10977?`
