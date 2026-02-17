import { state, updateState, getSelectedTheme, getSelectedArtisticTheme } from '../core/state.js';
import { updateMapPosition, invalidateMapSize, updateArtisticStyle } from '../map/map-init.js';
import { searchLocation, formatCoords } from '../map/geocoder.js';

export function setupControls() {
	const searchInput = document.getElementById('search-input');
	const searchResults = document.getElementById('search-results');
	const latInput = document.getElementById('lat-input');
	const lonInput = document.getElementById('lon-input');
	const zoomSlider = document.getElementById('zoom-slider');
	const zoomValue = document.getElementById('zoom-value');

	const modeTile = document.getElementById('mode-tile');
	const modeArtistic = document.getElementById('mode-artistic');
	const tileSettings = document.getElementById('tile-settings');
	const artisticSettings = document.getElementById('artistic-settings');

	const themeSelect = document.getElementById('theme-select');
	const artisticThemeSelect = document.getElementById('artistic-theme-select');
	const artisticDesc = document.getElementById('artistic-desc');

	const zoomControlContainer = zoomSlider.parentElement;

	const labelsToggle = document.getElementById('show-labels-toggle');
	const overlayToggle = document.getElementById('overlay-bg-toggle');
	const customW = document.getElementById('custom-w');
	const customH = document.getElementById('custom-h');
	const presetBtns = document.querySelectorAll('.preset-btn');

	let searchTimeout;
	searchInput.addEventListener('input', (e) => {
		clearTimeout(searchTimeout);
		const query = e.target.value;
		if (query.length < 3) {
			searchResults.classList.add('hidden');
			return;
		}

		searchTimeout = setTimeout(async () => {
			const results = await searchLocation(query);
			if (results.length > 0) {
				searchResults.innerHTML = results.map(r => `
          <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${r.shortName}">
            ${r.name}
          </div>
        `).join('');
				searchResults.classList.remove('hidden');
			} else {
				searchResults.classList.add('hidden');
			}
		}, 500);
	});

	searchResults.addEventListener('click', (e) => {
		const item = e.target.closest('[data-lat]');
		if (item) {
			const lat = parseFloat(item.dataset.lat);
			const lon = parseFloat(item.dataset.lon);
			const name = item.dataset.name;

			updateState({ city: name.toUpperCase(), lat, lon });
			updateMapPosition(lat, lon);

			searchInput.value = name;
			searchResults.classList.add('hidden');
		}
	});

	latInput.addEventListener('change', (e) => {
		const lat = parseFloat(e.target.value);
		updateState({ lat });
		updateMapPosition(lat, state.lon);
	});

	lonInput.addEventListener('change', (e) => {
		const lon = parseFloat(e.target.value);
		updateState({ lon });
		updateMapPosition(state.lat, lon);
	});


	function sanitizeCoordInput(v) {
		if (!v) return v;
		v = String(v).replace(/,/g, '.');
		v = v.replace(/[^0-9.\-]/g, '');
		const hasMinus = v.indexOf('-') !== -1;
		v = v.replace(/\-/g, '');
		if (hasMinus) v = '-' + v;
		const firstDot = v.indexOf('.');
		if (firstDot !== -1) {
			v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '');
		}
		return v;
	}

	latInput.addEventListener('input', (e) => {
		const cleaned = sanitizeCoordInput(e.target.value);
		if (cleaned !== e.target.value) e.target.value = cleaned;
	});

	lonInput.addEventListener('input', (e) => {
		const cleaned = sanitizeCoordInput(e.target.value);
		if (cleaned !== e.target.value) e.target.value = cleaned;
	});

	zoomSlider.addEventListener('input', (e) => {
		const zoom = parseInt(e.target.value);
		updateState({ zoom });
		updateMapPosition(undefined, undefined, zoom);
	});

	modeTile.addEventListener('click', () => updateState({ renderMode: 'tile' }));
	modeArtistic.addEventListener('click', () => updateState({ renderMode: 'artistic' }));

	themeSelect.addEventListener('change', (e) => {
		updateState({ theme: e.target.value });
	});

	artisticThemeSelect.addEventListener('change', (e) => {
		updateState({ artisticTheme: e.target.value });
	});

	if (labelsToggle) {
		labelsToggle.addEventListener('change', (e) => {
			updateState({ showLabels: e.target.checked });
		});
	}

	if (overlayToggle) {
		overlayToggle.addEventListener('change', (e) => {
			updateState({ overlayBgEnabled: e.target.checked });
		});
	}

	presetBtns.forEach(btn => {
		btn.addEventListener('click', () => {
			const width = parseInt(btn.dataset.width);
			const height = parseInt(btn.dataset.height);
			updateState({ width, height });
		});
	});

	customW.addEventListener('change', (e) => updateState({ width: parseInt(e.target.value) || state.width }));
	customH.addEventListener('change', (e) => updateState({ height: parseInt(e.target.value) || state.height }));

	return (currentState) => {
		latInput.value = currentState.lat.toFixed(6);
		lonInput.value = currentState.lon.toFixed(6);
		zoomSlider.value = currentState.zoom;
		zoomValue.textContent = currentState.zoom;

		if (currentState.renderMode === 'tile') {
			modeTile.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm';
			modeArtistic.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-900';
			Array.from(tileSettings.children).forEach(c => c.classList.remove('hidden'));
			artisticSettings.classList.add('hidden');
		} else {
			modeTile.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-900';
			modeArtistic.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm';
			Array.from(tileSettings.children).forEach(c => {
				if (c.contains(zoomSlider) || c === zoomControlContainer) {
					c.classList.remove('hidden');
				} else {
					c.classList.add('hidden');
				}
			});
			artisticSettings.classList.remove('hidden');
		}

		themeSelect.value = currentState.theme;
		artisticThemeSelect.value = currentState.artisticTheme;

		const artisticTheme = getSelectedArtisticTheme();
		artisticDesc.textContent = artisticTheme.description;

		if (labelsToggle) labelsToggle.checked = !!currentState.showLabels;
		if (overlayToggle) overlayToggle.checked = !!currentState.overlayBgEnabled;
		customW.value = currentState.width;
		customH.value = currentState.height;
	};
}

