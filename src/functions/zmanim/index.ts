import { find } from 'geo-tz'
import * as KosherZmanim from 'kosher-zmanim'
import { Zmanim, Zman, formatDate } from '../../utils.js'
import { DateTime } from 'luxon'

export const generateZmanim = async (msg: string) => {
	const location = msg.replace(/la?ke?wo?o?d/i, 'Lakewood, NJ')
	const geocodingAPI = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&region=us&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)
	const geoRes = await geocodingAPI.json()
	const coordinates = geoRes.results[0]?.geometry.location
	const formatted_address = geoRes.results[0]?.formatted_address

	if (!coordinates || !formatted_address) {
		const LOCATION_MISSING_ERR =
			"An error occured while searching for your requested location. Text 'zmanim' + zip code or city, state.\nI.e. Zmanim for Monsey, NY"
		return LOCATION_MISSING_ERR
	}

	const elevationAPI = await fetch(
		`https://maps.googleapis.com/maps/api/elevation/json?locations=${coordinates.lat},${coordinates.lng}&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)
	const elvRes = await elevationAPI.json()
	const elevation = elvRes.results[0].elevation
	const timeZoneId = find(coordinates.lat, coordinates.lng)[0]

	// Init location for zmanim
	const geolocation = new KosherZmanim.GeoLocation(
		formatted_address,
		coordinates.lat,
		coordinates.lng,
		elevation,
		timeZoneId
	)
	const calendar = new KosherZmanim.ComplexZmanimCalendar(geolocation)
	const now: DateTime = DateTime.local().setZone(timeZoneId)
	const todaysZmanim = new Zmanim(calendar)
	const zmanimList: Zman[] = todaysZmanim.list()

	// Create the starting message
	let response = `\n${formatted_address}\n- ${formatDate(
		calendar.getAlos16Point1Degrees(),
		timeZoneId
	)} -\n`

	let hasZmanimToday = false
	// Loop through the zmanim
	for (const i of [...Array(zmanimList.length).keys()]) {
		// If the zman is in the past,
		if (zmanimList[i].time < now) {
			// If there are no more zmanim for today, skip
			if (i === zmanimList.length - 1) continue
			// If the next zman is not in the future, skip
			if (zmanimList[i + 1].time < now) continue
		}
		response = response.concat(zmanimList[i].toStr(timeZoneId) + '\n')
		hasZmanimToday = true
	}

	// reset if no zmanim are returned for the first day
	if (!hasZmanimToday) response = formatted_address

	// Add 1 day to the calendar
	calendar.setDate(calendar.getDate().plus({ days: 1 }))
	const tommorowsZmanim = new Zmanim(calendar)
	const tommorowsZmanimList: Zman[] = tommorowsZmanim.list()
	response += `\n- ${formatDate(calendar.getAlos16Point1Degrees(), timeZoneId)} -`
	for (const i of [...Array(tommorowsZmanimList.length).keys()]) {
		response = response.concat('\n' + tommorowsZmanimList[i].toStr(timeZoneId))
	}

	return response
}
