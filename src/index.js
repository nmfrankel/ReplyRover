import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { find } from 'geo-tz'
import { getZmanimJson } from 'kosher-zmanim'

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	res.send('Hello world!')
})

app.get('/zmanim', async (req, res) => {
	// tslint:disable-next-line:no-console
	// console.log(req.body.message)

	const location = 'zmanim brooklyn, ny'.replace('zmanim ', '')
	// har%20nof,%20israel

	const geocoding = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&region=us&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)

	// check for errors
	const geoRes = await geocoding.json()
	const coordinates = geoRes.results[0].geometry.location

	// tslint:disable-next-line:no-console
	console.log(geoRes.results[0].geometry.location)

	const elevationAPI = await fetch(
		`https://maps.googleapis.com/maps/api/elevation/json?locations=${coordinates.lat},${coordinates.lng}&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	)

	// check for errors
	const elvRes = await elevationAPI.json()
	const elevation = elvRes.results[0].elevation

	const timeZoneId = find(coordinates.lat, coordinates.lng)[0]

	// tslint:disable-next-line:no-console
	console.log(elevation, timeZoneId)

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

	// tslint:disable-next-line:no-console
	console.log(zmanim)

	res.json(zmanim)
	// res.send('time')
})

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`)
})
