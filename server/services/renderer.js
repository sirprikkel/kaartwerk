const DIMENSIONS = {
	A4: { width: 2480, height: 3508 },
	A3: { width: 3508, height: 4961 },
	A2: { width: 4961, height: 7016 },
	A1: { width: 7016, height: 9933 },
};

export async function renderPoster(orderConfig) {
	const { city, format } = orderConfig;
	const dims = DIMENSIONS[format] || DIMENSIONS.A3;

	console.log(`Rendering poster for ${city} at ${format}...`);

	// Placeholder — echte rendering volgt met Puppeteer
	return {
		imageUrl: 'https://placeholder.kaartwerk.nl/poster.png',
		width: dims.width,
		height: dims.height,
	};
}
