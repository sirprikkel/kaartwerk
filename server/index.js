import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import checkoutRouter from './routes/checkout.js';
import webhookRouter from './routes/webhook.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
	origin: process.env.BASE_URL || 'http://localhost:5173',
	credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', checkoutRouter);
app.use('/api/mollie', webhookRouter);
app.use('/api/printful', webhookRouter);

app.listen(PORT, () => {
	console.log(`Kaartwerk server running on http://localhost:${PORT}`);
});
