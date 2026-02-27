import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

mkdirSync(dataDir, { recursive: true });

const db = new Database(join(dataDir, 'kaartwerk.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id          TEXT PRIMARY KEY,
    email       TEXT NOT NULL,
    city        TEXT,
    country     TEXT,
    format      TEXT NOT NULL,
    material    TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    mollie_id   TEXT,
    printful_id TEXT,
    config_json TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export function createOrder({ id, email, city, country, format, material, mollie_id, config_json }) {
	const stmt = db.prepare(`
    INSERT INTO orders (id, email, city, country, format, material, status, mollie_id, config_json)
    VALUES (@id, @email, @city, @country, @format, @material, 'pending', @mollie_id, @config_json)
  `);
	stmt.run({ id, email, city, country, format, material, mollie_id, config_json: config_json ? JSON.stringify(config_json) : null });
}

export function getOrder(id) {
	return db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
}

export function updateOrderStatus(id, status) {
	db.prepare(`
    UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
  `).run(status, id);
}

export function getOrderByMollieId(mollieId) {
	return db.prepare('SELECT * FROM orders WHERE mollie_id = ?').get(mollieId);
}

export function updateOrderPrintfulId(id, printfulId) {
	db.prepare(`
    UPDATE orders SET printful_id = ?, updated_at = datetime('now') WHERE id = ?
  `).run(printfulId, id);
}

export function getOrderByPrintfulId(printfulId) {
	return db.prepare('SELECT * FROM orders WHERE printful_id = ?').get(printfulId);
}
