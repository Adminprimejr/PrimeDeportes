import { supabase } from './supabase'

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

export interface Lead {
  id: number
  name: string
  company: string
  email: string
  message: string | null
  pack: string | null
  created_at: string
}

// Apply safe defaults for NOT NULL columns when the caller (AI, stale localStorage,
// etc.) forgets to send them. Keeps the server as the last line of defense.
function withDefaults(data: Partial<ArticleInput>): ArticleInput {
  return {
    slug: data.slug ?? '',
    title: data.title ?? '',
    meta_title: data.meta_title || data.title || '',
    meta_desc: data.meta_desc ?? '',
    keywords: data.keywords ?? '',
    category: data.category || 'NOTICIAS',
    content: data.content ?? '',
    image_url: data.image_url ?? null,
    image_alt: data.image_alt ?? null,
    published: data.published === 1 ? 1 : 0,
    author: data.author?.trim() || 'Jorge Rodríguez',
  }
}

function unwrap<T>(label: string, data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(`[${label}] ${error.message}`)
  if (data === null) throw new Error(`[${label}] no data returned`)
  return data
}

export async function getPublishedArticles(limit = 100): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('published', 1)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`[getPublishedArticles] ${error.message}`)
  return (data ?? []) as Article[]
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', 1)
    .maybeSingle()
  if (error) throw new Error(`[getArticleBySlug] ${error.message}`)
  return (data as Article) ?? null
}

export async function getAllArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`[getAllArticles] ${error.message}`)
  return (data ?? []) as Article[]
}

export async function getArticleById(id: number): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`[getArticleById] ${error.message}`)
  return (data as Article) ?? null
}

export async function createArticle(data: Partial<ArticleInput>): Promise<Article> {
  const safe = withDefaults(data)
  const { data: row, error } = await supabase
    .from('articles')
    .insert(safe)
    .select()
    .single()
  return unwrap('createArticle', row as Article, error)
}

export async function updateArticle(id: number, patch: Partial<ArticleInput>): Promise<Article> {
  const existing = await getArticleById(id)
  if (!existing) throw new Error(`Article ${id} not found`)
  const merged = withDefaults({ ...existing, ...patch })
  const { data: row, error } = await supabase
    .from('articles')
    .update(merged)
    .eq('id', id)
    .select()
    .single()
  return unwrap('updateArticle', row as Article, error)
}

export async function deleteArticle(id: number): Promise<void> {
  const { error } = await supabase.from('articles').delete().eq('id', id)
  if (error) throw new Error(`[deleteArticle] ${error.message}`)
}

export async function togglePublish(id: number, published: 0 | 1): Promise<void> {
  const { error } = await supabase.from('articles').update({ published }).eq('id', id)
  if (error) throw new Error(`[togglePublish] ${error.message}`)
}

export async function getStats(): Promise<{ articles: number; published: number; leads: number }> {
  const [articlesRes, publishedRes, leadsRes] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('published', 1),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
  ])
  if (articlesRes.error) throw new Error(`[getStats.articles] ${articlesRes.error.message}`)
  if (publishedRes.error) throw new Error(`[getStats.published] ${publishedRes.error.message}`)
  if (leadsRes.error) throw new Error(`[getStats.leads] ${leadsRes.error.message}`)
  return {
    articles: articlesRes.count ?? 0,
    published: publishedRes.count ?? 0,
    leads: leadsRes.count ?? 0,
  }
}

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`[getLeads] ${error.message}`)
  return (data ?? []) as Lead[]
}

export async function createLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('leads').insert(lead)
  if (error) throw new Error(`[createLead] ${error.message}`)
}
