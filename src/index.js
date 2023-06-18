import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { find } from 'geo-tz'
import { getZmanimJson } from 'kosher-zmanim'
import { formatDate, formatTime, remindGate } from './utils.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
	res.send('Hello world!')
})

app.post('/zmanim', async (req, res) => {
	if (req.body.event === 'new_user') {
		await new Promise((r) => setTimeout(r, 3000))

		const welcomeMsg =
			'To use the zmanim bot. Reply to this number with your zipcode or city, state to get zmanim.'
		await remindGate(req.body.user_id, welcomeMsg)
	}

	if (req.body.event !== 'message') return

	// tslint:disable-next-line:no-console
	console.log(req.body)

	const location = req.body.message?.replace('zmanim ', '') ?? 'Brooklyn, NY'

	const geocoding = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&region=us&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)

	// check for errors
	const geoRes = await geocoding.json()
	const coordinates = geoRes.results[0].geometry.location
	const formatted_address = geoRes.results[0].formatted_address

	const elevationAPI = await fetch(
		`https://maps.googleapis.com/maps/api/elevation/json?locations=${coordinates.lat},${coordinates.lng}&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)

	// check for errors
	const elvRes = await elevationAPI.json()
	const elevation = elvRes.results[0].elevation

	const timeZoneId = find(coordinates.lat, coordinates.lng)[0]

	const options = {
		// date: new Date(),
		timeZoneId,
		// locationName?: string,
		latitude: coordinates.lat,
		longitude: coordinates.lng,
		elevation,
		complexZmanim: true
	}
	const zmanim = getZmanimJson(options)

	// Dawn: AlosHashachar
	// Earliest Tefilin: Misheyakir10Point2Degrees
	// Sunrise: SeaLevelSunrise
	// Latest shema MGA: SofZmanShmaMGA90MinutesZmanis
	// Latest shema GRA: SofZmanShmaGRA
	// -- Latest shachris MGA: SofZmanTfilaMGA
	// Latest shachris Gra: SofZmanTfilaGRA
	// Chatzos: Chatzos
	// Earliest mincha: MinchaGedola
	// Plag hamincha: PlagHamincha
	// Sunset: SeaLevelSunset
	// Nightfall - 3 stars emerge: Tzais
	// Nightfall - 72 minutes: Tzais72

	// tslint:disable-next-line:no-console
	// console.log(zmanim)

	const reply = `${formatted_address}\n
${formatDate(zmanim.Zmanim.AlosHashachar, timeZoneId)}
Dawn: ${formatTime(zmanim.Zmanim.AlosHashachar, timeZoneId)}
Talis: ${formatTime(zmanim.Zmanim.Misheyakir10Point2Degrees, timeZoneId)}
Netz: ${formatTime(zmanim.Zmanim.SeaLevelSunrise, timeZoneId)}
Shema_MA: ${formatTime(zmanim.Zmanim.SofZmanShmaMGA90MinutesZmanis, timeZoneId)}
Shema_Gra: ${formatTime(zmanim.Zmanim.SofZmanShmaGRA, timeZoneId)}
Shachris: ${formatTime(zmanim.Zmanim.SofZmanTfilaGRA, timeZoneId)}
Chatzos: ${formatTime(zmanim.Zmanim.Chatzos, timeZoneId)}
Mincha: ${formatTime(zmanim.Zmanim.MinchaGedola, timeZoneId)}
Plag_Gra: ${formatTime(zmanim.Zmanim.PlagHamincha, timeZoneId)}
Shkia: ${formatTime(zmanim.Zmanim.SeaLevelSunset, timeZoneId)}
3 Stars: ${formatTime(zmanim.Zmanim.Tzais, timeZoneId)}
72 Min: ${formatTime(zmanim.Zmanim.Tzais72, timeZoneId)}`
	// Ketana: Missing\n
	// Plag_MA: Missing\n

	const remindGateReply = await remindGate(req.body.user_id, reply)

	// tslint:disable-next-line:no-console
	console.log(remindGateReply.status, await remindGateReply.text())

	res.setHeader('content-type', 'text/plain')
	res.send(reply)
})

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`)
})
