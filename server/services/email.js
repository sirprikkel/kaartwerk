// Email service — structuur klaar voor Resend integratie
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation(order) {
	console.log('[email] Order bevestiging:', {
		to: order.email,
		orderId: order.id,
		city: order.city,
		format: order.format,
		material: order.material,
	});
	// TODO: Resend integratie
	// await resend.emails.send({
	//   from: 'bestellingen@kaartwerk.nl',
	//   to: order.email,
	//   subject: `Kaartwerk — Bestelling ontvangen #${order.id.slice(0, 8)}`,
	//   html: `<p>Bedankt voor je bestelling van de ${order.city} poster (${order.format})!</p>`,
	// });
}

export async function sendShippingNotification(order, trackingUrl) {
	console.log('[email] Verzendbevestiging:', {
		to: order.email,
		orderId: order.id,
		trackingUrl,
	});
	// TODO: Resend integratie
	// await resend.emails.send({
	//   from: 'bestellingen@kaartwerk.nl',
	//   to: order.email,
	//   subject: `Kaartwerk — Je poster is onderweg!`,
	//   html: `<p>Je bestelling is verzonden. Track je pakket: <a href="${trackingUrl}">${trackingUrl}</a></p>`,
	// });
}
