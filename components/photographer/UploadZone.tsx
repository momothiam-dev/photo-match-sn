'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { getPreviewUrl } from '@/lib/cloudinary'
import { loadFaceApiModels, getFaceDescriptor, descriptorToArray } from '@/lib/faceapi'

interface UploadProgress {
  filename: string
  status: 'pending' | 'uploading' | 'indexing' | 'done' | 'error' | 'no-face'
  progress: number
  file?: File
  thumbnailUrl?: string
  error?: string
}

interface Props {
  eventId: string
  photographerName: string
  onComplete?: (total: number) => void
}

export default function UploadZone({ eventId, photographerName, onComplete }: Props) {
  const [files, setFiles]     = useState<UploadProgress[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [modelsReady, setModelsReady] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map(f => ({
      filename: f.name,
      status:   'pending' as const,
      progress: 0,
      file: f, // Garder la référence au File
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.webp'] },
    disabled: isRunning,
  })

  const resizeImage = (file: File, maxWidth = 2000, maxHeight = 2000): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Canvas toBlob failed'))
          }, 'image/jpeg', 0.85) // 85% quality is a good compromise
        }
      }
      reader.onerror = reject
    })
  }

  const processAll = async () => {
    if (isRunning) return
    setIsRunning(true)
    setUploadedCount(0)

    // Charger les modèles IA une seule fois
    if (!modelsReady) {
      console.log('📦 Chargement des modèles face-api.js...')
      try {
        await loadFaceApiModels()
        setModelsReady(true)
        console.log('✅ Modèles chargés')
      } catch (err) {
        console.error('❌ Erreur chargement modèles:', err)
      }
    }

    const pending = files.filter(f => f.status === 'pending' && 'file' in f) as (UploadProgress & { file: File })[]

    for (const fileProgress of pending) {
      try {
        // Redimensionner avant upload pour économiser Cloudinary (Budget 0)
        setFiles(prev => prev.map(f =>
          f.filename === fileProgress.filename
            ? { ...f, status: 'uploading', progress: 10 }
            : f
        ))

        const resizedBlob = await resizeImage(fileProgress.file)
        
        setFiles(prev => prev.map(f =>
          f.filename === fileProgress.filename
            ? { ...f, progress: 20 }
            : f
        ))

        const formData = new FormData()
        formData.append('file', resizedBlob, fileProgress.filename)
        formData.append('eventId', eventId)
        formData.append('photographerName', photographerName)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.statusText}`)
        }

        const uploadData = await uploadRes.json()
        console.log('✅ Photo uploadée:', uploadData.photoId)

        // Charger l'image et extraire le descripteur
        setFiles(prev => prev.map(f =>
          f.filename === fileProgress.filename
            ? { ...f, status: 'indexing', progress: 60 }
            : f
        ))

        // Créer une image pour l'analyse faciale
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = uploadData.originalUrl

        img.onload = async () => {
          try {
            const descriptor = await getFaceDescriptor(img)

            if (!descriptor) {
              setFiles(prev => prev.map(f =>
                f.filename === fileProgress.filename
                  ? { ...f, status: 'no-face', progress: 100 }
                  : f
              ))
              console.warn('⚠️ Aucun visage détecté')
              return
            }

            // Envoyer le descripteur
            const indexRes = await fetch('/api/index-descriptor', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                photoId: uploadData.photoId,
                descriptor: descriptorToArray(descriptor),
              }),
            })

            if (indexRes.ok) {
              setFiles(prev => prev.map(f =>
                f.filename === fileProgress.filename
                  ? { ...f, status: 'done', progress: 100 }
                  : f
              ))
              setUploadedCount(prev => prev + 1)
              console.log('✅ Photo indexée')
            } else {
              throw new Error('Index failed')
            }
          } catch (err) {
            console.error('❌ Erreur indexation:', err)
            setFiles(prev => prev.map(f =>
              f.filename === fileProgress.filename
                ? { ...f, status: 'error', error: String(err), progress: 100 }
                : f
            ))
          }
        }

        img.onerror = () => {
          setFiles(prev => prev.map(f =>
            f.filename === fileProgress.filename
              ? { ...f, status: 'error', error: 'Erreur chargement image', progress: 100 }
              : f
          ))
        }
      } catch (err) {
        console.error('❌ Erreur upload:', err)
        setFiles(prev => prev.map(f =>
          f.filename === fileProgress.filename
            ? { ...f, status: 'error', error: String(err), progress: 100 }
            : f
        ))
      }
    }

    setIsRunning(false)
    onComplete?.(uploadedCount)
  }

  const stats = {
    total:    files.length,
    done:     files.filter(f => f.status === 'done').length,
    error:    files.filter(f => f.status === 'error' || f.status === 'no-face').length,
    pending:  files.filter(f => f.status === 'pending').length,
  }

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
          ${isDragActive
            ? 'border-brand-blue bg-brand-light scale-[1.01]'
            : 'border-gray-200 hover:border-brand-blue hover:bg-gray-50'
          }
          ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-5xl mb-4">{isDragActive ? '📂' : '🖼️'}</div>
        <p className="font-semibold text-gray-700 text-lg mb-1">
          {isDragActive ? 'Déposez les photos ici' : 'Glissez vos photos ici'}
        </p>
        <p className="text-gray-400 text-sm">
          JPEG, PNG, HEIC — jusqu&apos;à 20 Mo par photo
        </p>
        <button
          type="button"
          className="mt-4 btn-secondary text-sm"
          onClick={e => e.stopPropagation()}
        >
          Ou parcourir les fichiers
        </button>
      </div>

      {/* Stats */}
      {files.length > 0 && (
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{stats.total} photo{stats.total > 1 ? 's' : ''} sélectionnée{stats.total > 1 ? 's' : ''}</span>
          {stats.done   > 0 && <span className="badge-success">{stats.done} traitée{stats.done > 1 ? 's' : ''}</span>}
          {stats.error  > 0 && <span className="badge bg-red-100 text-red-700">{stats.error} erreur{stats.error > 1 ? 's' : ''}</span>}
          {stats.pending > 0 && <span className="badge-pending">{stats.pending} en attente</span>}
        </div>
      )}

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
              {/* Icône statut */}
              <span className="text-lg flex-shrink-0">
                {f.status === 'pending'   && '⏳'}
                {f.status === 'uploading' && '⬆️'}
                {f.status === 'indexing'  && '🧠'}
                {f.status === 'done'      && '✅'}
                {f.status === 'no-face'   && '🚫'}
                {f.status === 'error'     && '❌'}
              </span>

              {/* Nom fichier */}
              <span className="text-sm text-gray-700 flex-1 truncate">{f.filename}</span>

              {/* Statut texte */}
              <span className="text-xs text-gray-400 flex-shrink-0">
                {f.status === 'pending'   && 'En attente'}
                {f.status === 'uploading' && 'Upload...'}
                {f.status === 'indexing'  && 'Analyse IA...'}
                {f.status === 'done'      && 'Indexée'}
                {f.status === 'no-face'   && 'Aucun visage'}
                {f.status === 'error'     && 'Erreur'}
              </span>

              {/* Barre de progression */}
              {(f.status === 'uploading' || f.status === 'indexing') && (
                <div className="w-16 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
                  <div
                    className="bg-brand-blue h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bouton lancer */}
      {stats.pending > 0 && (
        <button
          onClick={processAll}
          disabled={isRunning}
          className="btn-primary w-full"
        >
          {isRunning
            ? `Traitement en cours...`
            : `Lancer l'upload et l'indexation IA (${stats.pending} photos)`
          }
        </button>
      )}
    </div>
  )
}
