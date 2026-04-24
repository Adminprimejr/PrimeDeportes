import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

function buildSystemPrompt(): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return `Eres el editor senior de contenido de Prime Deportes, un medio hispano de deportes con el nivel editorial de ESPN Deportes y la pasión del periodismo latino. Cubres TODOS los deportes: fútbol (Mundial, Champions, Libertadores, MLS, Liga MX), béisbol (MLB, LIDOM), básquetbol (NBA), boxeo, NFL, Fórmula 1, tenis y cualquier otro deporte relevante para la audiencia hispana.

FECHA DE HOY: ${dateStr}
Tienes acceso a búsqueda en tiempo real de Google. Úsala para obtener las últimas noticias, estadísticas actuales y datos verificados sobre cualquier tema que Jorge quiera cubrir. Escribe siempre con información ACTUAL — no uses datos desactualizados de tu entrenamiento si hay algo más reciente disponible.

REGLA CRÍTICA DE FUENTES: Si Jorge te comparte una URL, pega el texto de un artículo, o cita una fuente reciente, ESA INFORMACIÓN ES AUTORITARIA. Tus datos de entrenamiento están desactualizados y no reflejan la realidad deportiva de hoy. Nunca contradigas a Jorge con datos antiguos — él tiene la verdad. Si te encuentras escribiendo "en realidad...", "según mis datos...", o "creo que todavía..." para corregirlo, DETENTE: estás equivocado. Acepta los hechos que Jorge te comparte y escribe el artículo basándote en ellos, complementando con búsqueda de Google en tiempo real para datos adicionales. Ejemplos de cosas que cambian seguido y donde SIEMPRE debes confiar en la fuente de Jorge: el club actual de un jugador, resultados recientes, rosters, estadísticas de la temporada, fichajes.

CONTEXTO DEL SITIO:
- Prime Deportes es un medio deportivo hispano. Cubrimos de forma amplia cualquier deporte que interese al lector latino en EE.UU., México, Colombia y Latinoamérica.
- El Mundial FIFA 2026 (11 junio – 19 julio 2026, 16 sedes USA/México/Canadá, 48 selecciones) es el evento estrella para el negocio publicitario — escribe de él con profundidad cuando Jorge te lo pida, pero NO fuerces el ángulo Mundial en artículos que no lo necesitan.
- Audiencia principal: fanáticos hispanos en EE.UU., Colombia y México.
- El cierre de ventas publicitarias del Mundial 2026 es el 1 de junio de 2026 (usa este dato solo si el artículo habla de marketing o del Mundial).

REGLA CLAVE: Escribe sobre el deporte/tema EXACTO que Jorge pida. Si pide un artículo sobre la MLB, escribe sobre béisbol — no desvíes a fútbol. Si pide NBA, cubre NBA. El Mundial 2026 es un tema más, no un filtro obligatorio.

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
2. Contexto — qué está pasando ahora mismo y por qué importa hoy (2-3 párrafos)
3. El núcleo — los detalles que importan, con datos verificables y actuales (3-4 párrafos con subheadings)
4. Una perspectiva única — ángulo editorial de Prime Deportes
5. Cierre emocional — por qué le importa al lector hispano en EE.UU.

REGLAS DE ESCRITURA:
- Español neutro (México, Colombia, EE.UU.) — no jerga regional exclusiva
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
}

// Models that support Google Search grounding — tried first
const SEARCH_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
]

// Full fallback list (no search) — used if all search-enabled models fail
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-lite-001',
]

// Gemini 2.x uses `googleSearch`; the older `googleSearchRetrieval` name is
// for Gemini 1.5 and is silently rejected by 2.x models — which was leaving
// every generation with zero grounding and stale training data.
const SEARCH_TOOL = [{ googleSearch: {} }]

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
  let searchText = text
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) searchText = fenceMatch[1].trim()

  const jsonStart = searchText.indexOf('{')
  const jsonEnd = searchText.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd <= jsonStart) return null

  const rawJson = searchText.slice(jsonStart, jsonEnd + 1)

  try {
    const parsed = JSON.parse(rawJson)
    if (parsed.slug && parsed.title && parsed.content) return parsed
  } catch { /* fall through */ }

  try {
    const parsed = JSON.parse(sanitizeJsonString(rawJson))
    if (parsed.slug && parsed.title && parsed.content) return parsed
  } catch { /* fall through */ }

  return null
}

function isQuotaError(msg: string) {
  return msg.includes('429') || msg.includes('quota') || msg.includes('503')
    || msg.includes('overload') || msg.includes('unavailable') || msg.includes('resource')
    || msg.includes('busy') || msg.includes('rate')
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json() as { messages: GeminiMessage[] }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const systemInstruction = buildSystemPrompt()

  // Build history — Gemini requires it to start with 'user'
  let history = messages.slice(0, -1).map((m) => ({
    role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
    parts: [{ text: m.content }],
  }))
  while (history.length > 0 && history[0].role !== 'user') {
    history = history.slice(1)
  }
  const lastMessage = messages[messages.length - 1]

  // ── Phase 1: Try with Google Search grounding ──────────────────────────────
  for (const modelName of SEARCH_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: SEARCH_TOOL as any,
      })
      const chat = model.startChat({ history })
      const result = await chat.sendMessage(lastMessage.content)
      const text = result.response.text()
      const article = extractArticle(text)
      console.log(`[generate] ✓ search+model: ${modelName}`)
      return NextResponse.json({ text, article, model: modelName, searchUsed: true })
    } catch (err: unknown) {
      const errMsg = (err instanceof Error ? err.message : String(err)).toLowerCase()
      if (isQuotaError(errMsg)) {
        console.warn(`[generate] ${modelName} (search) quota, trying next...`)
        continue
      }
      // Hard error on search (e.g. model doesn't support it) — break out to Phase 2
      console.warn(`[generate] ${modelName} search failed (${errMsg.slice(0, 80)}), falling back to no-search`)
      break
    }
  }

  // ── Phase 2: Fallback — no search grounding ────────────────────────────────
  let lastErr: Error | null = null
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, systemInstruction })
      const chat = model.startChat({ history })
      const result = await chat.sendMessage(lastMessage.content)
      const text = result.response.text()
      const article = extractArticle(text)
      console.log(`[generate] ✓ no-search model: ${modelName}`)
      return NextResponse.json({ text, article, model: modelName, searchUsed: false })
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      const errMsg = lastErr.message.toLowerCase()
      if (isQuotaError(errMsg)) {
        console.warn(`[generate] ${modelName} busy/quota, trying next...`)
        continue
      }
      console.error('[generate/route] hard error on', modelName, err)
      return NextResponse.json({ error: lastErr.message }, { status: 500 })
    }
  }

  console.error('[generate/route] all models failed', lastErr?.message)
  return NextResponse.json({
    error: 'La IA está muy ocupada en este momento. Espera 1-2 minutos e intenta de nuevo.',
  }, { status: 503 })
}
