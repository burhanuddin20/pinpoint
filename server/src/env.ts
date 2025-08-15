import dotenv from 'dotenv';

dotenv.config();

const required = ['GOOGLE_PLACES_KEY'] as const;

type RequiredKeys = typeof required[number];

const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
	console.warn(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env = {
	PORT: Number(process.env.PORT ?? 3001),
	GOOGLE_PLACES_KEY: process.env.GOOGLE_PLACES_KEY || '',
};

export function assertEnv() {
	if (!env.GOOGLE_PLACES_KEY) {
		throw new Error('GOOGLE_PLACES_KEY is required. Set it in the server .env');
	}
}