let lastWidth = null;
let lastHeight = null;

export function updatePreviewStyles(currentState) {
	const posterContainer = document.getElementById('poster-container');
	const posterScaler = document.getElementById('poster-scaler');
	const displayCity = document.getElementById('display-city');
	const displayCoords = document.getElementById('display-coords');
	const overlay = document.getElementById('poster-overlay');
	const overlayBg = overlay.querySelector('.overlay-bg');
	const divider = document.getElementById('poster-divider');

	const theme = getSelectedTheme();
	const artisticTheme = getSelectedArtisticTheme();

	const isArtistic = currentState.renderMode === 'artistic';
	const mapPreview = document.getElementById('map-preview');
	const artisticMapDiv = document.getElementById('artistic-map');

	if (isArtistic) {
		mapPreview.style.visibility = 'hidden';
		artisticMapDiv.style.visibility = 'visible';
		artisticMapDiv.style.pointerEvents = 'auto';
		updateArtisticStyle(artisticTheme);
	} else {
		mapPreview.style.visibility = 'visible';
		artisticMapDiv.style.visibility = 'hidden';
		artisticMapDiv.style.pointerEvents = 'none';
	}

	const activeTheme = isArtistic ? artisticTheme : theme;

	const sizeChanged = lastWidth !== currentState.width || lastHeight !== currentState.height;
	lastWidth = currentState.width;
	lastHeight = currentState.height;

	posterContainer.style.width = `${currentState.width}px`;
	posterContainer.style.height = `${currentState.height}px`;
	posterContainer.style.backgroundColor = activeTheme.bg || activeTheme.background;

	const parent = posterScaler.parentElement;
	const padding = 120;
	const availableW = parent.clientWidth - padding;
	const availableH = parent.clientHeight - padding;

	const scaleW = availableW / currentState.width;
	const scaleH = availableH / currentState.height;
	const scale = Math.min(scaleW, scaleH, 1);

	posterScaler.style.transform = `scale(${scale})`;

	displayCity.textContent = currentState.city;
	displayCity.style.color = activeTheme.text || activeTheme.textColor;
	displayCoords.textContent = formatCoords(currentState.lat, currentState.lon);
	displayCoords.style.color = activeTheme.text || activeTheme.textColor;

	if (overlayBg) {
		if (currentState.overlayBgEnabled) {
			overlayBg.style.display = '';
			overlayBg.style.backgroundColor = activeTheme.overlayBg || activeTheme.background || activeTheme.bg;
			overlayBg.style.opacity = isArtistic ? '0.7' : '0.9';
		} else {
			overlayBg.style.display = 'none';
		}
	}
	if (divider) divider.style.backgroundColor = activeTheme.text || activeTheme.textColor;

	invalidateMapSize();

	if (sizeChanged) {
		setTimeout(() => {
			invalidateMapSize();
			updateMapPosition(currentState.lat, currentState.lon, currentState.zoom, { animate: false });
		}, 350);

		setTimeout(() => {
			invalidateMapSize();
			updateMapPosition(currentState.lat, currentState.lon, currentState.zoom, { animate: false });
		}, 550);
	}
}
