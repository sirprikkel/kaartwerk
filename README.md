<p align="center">
  <!-- Logo placeholder: vervang door public/kaartwerk-logo.webp zodra beschikbaar -->
  <img src="public/logo.webp" alt="Kaartwerk logo" width="160">
</p>

<h1 align="center">Kaartwerk</h1>
<p align="center"><em>Jouw plek, jouw kunstwerk.</em></p>

---

## Wat is Kaartwerk?

Kaartwerk is een webshop waarmee je unieke kaartposters ontwerpt en bestelt van elke plek ter wereld. Kies je favoriete locatie, stel het thema en formaat in naar eigen smaak, en laat de poster direct aan huis bezorgen via print-on-demand. Ideaal als persoonlijk cadeau of als statement stuk aan de muur.

---

## Features

- **Locatie zoeken** — razendsnel wereldwijd zoeken via de Nominatim geocoder
- **20+ thema's** — van strakke minimalistische stijlen tot artistieke vectorthema's (Arctic Frost, Blueprint Classic, Sakura Bloom en meer)
- **Markers** — plaats en style meerdere locatiepinnen met instelbare iconen en groottes
- **Routes** — teken reisroutes en importeer GeoJSON-paden op de poster
- **Formaat & materiaal** — keuze uit gangbare posterformaten en papiersoorten
- **Mollie betalingen** — veilige checkout via iDEAL, creditcard en meer
- **Printful print-on-demand** — orders worden automatisch doorgezet naar Printful voor productie en verzending

---

## Tech Stack

| Laag | Technologie |
|---|---|
| **Frontend** | Vite 5 + Vanilla JS (ES Modules) + Tailwind CSS 3 |
| **Kaartrendering** | Leaflet (raster tiles) & MapLibre GL (vector stijlen) |
| **Backend** | Node.js + Express |
| **Database** | SQLite (via `better-sqlite3`) |
| **Betalingen** | Mollie API |
| **Print & verzending** | Printful API |
| **E-mail** | Resend |

---

## Getting Started

### Vereisten

- **Node.js** 18 of hoger
- **npm** (meegeleverd met Node.js)

### Frontend opstarten

```bash
# 1. Repository clonen
git clone https://github.com/sirprikkel/kaartwerk.git
cd kaartwerk

# 2. Afhankelijkheden installeren
npm install

# 3. Ontwikkelserver starten
npm run dev
```

De frontend is bereikbaar op `http://localhost:5173`.

### Backend opstarten

```bash
# Vanuit de project root
cd server

# Omgevingsvariabelen instellen
cp .env.example .env
# Vul de waarden in .env in (zie hieronder)

# Afhankelijkheden installeren
npm install

# Server starten
node index.js
```

De backend draait op `http://localhost:3001`.

### Omgevingsvariabelen (`.env`)

| Variabele | Beschrijving |
|---|---|
| `MOLLIE_API_KEY` | API-sleutel van je Mollie-account (`test_xxx` of `live_xxx`) |
| `PRINTFUL_API_KEY` | Privé API-sleutel van Printful |
| `RESEND_API_KEY` | API-sleutel voor transactionele e-mail via Resend |
| `BASE_URL` | Publieke URL van de frontend (bijv. `https://kaartwerk.nl`) |
| `PORT` | Poort waarop de backend luistert (standaard `3001`) |

---

## Projectstructuur

```
kaartwerk/
├── index.html              # Editor-pagina
├── landing.html            # Landingspagina
├── success.html            # Betaling geslaagd
├── cancel.html             # Betaling geannuleerd
├── main.js                 # Frontend entrypoint
├── style.css               # Globale stijlen
├── vite.config.js
├── public/
│   └── logo.webp
├── src/
│   ├── core/
│   │   ├── state.js        # Reactieve state (observer pattern)
│   │   ├── artistic-themes.js
│   │   ├── themes.js
│   │   ├── export.js       # Hoge-resolutie PNG export
│   │   ├── pricing.js
│   │   ├── output-presets.js
│   │   ├── routing.js
│   │   ├── marker-icons.js
│   │   └── utils.js
│   ├── map/
│   │   ├── map-init.js
│   │   ├── geocoder.js
│   │   ├── artistic-style.js
│   │   ├── marker-manager.js
│   │   └── route-manager.js
│   └── ui/
│       ├── form.js
│       └── checkout.js
└── server/
    ├── index.js            # Express server entrypoint
    ├── .env.example
    ├── db/
    │   └── index.js        # SQLite database
    ├── routes/
    │   ├── checkout.js     # Mollie checkout route
    │   └── webhook.js      # Mollie webhook & orderpipeline
    └── services/
        ├── pipeline.js     # Orchestratie: betaling → render → Printful
        ├── printful.js     # Printful API integratie
        ├── renderer.js     # Server-side posterrendering
        └── email.js        # Orderbevestiging via Resend
```

---

## Deployment

**Frontend — Vercel**

Verbind de repository met [Vercel](https://vercel.com). Vercel detecteert Vite automatisch. Stel de `BASE_URL` omgevingsvariabele in op je productiedomein.

**Backend — Railway**

Maak een nieuw project aan op [Railway](https://railway.app) en wijs naar de `server/` map. Voeg de omgevingsvariabelen toe via het Railway-dashboard. SQLite schrijft naar het bestandssysteem; gebruik Railway Volumes voor persistentie.

---

## Credits

Kaartwerk is geïnspireerd op:

- [originalankur/maptoposter](https://github.com/originalankur/maptoposter) — het originele concept
- [dimartarmizi/map-to-poster](https://github.com/dimartarmizi/map-to-poster) — de JavaScript-implementatie waarop dit project voortbouwt

---

## Licentie

Uitgebracht onder de [MIT-licentie](LICENSE).
