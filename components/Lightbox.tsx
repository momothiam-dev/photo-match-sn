'use client'

import { useState } from 'react'
import Image from 'next/image'

interface LightboxProps {
  images: string[]
  alt?: string
}

export function Lightbox({ images, alt = 'Photo' }: LightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images.length) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      {/* Thumbnail */}
      <div
        className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          {/* Image */}
          <div className="relative w-full max-w-4xl max-h-96">
            <Image
              src={images[currentIndex]}
              alt={alt}
              width={1200}
              height={800}
              className="w-full h-auto"
            />
          </div>

          {/* Navigation */}
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button
              onClick={goToPrevious}
              className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition"
            >
              ←
            </button>
            <button
              onClick={goToNext}
              className="pointer-events-auto bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition"
            >
              →
            </button>
          </div>

          {/* Compteur */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm pointer-events-none">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Fermer */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
