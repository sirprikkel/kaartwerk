export const FORMATS = [
	{ key: 'A4', label: 'A4', basePrice: 19.95 },
	{ key: 'A3', label: 'A3', basePrice: 29.95 },
	{ key: 'A2', label: 'A2', basePrice: 39.95 },
	{ key: 'A1', label: 'A1', basePrice: 54.95 },
];

export const MATERIALS = [
	{ key: 'paper', label: 'Premium Papier', surcharge: 0 },
	{ key: 'canvas', label: 'Canvas', surcharge: 15 },
	{ key: 'framed', label: 'Ingelijst', surcharge: 25 },
];

export function calculatePrice(format, material) {
	const fmt = FORMATS.find(f => f.key === format) || FORMATS[1];
	const mat = MATERIALS.find(m => m.key === material) || MATERIALS[0];
	const basePrice = fmt.basePrice;
	const materialSurcharge = mat.surcharge;
	const subtotal = basePrice + materialSurcharge;
	const shipping = 5.95;
	const total = subtotal + shipping;
	return { basePrice, materialSurcharge, subtotal, shipping, total };
}
