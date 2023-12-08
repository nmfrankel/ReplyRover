interface EntitySearch {
	places?: {
		nationalPhoneNumber: string;
		formattedAddress: string;
		regularOpeningHours: {
			openNow: boolean;
			periods: {
				open: {
					day: number;
					hour: number;
					minute: number;
				};
				close: {
					day: number;
					hour: number;
					minute: number;
				};
			}[];
			weekdayDescriptions: string[];
		};
		displayName: {
			text: string
			languageCode: string
		};
	}[];
}

const search = async (entity: string): Promise<EntitySearch> => {
	const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.regularOpeningHours",
			"X-Goog-Api-Key": process.env.GOOGLE_MAPS_PLATFORM_API_KEY
		},
		body: JSON.stringify({
			"textQuery": entity,
			"languageCode": 'en'
		})
	})
	return response.json()
}

const errorMsg = 'Start the message with "lookup" followed by the [company name], [city, state or zipcode].\nI.e. Lookup Beth Medrash Govoha, 08701'

export const entitySearch = async (msg: string) => {
	const entity = msg.replace(/lookup\s?/, '')

	if (entity.length < 2) return errorMsg

	const entities = await search(entity)

	if (!entities.places) return 'No lookup matches found.\n' + errorMsg

	const [place] = entities.places
	const cleanedAddress = place?.formattedAddress.replace(', ', '\n')

	let formattedEntities = `${place.displayName.text}\n${cleanedAddress}\n${place.nationalPhoneNumber}`

	// If hours are posted and not open 24/7
	if (place.regularOpeningHours?.periods.length > 1) {
		formattedEntities += '\n\nHours'

		// Reorder weekdays to start with Sunday
		let weekdays = [place.regularOpeningHours.weekdayDescriptions.pop()]
		weekdays = [...weekdays, ...place.regularOpeningHours.weekdayDescriptions]

		// shorten day name from Sunday -> Sun
		weekdays = weekdays.map((weekday: string) => weekday.replace(/^(\w{3}).*day:(.*)/, '$1:$2'))

		// Combine days with the same hours
		const mergedDays = weekdays.reduce((result, day) => {
			const [currentDay, schedule] = day.split(': ');
			const lastEntry = result[result.length - 1];

			if (lastEntry && lastEntry.schedule === schedule) {
				lastEntry.endDay = currentDay;
			} else {
				result.push({ startDay: currentDay, endDay: currentDay, schedule });
			}

			return result;
		}, []);

		formattedEntities += mergedDays.map(({ startDay, endDay, schedule }) => {
			if (startDay === endDay) {
				return `\n${startDay}: ${schedule}`;
			} else {
				return `\n${startDay} - ${endDay}: ${schedule}`;
			}
		}).join('')
	}

	return formattedEntities
}