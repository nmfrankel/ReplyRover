import { mapWindCardinals } from './utils.js';

const baseURL = 'https://api.openweathermap.org/data/2.5';

export const getCurrent = async (location: string, days = 1) => {
	location = location.replace(/la?ke?wo?o?d/i, 'Lakewood, NJ');
	const geocodingAPI = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&region=us&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	);
	const geoRes = await geocodingAPI.json();
	const coordinates = geoRes.results[0]?.geometry.location;
	const formatted_address = geoRes.results[0]?.formatted_address;

	if (!coordinates || !formatted_address) {
		const LOCATION_MISSING_ERR =
			"An error occured while searching for your requested location. Text 'weather' + zip code or city, state.\nI.e. Weather for Monsey, NY";
		return LOCATION_MISSING_ERR;
	}

	const endpoint = `${baseURL}/weather?lat=${coordinates.lat}&lon=${coordinates.lng}&units=imperial&appid=${process.env.OPEN_WEATHER_API_KEY}`;
	const rawWeather = await fetch(endpoint);

	if (rawWeather.status !== 200)
		return `An error occured while retrieving the weather '${formatted_address}', try again later.`;
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

	const formattedWeather = `${formatted_address}
-- CURRENT --
Temp: ${temp}°
Feels like: ${feel}°
↳ ${cond}
Humidity: ${humi}%${wind}`;

	return formattedWeather;
};

export const getForcast = async (location: string, days = 6) => {
	location = location.replace(/la?ke?wo?o?d/i, 'Lakewood, NJ');
	const geocodingAPI = await fetch(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&region=us&key=${process.env.GOOGLE_MAPS_PLATFORM_API_KEY}`
	);
	const geoRes = await geocodingAPI.json();
	const coordinates = geoRes.results[0]?.geometry.location;
	const formatted_address = geoRes.results[0]?.formatted_address;

	if (!coordinates || !formatted_address) {
		const LOCATION_MISSING_ERR =
			"An error occured while searching for your requested location. Text 'weather' + zip code or city, state.\nI.e. Weather for Monsey, NY";
		return LOCATION_MISSING_ERR;
	}

	const endpoint = `${baseURL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lng}&units=imperial&units=imperial&exclude=hourly,minutely&appid=${process.env.OPEN_WEATHER_API_KEY}`;
	const rawWeather = await fetch(endpoint);

	if (rawWeather.status !== 200)
		return `An error occured while retrieving the weather for '${formatted_address}', please try us again later.`;
	const weather = await rawWeather.json();
	let formatted = formatted_address + '\n';

	weather.daily.forEach((d: any, i: number) => {
		if (i >= days) return;

		const dt = new Date(d.dt * 1000);
		const dayOfWeek = dt.toLocaleString('en-us', { weekday: 'short' });
		const month = dt.getMonth() + 1;
		const day = dt.getDate().toString().padStart(2, '0');
		const high = Math.round(d.temp.max);
		const low = Math.round(d.temp.min);
		const desc = d.weather?.[0].description;

		formatted += `${dayOfWeek} ${month}/${day} | ${low}° - ${high}° ${desc}\n`;
	});

	return formatted;
};

export const functionDeclaration = {
	name: 'getWeather',
	description: 'Get the weather for a given location, with the option for a specified time.',
	parameters: {
		type: 'OBJECT',
		properties: {
			location: {
				type: 'STRING',
				description:
					'location to get the weather for. Can be a zip code, city, or other location identifier.'
			},
			days: {
				type: 'INTEGER',
				description:
					'Number of days to get the forecast for. If current or now then days should equal one.'
			}
		},
		required: ['location']
	}
};
