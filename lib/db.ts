import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(path.join(dataDir, 'leads.db'))

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    pack TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS articles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    meta_title  TEXT NOT NULL,
    meta_desc   TEXT NOT NULL,
    keywords    TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT 'Noticias',
    content     TEXT NOT NULL,
    image_url   TEXT,
    image_alt   TEXT,
    published   INTEGER NOT NULL DEFAULT 0,
    author      TEXT NOT NULL DEFAULT 'Jorge Rodríguez',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

export default db
