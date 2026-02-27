import { Router } from 'express';
import { createMollieClient } from '@mollie/api-client';
import { randomUUID } from 'crypto';
import { createOrder } from '../db/index.js';

const router = Router();

const FORMATS = [
	{ key: 'A4', label: 'A4', basePrice: 19.95 },
	{ key: 'A3', label: 'A3', basePrice: 29.95 },
	{ key: 'A2', label: 'A2', basePrice: 39.95 },
	{ key: 'A1', label: 'A1', basePrice: 54.95 },
];

const MATERIALS = [
	{ key: 'paper', label: 'Premium Papier', surcharge: 0 },
	{ key: 'canvas', label: 'Canvas', surcharge: 15 },
	{ key: 'framed', label: 'Ingelijst', surcharge: 25 },
];

function calculatePrice(format, material) {
	const fmt = FORMATS.find(f => f.key === format) || FORMATS[1];
	const mat = MATERIALS.find(m => m.key === material) || MATERIALS[0];
	const subtotal = fmt.basePrice + mat.surcharge;
	const shipping = 5.95;
	return { total: subtotal + shipping };
}

router.post('/checkout', async (req, res) => {
	const { format, material, email, city, country, config } = req.body;

	if (!email || !format || !material) {
		return res.status(400).json({ error: 'email, format en material zijn verplicht' });
	}

	const { total } = calculatePrice(format, material);
	const orderId = randomUUID();
	const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

	let mollieId = null;
	let checkoutUrl = null;

	try {
		const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });

		const payment = await mollie.payments.create({
			amount: {
				currency: 'EUR',
				value: total.toFixed(2),
			},
			description: `Kaartwerk - ${city || 'Onbekend'} poster ${format}`,
			redirectUrl: `${baseUrl}/success.html?orderId=${orderId}`,
			webhookUrl: `${process.env.SERVER_URL || 'http://localhost:3001'}/api/mollie/webhook`,
			metadata: { orderId },
		});

		mollieId = payment.id;
		checkoutUrl = payment.getCheckoutUrl();
	} catch (err) {
		console.error('Mollie error:', err.message);
		return res.status(502).json({ error: 'Betaling aanmaken mislukt', detail: err.message });
	}

	createOrder({
		id: orderId,
		email,
		city: city || null,
		country: country || null,
		format,
		material,
		mollie_id: mollieId,
		config_json: config || null,
	});

	res.json({ checkoutUrl, orderId });
});

export default router;
