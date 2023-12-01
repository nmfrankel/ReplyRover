import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { remindGate } from './utils.js'

import { getForcast } from './functions/weather/index.js'
import { define } from './functions/vocab/index.js'
import { webSearch } from './functions/facts/index.js'
import { generateZmanim } from './functions/zmanim/index.js'

const WELCOME_MSG = 'Welcome to ZmanimBot. Reply with a zipcode or city, state to get zmanim.'

dotenv.config()

const app = express()
const port = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
	res.send('Hello world!')
})

app.post('/', async (req, res) => {
	// Extract msg info
	const { event, user_id, user_name, message } = req.body

	// Log the message
	// tslint:disable-next-line:no-console
	console.log(event, user_id, user_name, message)

	// Handle new users
	if (event === 'new_user') {
		await new Promise((r) => setTimeout(r, 5000))
		await remindGate(user_id, WELCOME_MSG)
	}

	// Ensure that we are dealing with a message
	if (event !== 'message') return

	let reply = ''
	if (message.toLowerCase().startsWith('weather') || message.toLowerCase().startsWith('wether')) {
		const location = message?.replace('wea?ther ', '').replace(/la?ke?wo?o?d/i, 'Lakewood, NJ')
		reply = await getForcast(location, user_id)
	} else if (message.toLowerCase().startsWith('define')) {
		const term = message.split(/\s/).pop()
		reply = await define(term ?? 'hello')
	} else if (message.toLowerCase().startsWith('search')) {
		reply = await webSearch('')
		res.send(reply)
		return
	} else {
		// Get the location from the message
		const location = message?.replace('zmanim', '').replace(/la?ke?wo?o?d/i, 'Lakewood, NJ')
		reply = await generateZmanim(location, user_id)
	}
	const remindGateReply = await remindGate(user_id, reply)

	res.setHeader('content-type', 'text/plain')
	res.send(reply)
})

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`)
})
