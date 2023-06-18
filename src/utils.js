import moment from 'moment-timezone'

moment.locale('en')

export const formatTime = (timestamp, timezone) => moment.tz(timestamp, timezone).format('LT')
