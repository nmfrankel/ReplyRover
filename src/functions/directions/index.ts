const basreURL = `https://maps.googleapis.com/maps/api/directions/json?destination=468%20E%209th%20St,%20Brooklyn,%20NY%2011218&origin=5815%2021st%20Ave,%20Brooklyn,%20NY%2011204&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`

// https://developers.google.com/maps/documentation/directions/get-directions
// https://developers.google.com/maps/documentation/places/web-service

interface HTMLinstructions {
    routes: {
        legs: {
            steps: {
                html_instructions: string;
            }[];
        }[];
    }[];
}

export const fetchDirections = (msg: string) => {

	const response: HTMLinstructions = {
		routes: [
			{
				legs: [
					{
						steps: [
							{
								html_instructions: ''
							}
						]
					}
				]
			}
		]
	}

	const steps = response.routes?.[0].legs?.[0].steps

	for (const step of steps) {
		console.log(step.html_instructions)
	}

	return ''
}
