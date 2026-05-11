import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { getCloudinaryConfig } from '@/lib/cloudinary'
import { adminSavePhoto } from '@/lib/firestore-admin'

const config = getCloudinaryConfig()
cloudinary.config(config)

export async function POST(request: NextRequest) {
  try {
    const formData  = await request.formData()
    const file      = formData.get('file') as File | null
    const eventId   = formData.get('eventId') as string | null

    if (!file || !eventId) {
      return NextResponse.json({ error: 'Fichier et eventId requis' }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadResult = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `originals/${eventId}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { public_id: string; secure_url: string })
        }
      ).end(buffer)
    })

    const photoId = await adminSavePhoto({
      eventId,
      cloudinaryPublicId: uploadResult.public_id,
      thumbnailUrl: '',
      descriptor: [],
      hasDescriptor: false,
      filename: file.name,
    })

    return NextResponse.json({
      success: true,
      photoId,
      cloudinaryPublicId: uploadResult.public_id,
      originalUrl: uploadResult.secure_url,
    })

  } catch (error) {
    console.error('[Upload] Erreur :', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
