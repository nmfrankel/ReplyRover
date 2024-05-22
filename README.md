# Reply Rover

Reply Rover is a webhook server designed to handle incoming SMS traffic. It acts as a personal assistant accessible through SMS, providing assistance on a wide range of topics. Some of the tasks it can help with include:

-   Directions: Reply Rover can provide directions to specific locations.
-   Entity Lookup: Reply Rover can retrieve information from Wikipedia about various entities.
-   News: Reply Rover can fetch the latest news updates.
-   Weather: Reply Rover can provide current weather conditions and forecasts.
-   Zmanim: Reply Rover can provide information about Jewish prayer times (zmanim).

This server is designed to work in conjunction with [remind-gate](https://github.com/dickermoshe/remind-gate) SMS gateway, enhancing its functionality and providing additional features.

## Development

To set up the project for development and make modifications, follow these three steps:

1. Edit the `.env` file and ensure that the correct values are set. Refer to the `.env.example` file for the expected format and API key instructions.
2. Install the required packages by running `npm install`.
3. Start the server using `npm run dev`.

## Deployment

To deploy Reply Rover, follow these steps:

1. Edit the `.env` file and ensure that the correct values are set. You can refer to the `.env.example` file for the expected format.
2. Build the Docker image by running `docker build --tag reply-rover .`, and then run the container with `docker run --rm -i -t -p 80:80 reply-rover:latest`.

<!-- ## What I Exercised/Learned -->

> powered by [`Express.js`](https://expressjs.com/)..
