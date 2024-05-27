import { z } from 'zod';
import { formatDate, geocode } from '../library';
import { mapWindCardinals } from './utils';

const baseURL = 'https://api.openweathermap.org/data/2.5';

export const getCurrent = async (location: string) => {
	const [error, locationData] = await geocode(location);

	if (error) {
		return error;
	}

	const endpoint = `${baseURL}/weather?lat=${locationData.lat}&lon=${locationData.lng}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`;
	const rawWeather = await fetch(endpoint);

	if (rawWeather.status !== 200)
		return `An error occured while retrieving the weather '${locationData.formatted_address}', try again later.`;
	// tslint:disable-next-line:no-shadowed-variable
	const weather = await rawWeather.json();

	// simplify values
	const city = weather.name;
	const temp = Math.round(weather.main.temp);
	const feel = Math.round(weather.main.feels_like);
	const cond =
		weather.weather[0].description.charAt(0).toUpperCase() +
		weather.weather[0].description.slice(1);
	const humi = Math.round(weather.main.humidity);
	const windS = Math.round(weather.wind.speed);
	const dire = mapWindCardinals(weather.wind.deg);
	const wind = windS > 2 ? `\nWind: ${windS} MPH ${dire}` : '';

	const formattedWeather = `${locationData.formatted_address}
-- CURRENT --
Temp: ${temp}°
Feels like: ${feel}°
↳ ${cond}
Humidity: ${humi}%${wind}`;

	return formattedWeather;
};

export const getForcast = async (location: string, days = 6) => {
	const [error, locationData] = await geocode(location);

	if (error) {
		return error;
	}

	const endpoint = `${baseURL}/onecall?lat=${locationData.lat}&lon=${locationData.lng}&units=imperial&units=imperial&exclude=hourly,minutely&appid=${process.env.OPEN_WEATHER_API_KEY}`;
	const rawWeather = await fetch(endpoint);

	if (rawWeather.status !== 200)
		return `An error occured while retrieving the weather for '${locationData.formatted_address}', please try us again later.`;
	// tslint:disable-next-line:no-shadowed-variable
	const weather = await rawWeather.json();
	let formatted = locationData.formatted_address + '\n';

	weather.daily.forEach((d: any, i: number) => {
		if (i >= days) return;

		const dt = new Date(d.dt * 1000);
		const formattedDate = formatDate(dt);
		const high = Math.round(d.temp.max);
		const low = Math.round(d.temp.min);
		const desc = d.weather?.[0].description;

		formatted += `${formattedDate} | ${low}° - ${high}° ${desc}\n`;
	});

	return formatted;
};

export const weather = {
	descirption: "Get weather for user's requested location",
	parameters: z.object({
		location: z.string().describe("User's location"),
		days: z
			.number()
			.min(0)
			.max(7)
			.describe(
				'Count of days to return in the forecast. If not explictly defined, it will return 0 days.'
			),
		unit: z
			.enum(['C', 'F'])
			.describe('The unit to display the temperature in, based on location.')
	}),
	execute: async ({ location, days, unit }: any) =>
		days === 1 ? await getCurrent(location) : await getForcast(location, days || 6)
};
