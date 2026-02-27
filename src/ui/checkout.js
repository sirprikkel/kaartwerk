import { state } from '../core/state.js';

const API_BASE = 'http://localhost:3001';

export function setupCheckout() {
	const orderBtn = document.getElementById('order-btn');
	if (!orderBtn) return;

	orderBtn.addEventListener('click', () => {
		showEmailModal();
	});
}

function showEmailModal() {
	// Remove existing modal if any
	document.getElementById('checkout-modal')?.remove();

	const modal = document.createElement('div');
	modal.id = 'checkout-modal';
	modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
	modal.innerHTML = `
		<div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="checkout-overlay"></div>
		<div class="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
			<h2 class="font-serif text-xl font-bold text-slate-900 mb-1">Jouw poster bestellen</h2>
			<p class="text-[12px] text-slate-500 mb-5">Vul je e-mailadres in om door te gaan naar de betaling.</p>

			<label class="block text-[11px] font-semibold text-slate-600 mb-1.5" for="checkout-email">E-mailadres</label>
			<input
				id="checkout-email"
				type="email"
				placeholder="jij@voorbeeld.nl"
				autocomplete="email"
				class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition mb-4"
			/>

			<div id="checkout-error" class="hidden text-[11px] text-red-500 mb-3"></div>

			<button id="checkout-submit"
				class="w-full bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition-colors text-sm flex items-center justify-center gap-2">
				<span id="checkout-btn-text">Doorgaan naar betaling</span>
				<svg id="checkout-spinner" class="hidden w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
				</svg>
			</button>
			<button id="checkout-cancel" class="w-full mt-3 text-[11px] text-slate-400 hover:text-slate-600 transition">Annuleren</button>
		</div>
	`;

	document.body.appendChild(modal);

	document.getElementById('checkout-overlay').addEventListener('click', closeModal);
	document.getElementById('checkout-cancel').addEventListener('click', closeModal);
	document.getElementById('checkout-submit').addEventListener('click', handleSubmit);

	setTimeout(() => document.getElementById('checkout-email')?.focus(), 50);
}

function closeModal() {
	document.getElementById('checkout-modal')?.remove();
}

async function handleSubmit() {
	const emailInput = document.getElementById('checkout-email');
	const errorEl = document.getElementById('checkout-error');
	const spinner = document.getElementById('checkout-spinner');
	const btnText = document.getElementById('checkout-btn-text');
	const submitBtn = document.getElementById('checkout-submit');

	const email = emailInput?.value?.trim();
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		if (errorEl) {
			errorEl.textContent = 'Voer een geldig e-mailadres in.';
			errorEl.classList.remove('hidden');
		}
		return;
	}

	if (errorEl) errorEl.classList.add('hidden');
	if (spinner) spinner.classList.remove('hidden');
	if (btnText) btnText.textContent = 'Even geduld…';
	if (submitBtn) submitBtn.disabled = true;

	try {
		const payload = {
			format: state.format || 'A3',
			material: state.material || 'paper',
			email,
			city: state.cityOverride || state.city || null,
			country: state.countryOverride || state.country || null,
			config: {
				lat: state.lat,
				lon: state.lon,
				zoom: state.zoom,
				theme: state.theme,
				renderMode: state.renderMode,
			},
		};

		const res = await fetch(`${API_BASE}/api/checkout`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.error || 'Onbekende fout');
		}

		if (data.checkoutUrl) {
			window.location.href = data.checkoutUrl;
		}
	} catch (err) {
		if (errorEl) {
			errorEl.textContent = `Er ging iets mis: ${err.message}`;
			errorEl.classList.remove('hidden');
		}
		if (spinner) spinner.classList.add('hidden');
		if (btnText) btnText.textContent = 'Doorgaan naar betaling';
		if (submitBtn) submitBtn.disabled = false;
	}
}
