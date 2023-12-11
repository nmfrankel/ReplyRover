// https://developers.google.com/maps/documentation/directions/get-directions

interface DirectionResponse {
	routes: {
		legs: {
			distance: {
				text: string
				value: number
			}
			duration: {
				text: string
				value: number
			}
			end_address: string
			start_address: string
			steps: {
				distance: {
					text: string
					value: number
				}
				duration: {
					text: string
					value: number
				}
				end_location: {
					lat: number
					lng: number
				}
				html_instructions: string
				travel_mode: string
			}[]
		}[]
	}[]
}

type TripInfoType = DirectionResponse['routes'][0]['legs'][0]

// tslint:disable-next-line:variable-name
const cleanHTML = (string: string) => {
	return string
		.replace(/<\/?(b|wbr)\/?>/g, '')
		.replace(/<[\w\s]+.*?>/g, '\n-  ')
		.replace(/<\/[\w\s]+.*?>/g, '')
}

const formatStep = (step: TripInfoType['steps'][0], stepNumber: number) => {
	const instructions = cleanHTML(step.html_instructions)
	const distance = step.distance.text
	return `\n\n${stepNumber}) ${instructions} [${distance}]`
}

const baseURL = 'https://maps.googleapis.com/maps/api/directions/json'

export const fetchDirections = async (msg: string) => {
	const modes = ['driving', 'walking', 'bicycling', 'transit']
	const mode = modes[0]
	const [origin, destination] = msg.replace('directions ', '').split(' to ')
	const endpoint = `${baseURL}?mode=${mode}&origin=${origin}&destination=${destination}&language=en-US&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`

	const response = await fetch(endpoint)
	const options: DirectionResponse = await response.json()
	let tripInfo: TripInfoType
	let steps: TripInfoType['steps'] = []

	try {
		tripInfo = options.routes[0].legs[0]
		steps = options.routes[0].legs[0].steps
	} catch (err) {
		return 'An error occured, we could not find a route for your given input at this time.'
	}

	let formattedDirections = [
		`Directions for ${tripInfo.start_address} to ${tripInfo.end_address}\n${steps.length} steps | ${tripInfo.duration.text} | ${tripInfo.distance.text}`
	]
	formattedDirections.push(steps.map((step, i) => formatStep(step, i + 1)).join(''))

	return formattedDirections
}
