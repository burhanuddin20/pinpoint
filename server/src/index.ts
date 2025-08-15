import express from 'express';
import cors from 'cors';
import { env, assertEnv } from './env';
import { placesRouter } from './routes/places';
import { searchRouter } from './routes/search';

assertEnv();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/places', placesRouter);
app.use('/search', searchRouter);

app.use((err: any, _req: any, res: any, _next: any) => {
	console.error('Unhandled error', err);
	res.status(500).json({ error: 'internal error' });
});

app.listen(env.PORT, () => {
	console.log(`Server listening on http://localhost:${env.PORT}`);
});