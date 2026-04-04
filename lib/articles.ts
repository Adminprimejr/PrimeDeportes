import db from './db'

export interface Article {
  id: number
  slug: string
  title: string
  meta_title: string
  meta_desc: string
  keywords: string
  category: string
  content: string
  image_url: string | null
  image_alt: string | null
  published: 0 | 1
  author: string
  created_at: string
  updated_at: string
}

export type ArticleInput = Omit<Article, 'id' | 'created_at' | 'updated_at'>

export function getPublishedArticles(limit = 100): Article[] {
  return db
    .prepare('SELECT * FROM articles WHERE published = 1 ORDER BY created_at DESC LIMIT ?')
    .all(limit) as Article[]
}

export function getArticleBySlug(slug: string): Article | null {
  return (db.prepare('SELECT * FROM articles WHERE slug = ? AND published = 1').get(slug) as Article) ?? null
}

export function getAllArticles(): Article[] {
  return db.prepare('SELECT * FROM articles ORDER BY created_at DESC').all() as Article[]
}

export function getArticleById(id: number): Article | null {
  return (db.prepare('SELECT * FROM articles WHERE id = ?').get(id) as Article) ?? null
}

export function createArticle(data: ArticleInput): Article {
  const result = db.prepare(`
    INSERT INTO articles (slug, title, meta_title, meta_desc, keywords, category, content, image_url, image_alt, published, author)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.slug, data.title, data.meta_title, data.meta_desc,
    data.keywords, data.category, data.content,
    data.image_url ?? null, data.image_alt ?? null,
    data.published, data.author,
  )
  return getArticleById(result.lastInsertRowid as number)!
}

export function updateArticle(id: number, data: Partial<ArticleInput>): Article {
  const article = getArticleById(id)
  if (!article) throw new Error(`Article ${id} not found`)
  const merged = { ...article, ...data }
  db.prepare(`
    UPDATE articles SET
      slug = ?, title = ?, meta_title = ?, meta_desc = ?,
      keywords = ?, category = ?, content = ?,
      image_url = ?, image_alt = ?, published = ?, author = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    merged.slug, merged.title, merged.meta_title, merged.meta_desc,
    merged.keywords, merged.category, merged.content,
    merged.image_url ?? null, merged.image_alt ?? null,
    merged.published, merged.author, id,
  )
  return getArticleById(id)!
}

export function deleteArticle(id: number): void {
  db.prepare('DELETE FROM articles WHERE id = ?').run(id)
}

export function togglePublish(id: number, published: 0 | 1): void {
  db.prepare('UPDATE articles SET published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(published, id)
}

export function getStats(): { articles: number; published: number; leads: number } {
  const articles = (db.prepare('SELECT COUNT(*) as c FROM articles').get() as { c: number }).c
  const published = (db.prepare('SELECT COUNT(*) as c FROM articles WHERE published = 1').get() as { c: number }).c
  const leads = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as { c: number }).c
  return { articles, published, leads }
}

export function getLeads() {
  return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all()
}
