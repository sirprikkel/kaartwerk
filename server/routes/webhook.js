import { Router } from 'express';
import { createMollieClient } from '@mollie/api-client';
import { getOrderByMollieId, updateOrderStatus } from '../db/index.js';
import { sendOrderConfirmation } from '../services/email.js';

const router = Router();

router.post('/webhook', async (req, res) => {
	const { id } = req.body;

	if (!id) {
		return res.status(400).send('Missing payment id');
	}

	try {
		const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
		const payment = await mollie.payments.get(id);
		const order = getOrderByMollieId(id);

		if (!order) {
			console.warn(`Webhook: geen order gevonden voor mollie_id ${id}`);
			return res.status(200).send('ok');
		}

		const status = payment.status;

		if (status === 'paid') {
			updateOrderStatus(order.id, 'paid');
			await sendOrderConfirmation(order);
		} else if (status === 'canceled' || status === 'expired' || status === 'failed') {
			updateOrderStatus(order.id, status);
		}

		res.status(200).send('ok');
	} catch (err) {
		console.error('Webhook error:', err.message);
		res.status(500).send('Internal error');
	}
});

export default router;
