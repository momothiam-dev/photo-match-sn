'use client'

import { useState } from 'react'
import { QRCode } from 'react-qrcode-logo'

interface Props {
  eventId: string
  eventName: string
}

export default function QRCodeGenerator({ eventId, eventName }: Props) {
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://photo-match-sn.vercel.app')
  const galleryUrl = `${appUrl}/user/gallery/${eventId}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(galleryUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `QR-${eventName.replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <QRCode
          id="qr-canvas"
          value={galleryUrl}
          size={200}
          qrStyle="dots"
          eyeRadius={8}
          fgColor="#1E3A5F"
          logoImage="/logo.svg"
          logoWidth={40}
          removeQrCodeBehindLogo
        />
      </div>

      <p className="text-xs text-gray-400 text-center max-w-xs break-all">{galleryUrl}</p>

      <div className="flex gap-2 w-full">
        <button onClick={copyLink} className="btn-secondary flex-1 text-sm">
          {copied ? '✅ Copié !' : '🔗 Copier le lien'}
        </button>
        <button onClick={downloadQR} className="btn-primary flex-1 text-sm">
          ⬇️ Télécharger QR
        </button>
      </div>
    </div>
  )
}
