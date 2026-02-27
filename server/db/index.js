import initSqlJs from 'sql.js';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'kaartwerk.db');

mkdirSync(dataDir, { recursive: true });

const SQL = await initSqlJs();
const db = existsSync(dbPath)
  ? new SQL.Database(readFileSync(dbPath))
  : new SQL.Database();

function persist() {
  writeFileSync(dbPath, Buffer.from(db.export()));
}

db.run(`
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
persist();

function rowToObject(columns, values) {
  const obj = {};
  for (let i = 0; i < columns.length; i++) obj[columns[i]] = values[i];
  return obj;
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const obj = stmt.getAsObject();
    stmt.free();
    return obj;
  }
  stmt.free();
  return undefined;
}

export function createOrder({ id, email, city, country, format, material, mollie_id, config_json }) {
  db.run(
    `INSERT INTO orders (id, email, city, country, format, material, status, mollie_id, config_json)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [id, email, city ?? null, country ?? null, format, material, mollie_id ?? null, config_json ? JSON.stringify(config_json) : null]
  );
  persist();
}

export function getOrder(id) {
  return queryOne('SELECT * FROM orders WHERE id = ?', [id]);
}

export function updateOrderStatus(id, status) {
  db.run(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`, [status, id]);
  persist();
}

export function getOrderByMollieId(mollieId) {
  return queryOne('SELECT * FROM orders WHERE mollie_id = ?', [mollieId]);
}

export function updateOrderPrintfulId(id, printfulId) {
  db.run(`UPDATE orders SET printful_id = ?, updated_at = datetime('now') WHERE id = ?`, [printfulId, id]);
  persist();
}

export function getOrderByPrintfulId(printfulId) {
  return queryOne('SELECT * FROM orders WHERE printful_id = ?', [printfulId]);
}
