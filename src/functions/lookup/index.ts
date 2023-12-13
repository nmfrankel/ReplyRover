import type { Place, EntitySearch, RegularOpeningHours } from './types'

// https://developers.google.com/maps/documentation/places/web-service/text-search

export const entitySearch = async (msg: string): Promise<string | string[]> => {
	const searchTerm = msg.replace(/lookup\s*(?:for\s)?/, '')

	if (searchTerm.length < 2) return HELP

	const searchResults = await search(searchTerm)

	if (searchResults.error) {
		return `An unknown error occured while looking up your search. Please try again later.\n\n${HELP}`
	} else if (!searchResults.places || !searchResults.places.length) {
		return `No lookup matches found for "${searchTerm}". Please check your input and try again.\n\n${HELP}`
	}

	const places = searchResults.places.slice(0, 3).map(formatEntity)

	return places
}

const HELP =
	'Start the message with "lookup" followed by the [company name], [city, state or zipcode].\nI.e. Lookup Beth Medrash Govoha, 08701'

const search = async (searchTerm: string): Promise<EntitySearch> => {
	try {
		const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-FieldMask':
					'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.regularOpeningHours',
				'X-Goog-Api-Key': process.env.GOOGLE_MAPS_PLATFORM_API_KEY
			},
			body: JSON.stringify({
				textQuery: searchTerm,
				languageCode: 'en'
			})
		})
		return response.json()
	} catch (err) {
		// tslint:disable-next-line:no-console
		console.error('[RETRIEVAL_ERROR]: ', err)
		return {
			error: {
				code: 0,
				message: err,
				status: 'RETRIEVAL_ERROR'
			},
			places: undefined
		}
	}
}

const formatEntity = (place: Place): string => {
	const { displayName, formattedAddress, nationalPhoneNumber, regularOpeningHours } = place
	const modifiedAddress = formattedAddress.replace(', ', '\n')

	let formattedEntity = `${displayName.text}\n${modifiedAddress}\n${nationalPhoneNumber}`
	formattedEntity += formatHours(regularOpeningHours)

	return formattedEntity
}

const formatHours = (hours: RegularOpeningHours): string => {
	if (!hours || hours.periods.length === 0) return
	else if (hours.periods.length === 1) return '\n\nHours\nOpen 24 hours daily, 7 days a week'

	const isOpenNow = hours.openNow ? 'open' : 'closed'
	let formattedHours = `\n\nHours ~ currently ${isOpenNow}\n`

	// Shorten day name from Sunday -> Sun
	const schedule = hours.weekdayDescriptions.map((day) =>
		day.replace(/^(\w{3}).*day:(.*)/, '$1:$2')
	)

	// Move the last element (Sunday hours) to the beginning of the array
	const sundaySchedule = schedule.pop()
	schedule.unshift(sundaySchedule)

	formattedHours += groupDaysByHours(schedule).join('\n')

	return formattedHours
}

// Only works for days with overlap consecutively
const groupDaysByHours = (schedule: string[]): string[] => {
	const groupedByHours: { [hours: string]: string[] } = {}
	const uniqueHours: string[] = []

	schedule.forEach((daySchedule) => {
		const [day, hours] = daySchedule.split(': ')
		const daysWithOverlap: string[] = (groupedByHours[hours] || []).concat(day)
		groupedByHours[hours] = daysWithOverlap

		if (!uniqueHours.includes(hours)) {
			uniqueHours.push(hours)
		}
	})

	const formattedGroupedDays = uniqueHours.map((hours: string) => {
		const days = groupedByHours[hours]
		return days.length > 1
			? `${days[0]} - ${days[days.length - 1]}: ${hours}`
			: `${days[0]}: ${hours}`
	})

	return formattedGroupedDays
}
