-- Prime Deportes — Supabase schema
-- Paste this into Supabase → SQL Editor → New query → Run.
-- Safe to re-run: everything uses IF NOT EXISTS / CREATE OR REPLACE.

-- ────────────────────────────────────────────────────────────────────────────
-- Leads (contact form submissions)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  company    TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT,
  pack       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────────────────────
-- Articles (admin-authored editorial content)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id         BIGSERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_desc  TEXT NOT NULL DEFAULT '',
  keywords   TEXT NOT NULL DEFAULT '',
  category   TEXT NOT NULL DEFAULT 'NOTICIAS',
  content    TEXT NOT NULL,
  image_url  TEXT,
  image_alt  TEXT,
  published  SMALLINT NOT NULL DEFAULT 0,
  author     TEXT NOT NULL DEFAULT 'Jorge Rodríguez',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-bump updated_at on every UPDATE so the app doesn't have to remember.
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_touch_updated_at ON articles;
CREATE TRIGGER articles_touch_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- RLS note
-- ────────────────────────────────────────────────────────────────────────────
-- The Next.js server uses the service_role key, which bypasses RLS.
-- RLS is therefore optional here. If you later expose these tables to the
-- anon key (e.g. for client-side reads), enable RLS and add read policies:
--
-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "public read published" ON articles
--   FOR SELECT USING (published = 1);
