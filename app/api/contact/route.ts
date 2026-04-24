import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createLead } from '@/lib/articles'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
const TO = process.env.RESEND_TO_EMAIL || 'journalist@primedeportes.com'

// Prevent XSS in email HTML by escaping user-supplied strings
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, company, email, message, pack } = body

    if (!name || !email || !company) {
      return NextResponse.json({ error: 'Nombre, empresa y email son requeridos.' }, { status: 400 })
    }

    await createLead({ name, company, email, message: message || null, pack: pack || null })

    if (resend) {
      await resend.emails.send({
        from: `Prime Deportes <${FROM}>`,
        to: TO,
        subject: `Nueva solicitud publicitaria: ${company}`,
        html: `
          <h2 style="color:#F4C430;">Nueva solicitud — Prime Deportes Mundial 2026</h2>
          <p><strong>Nombre:</strong> ${esc(name)}</p>
          <p><strong>Empresa:</strong> ${esc(company)}</p>
          <p><strong>Email:</strong> ${esc(email)}</p>
          <p><strong>Paquete de interés:</strong> ${esc(pack || 'No especificado')}</p>
          <p><strong>Mensaje:</strong> ${esc(message || 'Sin mensaje')}</p>
        `,
      })

      await resend.emails.send({
        from: `Jorge Rodríguez — Prime Deportes <${FROM}>`,
        to: email,
        subject: 'Recibimos tu solicitud — Prime Deportes Mundial 2026',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#050B14;color:#fff;padding:40px;">
            <div style="font-size:28px;font-weight:900;font-style:italic;margin-bottom:24px;">
              PRIME<span style="color:#F4C430;">DEPORTES</span>
            </div>
            <p>Hola ${esc(name)},</p>
            <p>Recibimos tu solicitud y estamos revisando la mejor estrategia para <strong>${esc(company)}</strong> durante el Mundial 2026.</p>
            <p>Te escribiré personalmente en menos de 24 horas para coordinar una llamada.</p>
            <p>Si necesitas respuesta inmediata:<br/>
              📱 WhatsApp: <a href="https://wa.me/17373512340" style="color:#F4C430;">+1 (737) 351-2340</a><br/>
              📧 Email: <a href="mailto:journalist@primedeportes.com" style="color:#F4C430;">journalist@primedeportes.com</a>
            </p>
            <br/>
            <p style="border-top:2px solid #F4C430;padding-top:16px;">
              <strong>Jorge Rodríguez</strong><br/>
              Director General, Prime Deportes<br/>
              <span style="color:#F4C430;">⚽ El Mundial se juega en Prime Deportes</span>
            </p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[contact/route]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
