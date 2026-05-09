import { NextRequest, NextResponse } from 'next/server'

const ipDownloads: Record<string, { count: number; resetTime: number }> = {}
const MAX_DOWNLOADS_PER_IP = 20 // Max 20 téléchargements par jour
const RESET_TIME = 24 * 60 * 60 * 1000 // 24h

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()

    if (!ipDownloads[ip]) {
      ipDownloads[ip] = { count: 0, resetTime: now + RESET_TIME }
    }

    const ipData = ipDownloads[ip]

    // Réinitialiser si dépassé le délai
    if (now > ipData.resetTime) {
      ipData.count = 0
      ipData.resetTime = now + RESET_TIME
    }

    ipData.count++

    if (ipData.count > MAX_DOWNLOADS_PER_IP) {
      return NextResponse.json(
        { error: 'Limite de téléchargements dépassée. Réessayez demain.' },
        { status: 429 }
      )
    }

    return NextResponse.json({
      success: true,
      remaining: MAX_DOWNLOADS_PER_IP - ipData.count,
    })
  } catch (error) {
    console.error('Erreur rate limiting:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
