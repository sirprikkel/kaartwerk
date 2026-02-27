import { getOrder, updateOrderStatus, updateOrderPrintfulId } from '../db/index.js';
import { renderPoster } from './renderer.js';
import { createPrintfulOrder } from './printful.js';
import { sendOrderConfirmation } from './email.js';

export async function processOrder(orderId) {
	let order;
	try {
		// 1. Haal order op uit DB
		order = getOrder(orderId);
		if (!order) {
			throw new Error(`Order ${orderId} niet gevonden`);
		}

		const config = order.config_json ? JSON.parse(order.config_json) : {};

		// 2. Render poster
		const { imageUrl } = await renderPoster({
			city: order.city,
			format: order.format,
			...config,
		});

		// 3. Maak Printful order aan
		const shippingAddress = config.shippingAddress ?? {
			name: config.name ?? order.email,
			address1: config.address1 ?? 'Onbekend',
			city: config.shippingCity ?? order.city ?? 'Onbekend',
			country_code: order.country ?? 'NL',
			email: order.email,
		};

		const { printfulOrderId } = await createPrintfulOrder(
			imageUrl,
			order.format,
			order.material,
			shippingAddress,
		);

		// 4. Update order in DB
		updateOrderPrintfulId(order.id, printfulOrderId);
		updateOrderStatus(order.id, 'processing');

		// 5. Stuur bevestigingsmail
		await sendOrderConfirmation(order);

		console.log(`[pipeline] Order ${orderId} verwerkt — Printful #${printfulOrderId}`);
	} catch (err) {
		console.error(`[pipeline] Fout bij verwerken order ${orderId}:`, err.message);
		if (order) {
			updateOrderStatus(order.id, 'error');
		}
	}
}
