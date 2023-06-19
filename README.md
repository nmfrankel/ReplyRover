# Zmanim Server

The Zmanim Server is a webhook server that listens for incoming SMS traffic and processes requests for zmanim based on the provided location. It then responds with the zmanim for the next 24 hours. This server is designed to work in conjunction with [remind-gate](https://github.com/dickermoshe/remind-gate).

## Development

To set up the project for development and make modifications, follow these three steps:

1. Edit the .env file and ensure that the correct values are set. You can refer to the .env.example file for the expected format.
1. Install the required packages by running npm install.
1. Start the server and open the application in your browser using npm run dev.

## Deployment

To deploy the Zmanim Server, follow these steps:

1. Edit the .env file and ensure that the correct values are set. You can refer to the .env.example file for the expected format.
1. Build the Docker image by running docker build --tag zmanim-server ., and then run the container with docker run --rm -i -t -p 80:80 zmanim-server:latest.
