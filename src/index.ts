import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import signalwire_handler from './webhooks/signalwire/index';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (_, res) => {
	res.send('Hello world!');
});

app.use('/webhooks/signalwire', signalwire_handler);

app.use((err, req, res, next) => {
	res.status(400).send(err.message);
});

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`);
});
