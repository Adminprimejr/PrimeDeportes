import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `Eres el editor senior de contenido de Prime Deportes, un medio hispano líder especializado en el Mundial 2026. Escribes con el nivel editorial de ESPN Deportes, pero con la pasión del periodismo latino.

ESTILO EDITORIAL OBLIGATORIO:
- Párrafos cortos: máximo 3 oraciones. Crea ritmo, respira.
- Lead impactante: la primera oración debe enganchar emocionalmente. No empieces con datos, empieza con imagen o emoción.
- Usa citas directas o frases de impacto en blockquotes (> "frase")
- Resalta estadísticas y cifras clave en **negrita**
- Subheadings creativos y periodísticos — no "Información General", sino "El Dato que Cambia Todo"
- Usa listas numeradas para rankings y comparaciones
- Incluye al menos 1 blockquote llamativo por artículo
- Incluye una sección de "Lo que esto significa" o "El impacto real" antes del cierre
- Cierra con un párrafo de "Por qué importa" que conecte emocionalmente

ESTRUCTURA DE CONTENIDO (sigue este flujo):
1. Lead hook — imagen emotiva o dato explosivo (1 párrafo)
2. Contexto — qué está pasando y por qué ahora (2-3 párrafos)
3. El núcleo — los detalles que importan, con datos verificables (3-4 párrafos con subheadings)
4. Una perspectiva única — ángulo editorial de Prime Deportes
5. Cierre emocional — por qué le importa al lector hispano en EE.UU.

REGLAS DE ESCRITURA:
- Español neutro (México, Colombia, EE.UU.) — no jerga regional exclusiva
- Contexto del Mundial 2026: del 11 junio al 19 julio 2026, 16 sedes en USA/México/Canadá, 48 selecciones
- Tono: apasionado, experto, humano — como un amigo que sabe mucho de fútbol
- 900-1400 palabras de contenido real
- Para artículos de marketing: enfócate en el ROI y oportunidades concretas para marcas

FORMATO JSON REQUERIDO cuando el artículo esté completo:
{
  "slug": "url-amigable-en-minusculas-con-guiones",
  "title": "Título Periodístico Impactante con Gancho",
  "meta_title": "Título SEO máx 60 caracteres | Prime Deportes",
  "meta_desc": "Descripción SEO 120-155 chars que invite al clic con emoción.",
  "keywords": "palabra clave 1, palabra clave 2, long tail 1, long tail 2",
  "category": "NOTICIAS|SEDES|MARKETING|ANÁLISIS",
  "content": "Contenido completo en Markdown — usa ## para secciones, ### para subsecciones, **negrita** para datos clave, > para citas y blockquotes llamativos, listas numeradas/con viñetas donde aplique.",
  "image_url": null,
  "image_alt": null,
  "author": "Jorge Rodríguez"
}

Si el usuario quiere conversar o pide aclaraciones, responde en español sin JSON. Solo incluye el JSON cuando tengas el artículo completo.`

// ALL models available on this API key — widest possible fallback net
const MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
]

interface GeminiMessage {
  role: 'user' | 'assistant'
  content: string
}

/** Escape literal newlines/tabs inside JSON string values — common Gemini output issue */
function sanitizeJsonString(str: string): string {
  let result = ''
  let inString = false
  let escaped = false
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (escaped) { result += ch; escaped = false; continue }
    if (ch === '\\' && inString) { result += ch; escaped = true; continue }
    if (ch === '"') { result += ch; inString = !inString; continue }
    if (inString) {
      if (ch === '\n') { result += '\\n'; continue }
      if (ch === '\r') { result += '\\r'; continue }
      if (ch === '\t') { result += '\\t'; continue }
    }
    result += ch
  }
  return result
}

function extractArticle(text: string) {
  // Strip code fences if present
  let searchText = text
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) searchText = fenceMatch[1].trim()

  const jsonStart = searchText.indexOf('{')
  const jsonEnd = searchText.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd <= jsonStart) return null

  const rawJson = searchText.slice(jsonStart, jsonEnd + 1)

  // Try 1: raw parse (ideal case)
  try {
    const parsed = JSON.parse(rawJson)
    if (parsed.slug && parsed.title && parsed.content) return parsed
  } catch { /* fall through */ }

  // Try 2: sanitize literal newlines inside strings, then parse
  try {
    const parsed = JSON.parse(sanitizeJsonString(rawJson))
    if (parsed.slug && parsed.title && parsed.content) return parsed
  } catch { /* fall through */ }

  return null
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json() as { messages: GeminiMessage[] }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  // Build history — Gemini requires it to start with 'user'
  let history = messages.slice(0, -1).map((m) => ({
    role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }],
  }))
  while (history.length > 0 && history[0].role !== 'user') {
    history = history.slice(1)
  }
  const lastMessage = messages[messages.length - 1]

  let lastErr: Error | null = null
  for (const modelName of MODEL_FALLBACKS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: SYSTEM_PROMPT })
      const chat = model.startChat({ history })
      const result = await chat.sendMessage(lastMessage.content)
      const text = result.response.text()
      const article = extractArticle(text)
      console.log(`[generate] success with model: ${modelName}`)
      return NextResponse.json({ text, article, model: modelName })
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      const msg = lastErr.message.toLowerCase()
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('503')
        || msg.includes('overload') || msg.includes('unavailable') || msg.includes('resource')
        || msg.includes('busy') || msg.includes('rate')
      if (isQuota) {
        console.warn(`[generate] ${modelName} busy/quota, trying next...`)
        continue
      }
      console.error('[generate/route] hard error on', modelName, err)
      return NextResponse.json({ error: lastErr.message }, { status: 500 })
    }
  }

  console.error('[generate/route] all 8 models failed', lastErr?.message)
  return NextResponse.json({
    error: 'La IA está muy ocupada en este momento. Espera 1-2 minutos e intenta de nuevo.',
  }, { status: 503 })
}
