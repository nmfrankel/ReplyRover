import express from 'express'
import { mapWindCardinals } from './utils.js'

const router = express.Router()
const baseURL = 'http://api.openweathermap.org/data/2.5/'

export const getCurrent = async (location: string, days = 1) => {
	// let endpoint = intval(self::$location)? 'weather?zip='.self::$location: 'weather?q='.self::$location;
	const endpoint = `${baseURL}weather?zip=${location},us&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`
	const rawWeather = await fetch(endpoint)

	if (rawWeather.status !== 200)
		return 'An error occured while retrieving the weather, try again later.'
	const weather = await rawWeather.json()
	const proTip = `Pro tip: Just text\nWeather for ${location}`

	// console.log(weather.weather)

	// simplify values
	const city = weather.name
	const temp = Math.round(weather.main.temp)
	const feel = Math.round(weather.main.feels_like)
	const cond =
		weather.weather[0].description.charAt(0).toUpperCase() + weather.weather[0].description.slice(1)
	const humi = Math.round(weather.main.humidity)
	const windS = Math.round(weather.wind.speed)
	const dire = mapWindCardinals(weather.wind.deg)
	const wind = windS > 2 ? `\nWind: ${windS} MPH ${dire}` : ''

	const formattedWeather = `
-- CURRENT --
Temp: ${temp}°
Feels like: ${feel}°
↳ ${cond}
Humidity: ${humi}%${wind}\n\n${proTip}`

	// tslint:disable-next-line:no-console
	console.log(city, formattedWeather.length)
	return formattedWeather
}

const getForcast = (location: string, days = 7) => {
	return '`Weather` is not functioning... try again later.'
}

// /category/add GET
router.post('/', async (req, res) => {
	// Extract msg info
	const { event, user_id, user_name, message } = req.body

	const zipcodes = message.match(/\b(\d{5})\b/)
	const reply = await getCurrent(zipcodes?.[1] ?? '08701')

	res.setHeader('content-type', 'text/plain')
	res.send(reply)
})

export default router
