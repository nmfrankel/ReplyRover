import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import incoming_handler from './webhooks/incoming';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
	res.send('Hello world!');
});

app.use('/webhooks/incoming', incoming_handler);

app.listen(port, () => {
	// tslint:disable-next-line:no-console
	console.log(`server started at http://localhost:${port}`);
});
