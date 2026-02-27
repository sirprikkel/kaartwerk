const PRINTFUL_API = 'https://api.printful.com';

// Closest Printful poster sizes per formaat
const PRODUCT_MAP = {
	A4: 'poster_12x18',
	A3: 'poster_18x24',
	A2: 'poster_24x36',
	A1: 'poster_36x48',
};

const MATERIAL_MAP = {
	paper: 'poster',
	canvas: 'canvas',
	framed: 'framed-poster',
};

export async function createPrintfulOrder(imageUrl, format, material, shippingAddress) {
	const apiKey = process.env.PRINTFUL_API_KEY;
	if (!apiKey) {
		throw new Error('PRINTFUL_API_KEY niet geconfigureerd');
	}

	const productType = PRODUCT_MAP[format] || PRODUCT_MAP.A3;
	const materialType = MATERIAL_MAP[material] || MATERIAL_MAP.paper;

	const body = {
		recipient: shippingAddress,
		items: [
			{
				variant_id: `${productType}_${materialType}`,
				quantity: 1,
				files: [
					{
						url: imageUrl,
					},
				],
			},
		],
	};

	const response = await fetch(`${PRINTFUL_API}/orders`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Printful API fout ${response.status}: ${text}`);
	}

	const data = await response.json();
	return {
		printfulOrderId: String(data.result?.id ?? data.id),
		status: data.result?.status ?? data.status ?? 'pending',
	};
}
