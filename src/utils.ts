import * as KosherZmanim from 'kosher-zmanim'
import { DateTime } from 'luxon'
import { PrismaClient } from '@prisma/client'

export function formatTime(timestamp: DateTime | null, timezoneId: string) {
	if (!timestamp) return 'N/A'
	timestamp = timestamp.setZone(timezoneId)
	return timestamp.toFormat('h:mm')
}

export function formatDate(timestamp: DateTime | null, timezoneId: string) {
	if (!timestamp) return 'N/A'
	timestamp = timestamp.setZone(timezoneId)
	return timestamp.toFormat('EEE MM/dd')
}

// The next two functions manage sending out messages
const sendViaRemindGate = async (userID: any, message: string, delay = 0) => {
	await logger('response', userID, 'Unknown', message)
	await new Promise((r) => setTimeout(r, delay))

	const send = await fetch(`${process.env.HOST}/message/${userID}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			message,
			file: null,
			filename: null
		})
	})
	return send
}

export const queRemindGate = async (userID: string, payload: string | string[], clamp = true) => {
	const msgs = typeof payload === 'string' ? [payload] : payload
	const charLimit = 300
	const chunkRegex = new RegExp(`^[^\\n][\\s\\S]{0,${charLimit}}(?=\\n|$)`, clamp ? 'm' : 'gm')

	const msgChunks = msgs.flatMap((msg) => msg.match(chunkRegex) || [])
	return msgChunks.map(async (chunk, idx) => await sendViaRemindGate(userID, chunk, idx * 1500))
}

// The next section runs db interactions
declare global {
	var prisma: PrismaClient | undefined
}

const initDB = () => {
	const prisma = global.prisma || new PrismaClient()
	if (process.env.NODE_ENV !== 'production') global.prisma = prisma
}

export const logger = async (event: string, userID: string, username: string, message: string) => {
	return {}

	initDB()
	const entry = await global.prisma.log.create({
		data: {
			event,
			userID,
			username,
			message
		}
	})
	return entry
}

/* tslint:disable:max-classes-per-file */
export class Zman {
	time: DateTime
	name: string

	constructor(timestamp: DateTime, name: string) {
		this.time = timestamp
		this.name = name
	}
	toStr(timezoneId: string) {
		return `${this.name}: ${formatTime(this.time, timezoneId)}`
	}
}

export class Zmanim {
	dawn: Zman
	talis: Zman
	netz: Zman
	shemaMga: Zman
	shemaGra: Zman
	shachris: Zman
	chatzos: Zman
	minchaGedola: Zman
	plag: Zman
	shkia: Zman
	tzeis: Zman
	_60Min: Zman
	_72Min: Zman
	candleLighting: Zman | null

	constructor(clandar: KosherZmanim.ComplexZmanimCalendar) {
		this.dawn = new Zman(clandar.getAlos16Point1Degrees(), 'Dawn')
		this.talis = new Zman(clandar.getMisheyakir10Point2Degrees(), 'Talis')
		this.netz = new Zman(clandar.getSeaLevelSunrise(), 'Netz')
		this.shemaMga = new Zman(clandar.getSofZmanShmaMGA16Point1Degrees(), 'Shema MGA')
		this.shemaGra = new Zman(clandar.getSofZmanShmaGRA(), 'Shema GRA')
		this.shachris = new Zman(clandar.getSofZmanTfilaGRA(), 'Shachris')
		this.chatzos = new Zman(clandar.getChatzos(), 'Chatzos')
		this.minchaGedola = new Zman(clandar.getMinchaGedola(), 'Mincha')
		this.plag = new Zman(clandar.getPlagHamincha(), 'Plag')
		this.shkia = new Zman(clandar.getSeaLevelSunset(), 'Shkia')
		this.tzeis = new Zman(clandar.getTzais(), 'Tzeis')
		this._60Min = new Zman(clandar.getTzais60(), '60 Min')
		this._72Min = new Zman(clandar.getTzais72(), '72 Min')

		// Setting in israel to true being that we shoule never return a time for 2nd day yom tov
		if (clandar.isAssurBemlacha(clandar.getDate().plus({ days: 1 }), clandar.getTzais(), true))
			this.candleLighting = new Zman(clandar.getCandleLighting(), 'Candle Lighting')
	}

	list() {
		const a = [
			this.dawn,
			this.talis,
			this.netz,
			this.shemaMga,
			this.shemaGra,
			this.shachris,
			this.chatzos,
			this.minchaGedola,
			this.plag
		]
		if (this.candleLighting) a.push(this.candleLighting)
		const b = [this.shkia, this.tzeis, this._60Min, this._72Min]
		return a.concat(b)
	}
}
