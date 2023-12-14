import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { logger, queRemindGate } from './utils.js'

import { getDefinition } from './functions/definition/index.js'
import { fetchDirections } from './functions/directions/index.js'
import { entitySearch } from './functions/lookup/index.js'
// import { fetchNews } from './functions/news/index.js'
import { getForcast } from './functions/weather/index.js'
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
	const { event, user_id, user_name, message } = req.body

	const logged = await logger(event, user_id, user_name, message)
	// tslint:disable-next-line:no-console
	console.log(JSON.stringify(logged))

	if (event === 'new_user') {
		await new Promise((r) => setTimeout(r, 5000))
		await queRemindGate(user_id, WELCOME_MSG)
	}

	if (event !== 'message') return

	const [command, prompt] = message.toLowerCase().split(/\s+/)
	let clamp = true
	let reply: string | string[]

	switch (command) {
		case 'define':
			reply = await getDefinition(prompt)
			break

		case 'directions':
			clamp = false
			reply = await fetchDirections(prompt)
			break

		case 'help':
			reply = 'HELP'
			break

		case 'lookup':
			reply = await entitySearch(prompt)
			break

		case 'news':
			reply = 'The news service has been blocked due to spamming.'
			break

		case 'weather':
		case 'wether':
			reply = await getForcast(prompt)
			break

		case 'zmanim':
		default:
			reply = await generateZmanim(prompt)
			break
	}

	const remindGateReply = await queRemindGate(user_id, reply, clamp)

	res.setHeader('content-type', 'text/plain')
	res.send(reply)
})

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`)
})
