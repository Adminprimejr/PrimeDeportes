import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'

async function isAuthed(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return !!token && verifyToken(token)
}

const SYSTEM_PROMPT = `Eres el editor de contenido de Prime Deportes, un medio hispano especializado en el Mundial 2026.
Tu rol es ayudar a Jorge Rodríguez a crear artículos editoriales de alta calidad en español optimizados para SEO.

Cuando generes contenido debes:
1. Escribir en español neutro (comprensible para hispanos de México, Colombia, EE.UU.)
2. Seguir las mejores prácticas de SEO: un H1 implícito en el título, H2/H3 bien estructurados, 800-1500 palabras
3. Incluir datos verificables y contexto del Mundial 2026 (del 11 junio al 19 julio 2026, 16 sedes en USA/México/Canadá)
4. Mantener el tono editorial de Prime Deportes: apasionado, informativo, orientado al mercado hispano en EE.UU.
5. Para artículos de marketing/publicidad: enfocarte en oportunidades para marcas que quieren conectar con audiencias hispanas

Cuando el usuario te pide un artículo, responde SIEMPRE con un JSON válido con esta estructura exacta:
{
  "slug": "url-amigable-del-articulo",
  "title": "Título del Artículo en Formato Título",
  "meta_title": "Título SEO de máximo 60 caracteres | Prime Deportes",
  "meta_desc": "Descripción SEO entre 120 y 155 caracteres que invite al clic.",
  "keywords": "palabra1, palabra2, palabra3, frase larga 1, frase larga 2",
  "category": "NOTICIAS|SEDES|MARKETING|ANÁLISIS",
  "content": "Contenido completo en Markdown con ## y ### para secciones, **negritas**, listas, etc.",
  "image_url": null,
  "image_alt": null,
  "author": "Jorge Rodríguez"
}

Si el usuario solo quiere conversar o pide aclaraciones, responde normalmente en español sin JSON.
Solo incluye el JSON cuando tengas el artículo completo listo.`

interface GeminiMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(req: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await req.json() as { messages: GeminiMessage[] }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    // Convert messages to Gemini format (user/model roles)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const lastMessage = messages[messages.length - 1]
    const chat = model.startChat({ history })
    const result = await chat.sendMessage(lastMessage.content)
    const text = result.response.text()

    // Robustly extract JSON article — look for the outermost JSON object containing "slug" and "content"
    let article = null
    const jsonMatch = text.match(/\{[\s\S]*?"slug"[\s\S]*?"content"[\s\S]*?\}(?=\s*$|\s*\n)/) || text.match(/\{[\s\S]*?"slug"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        article = JSON.parse(jsonMatch[0])
        // Validate required fields exist
        if (!article.slug || !article.title || !article.content) article = null
      } catch {
        article = null
      }
    }

    return NextResponse.json({ text, article })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generando artículo'
    console.error('[generate/route]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
