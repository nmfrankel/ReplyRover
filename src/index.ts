import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { find } from 'geo-tz'
import * as KosherZmanim from 'kosher-zmanim'
import { Zmanim, Zman, formatDate, remindGate } from './utils.js'
import { DateTime } from 'luxon'

const WELCOME_MSG =
	'Welcome to ZmanimBot. Reply with a zipcode or city, state to get zmanim.\nText HELP for more information.'

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
	res.send('Hello world!')
})

app.post('/', async (req, res) => {
	// Handle new users
	if (req.body.event === 'new_user') {
		await new Promise((r) => setTimeout(r, 3000))
		await remindGate(req.body.user_id, WELCOME_MSG)
	}

	// Ensure that we are dealing with a message
	if (req.body.event !== 'message') return

	// Log the message
	// tslint:disable-next-line:no-console
	console.log(req.body)

	// Get the location from the message
	const location = req.body.message?.replace('zmanim', '') ?? 'Brooklyn, NY'

	const geocodingAPI = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&region=us&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)
	const geoRes = await geocodingAPI.json()
	const coordinates = geoRes.results[0]?.geometry.location
	const formatted_address = geoRes.results[0]?.formatted_address

	const elevationAPI = await fetch(
		`https://maps.googleapis.com/maps/api/elevation/json?locations=${coordinates.lat},${coordinates.lng}&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)
	const elvRes = await elevationAPI.json()
	const elevation = elvRes.results[0].elevation
	const timeZoneId = find(coordinates.lat, coordinates.lng)[0]
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
	let reply = `\n${formatted_address}\n${formatDate(
		calendar.getAlos16Point1Degrees(),
		timeZoneId
	)}:`

	// Loop through the zmanim
	for (const i of [...Array(zmanimList.length).keys()]) {
		// If the zman is in the past,
		if (zmanimList[i].time < now) {
			// If there are no more zmanim for today, skip
			if (i === zmanimList.length - 1) continue
			// If the next zman is not in the future, skip
			if (zmanimList[i + 1].time < now) continue
		}
		reply = reply.concat('\n' + zmanimList[i].toStr(timeZoneId))
	}

	// Add 1 day to the calendar
	calendar.setDate(calendar.getDate().plus({ days: 1 }))
	const tommorowsZmanim = new Zmanim(calendar)
	const tommorowsZmanimList: Zman[] = tommorowsZmanim.list()
	reply += `\n\n${formatDate(calendar.getAlos16Point1Degrees(), timeZoneId)}:`
	for (const i of [...Array(tommorowsZmanimList.length).keys()]) {
		reply = reply.concat('\n' + tommorowsZmanimList[i].toStr(timeZoneId))
	}

	const remindGateReply = await remindGate(req.body.user_id, reply)

	res.setHeader('content-type', 'text/plain')
	res.send(reply)
})

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`)
})
