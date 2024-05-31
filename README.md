# Reply Rover

Reply Rover is a webhook server designed to handle incoming SMS traffic. It acts as a personal assistant accessible through SMS, providing assistance on a wide range of topics. Some of the tasks it can help with include:

-   Directions: Reply Rover can provide directions to specific locations.
-   Entity Lookup: Reply Rover can retrieve information business information about various entities.
-   News: Reply Rover can fetch the latest news updates.
-   Weather: Reply Rover can provide current weather conditions and forecasts.
-   Wiki: Reply Rover can provide a topic summary from Wikipedia.
-   Zmanim: Reply Rover can provide information about Jewish prayer times (zmanim).

This server is configured to work in conjunction with [SignalWire's](https://signalwire.com/) SMS gateway, enhancing its functionality and providing additional features.

## Development

To set up the project for development and make modifications, follow these three steps:

1. Edit the `.env` file and ensure that the correct values are set. Refer to the `.env.example` file for the expected format and API key instructions.
2. Install the required packages by running `npm install`.
3. Start the server using `npm run dev`.

## Deployment

To deploy Reply Rover, follow these steps:

1. Edit the `.env` file and ensure that the correct values are set. You can refer to the `.env.example` file for the expected format.
2. Build the Docker image by running `docker build --tag reply-rover .`, and then run the container with `docker run --rm -i -t -p 80:80 reply-rover:latest`.

## Example Prompts

**Question**: `What inspired the freedom tower design?`

**Answer**: `The Freedom Tower's design was inspired by the shape of a lighthouse, symbolizing hope and resilience after the 9/11 attacks. Its octagonal base represents the eight victims of the 1993 World Trade Center bombing, and its height of 1,776 feet commemorates the year the United States Declaration of Independence was signed.`

---

**Question**: `Can you find out if chickens can fly?`

**Answer**: `Chickens are not capable of sustained flight like other birds due to their heavy bodies and small wings. However, they can flap their wings to gain short bursts of lift, allowing them to jump or glide for short distances. This limited flight ability helps them escape predators or reach higher perches.`

---

**Question**: `Please provide the current weather in Brooklyn, NY`

**Answer**:

```Brooklyn, NY, USA
-- CURRENT --
Temp: 77°
Feels like: 78°
↳ Clear sky
Humidity: 64%
Wind: 9 MPH SW
```

---

**Question**: `Do you know the forcast for Lakewood, NJ`

**Answer**:

```
Lakewood, NJ 08701, USA
Thu 5/23 | 64° - 80° moderate rain
Fri 5/24 | 65° - 81° overcast clouds
Sat 5/25 | 63° - 75° overcast clouds
Sun 5/26 | 62° - 83° moderate rain
Mon 5/27 | 63° - 79° moderate rain
Tue 5/28 | 62° - 78° broken clouds
```

---

**Question**: `Prayer times for Jerusalem, please.`

**Answer**:

```
Jerusalem, Israel
- Fri 5/24 -
Shema MGA: 8:24
Shema GRA: 9:06
Shachris: 10:16
Chatzos: 12:36
Mincha: 1:11
Plag: 6:07
- Candle Lighting: 7:17
Shkia: 7:35
Tzeis: 8:16
60 Min: 8:35
72 Min: 8:47

- Sha 5/25 -
Dawn: 4:12
Talis: 4:46
Netz: 5:36
Shema MGA: 8:24
```

> powered by [`Express.js`](https://expressjs.com/).
