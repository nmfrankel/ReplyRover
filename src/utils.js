import moment from 'moment-timezone'

moment.locale('en')

export const formatTime = (timestamp, timezone) => moment.tz(timestamp, timezone).format('h:ss')
export const formatDate = (timestamp, timezone) =>
	moment.tz(timestamp, timezone).startOf('day').format('dddd').toUpperCase()

export const remindGate = async (user_id, message) =>
	fetch(`http://zmanim-remind-gate.system.dickersystems.com/message/${user_id}`, {
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
