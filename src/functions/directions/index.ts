const baseURL = 'https://maps.googleapis.com/maps/api/directions/json'

// https://developers.google.com/maps/documentation/directions/get-directions

interface HTMLinstructions {
    routes: {
        legs: {
            steps: {
				distance: {
					text: string;
					value: number;
				};
				duration: {
					text: string;
					value: number;
				};
				end_location: {
					lat: number;
					lng: number;
				};
				html_instructions: string;
				travel_mode: string;
			}[]
        }[];
    }[];
}

const styleHtmlToText = (instruction: string) => {
	return instruction.replace(/<\/?b>/g, '**').replace('<wbr/>', '').replace(/<[\w\s]+.*?>/g, '\n- ').replace(/<\/[\w\s]+.*?>/g, '').replace('**/**', '/')
}

export const fetchDirections = async (msg: string) => {
	// const modes = ['driving', 'walking', 'bicycling', 'transit']
	const mode = 'driving'
	const origin = '1900 Ave M 11230'
	const destination = '326%20E%209th%20St,%20Brooklyn,%20NY%2011218'
	const endpoint = `${baseURL}?origin=${origin}&destination=${destination}&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`

	const res = await fetch(endpoint)
	const options = await res.json()
	const steps = options.routes?.[0].legs?.[0].steps

	let formattedDirections = ''
	for (const step of steps) {
		formattedDirections += styleHtmlToText(step.html_instructions) + '\n'
	}

	return formattedDirections.slice(0, -1)
}
