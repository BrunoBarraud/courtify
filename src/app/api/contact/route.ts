import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'

const FROM = process.env.SENDGRID_FROM_EMAIL
const API_KEY = process.env.SENDGRID_API_KEY

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY || !FROM) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const body = await req.json()
    const { name, email, subject, message } = body || {}

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    sgMail.setApiKey(API_KEY)

    const content = {
      to: FROM,
      from: FROM,
      subject: `[Contacto] ${subject}`,
      text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p>${message.replace(/\n/g, '<br />')}</p>`,
    }

    await sgMail.send(content)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact form error', err)
    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 })
  }
}
