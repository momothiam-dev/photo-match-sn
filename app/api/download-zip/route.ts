import { NextRequest, NextResponse } from 'next/server'
import AdmZip from 'adm-zip'

export async function POST(request: NextRequest) {
  try {
    const { photoUrls, eventName } = await request.json()

    if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
      return NextResponse.json({ error: 'photoUrls requis' }, { status: 400 })
    }

    const zip = new AdmZip()

    // Télécharger chaque photo et l'ajouter au ZIP
    for (let i = 0; i < photoUrls.length; i++) {
      try {
        const photo = photoUrls[i]
        const response = await fetch(photo.url)
        if (!response.ok) throw new Error(`Échec download: ${photo.url}`)

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        zip.addFile(`${photo.filename || `photo-${i}.jpg`}`, buffer)
      } catch (err) {
        console.error(`Erreur téléchargement photo ${i}:`, err)
      }
    }

    const zipBuffer = zip.toBuffer()

    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${eventName || 'photos'}-${Date.now()}.zip"`,
      },
    })
  } catch (error) {
    console.error('Erreur création ZIP:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
