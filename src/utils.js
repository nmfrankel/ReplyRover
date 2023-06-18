import moment from 'moment-timezone'

moment.locale('en')

export const formatTime = (timestamp, timezone) => moment.tz(timestamp, timezone).format('h:ss')
export const formatDate = (timestamp, timezone) =>
	moment.tz(timestamp, timezone).startOf('day').format('dddd').toUpperCase()
