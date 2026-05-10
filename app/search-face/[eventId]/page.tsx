'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getEventDescriptors, getEvent } from '@/lib/firestore'
import { loadFaceApiModels, getFaceDescriptor, compareFaces, arrayToDescriptor } from '@/lib/faceapi'
import type { Event } from '@/lib/types'
import { Upload, Camera, Search, CheckCircle, X, RotateCcw, ShoppingCart, AlertCircle, Loader, CheckCircle2, Download, Loader2 } from 'lucide-react'
import { BackButton } from '@/components/BackButton'

export default function SearchFacePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webcamActive, setWebcamActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEvent(eventId)
        setEvent(eventData)
        await loadFaceApiModels()
      } catch (err) {
        console.error('Erreur:', err)
        setError('Erreur chargement événement')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) loadEvent()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [eventId])

  const startWebcam = async () => {
    setError('')
    setWebcamActive(true)
    
    // On attend un petit peu que le DOM se mette à jour pour que videoRef.current soit disponible
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          streamRef.current = stream
          // Assurer le rendu immédiat
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Play failed:", e))
          }
        } else {
          throw new Error("L'élément vidéo n'est pas prêt")
        }
      } catch (err: any) {
        console.error('Erreur webcam:', err)
        setWebcamActive(false)
        setError(`❌ Impossible d'accéder à la caméra : ${err.message || "Veuillez vérifier les permissions."}`)
      }
    }, 300)
  }

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setWebcamActive(false)
    // Ne pas mettre capturedImage à null ici !
  }

  const captureFromWebcam = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('❌ Erreur: la webcam n\'est pas initialisée')
      return
    }
    try {
      setError('')
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      const imageUrl = canvas.toDataURL('image/jpeg', 0.95)
      setCapturedImage(imageUrl)
      stopWebcam()
    } catch (err) {
      console.error('Erreur capture:', err)
      setError('❌ Erreur lors de la capture')
    }
  }

  const performFaceSearch = async (img: HTMLImageElement) => {
    try {
      const searchDescriptor = await getFaceDescriptor(img)
      if (!searchDescriptor) {
        setError('❌ Aucun visage détecté dans votre photo')
        setSearching(false)
        return
      }
      const eventDescriptors = await getEventDescriptors(eventId, event?.photographerName)
      if (!eventDescriptors || eventDescriptors.length === 0) {
        setError('❌ Aucune photo dans cet événement')
        setSearching(false)
        return
      }
      const matches = await Promise.all(
        eventDescriptors.map(async (photoData) => {
          const distance = await compareFaces(searchDescriptor, arrayToDescriptor(photoData.descriptor))
          return {
            ...photoData,
            distance,
            confidence: Math.max(0, 100 - distance * 100),
          }
        })
      )
      const sortedMatches = matches
        .filter(m => m.confidence > 30)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 40)

      setResults(sortedMatches)
      if (sortedMatches.length === 0) {
        setError('❌ Aucune correspondance trouvée. Essayez une autre photo.')
      }
    } catch (err) {
      console.error('Erreur recherche:', err)
      setError('❌ Erreur lors de la recherche faciale.')
    } finally {
      setSearching(false)
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSearching(true)
    setError('')
    setResults([])
    try {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = async () => {
        await performFaceSearch(img)
      }
    } catch (err) {
      setSearching(false)
      setError('❌ Erreur lors du traitement de l\'image')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleDownloadZip = async () => {
    if (selectedIds.length === 0) return
    setIsDownloading(true)
    try {
      // Récupérer les objets photos complets pour les IDs sélectionnés
      const selectedPhotos = results
        .filter(p => selectedIds.includes(p.id))
        .map(p => ({
          url: event?.pricePerPhoto === 0 
            ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${p.cloudinaryPublicId}`
            : p.thumbnailUrl,
          filename: `photo-${p.id}.jpg`
        }))

      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photoUrls: selectedPhotos,
          eventName: event?.name || 'Photos'
        }),
      })
      if (!response.ok) throw new Error('Erreur téléchargement')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Mes-Photos-${event?.name}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      console.error(err)
      alert('Erreur lors du téléchargement.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand-blue animate-spin" />
        <p className="text-gray-500 font-medium">Chargement des modèles IA...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Événement introuvable.</p>
        <Link href="/" className="btn-primary">← Accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-brand-navy text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <BackButton fallback={`/user/gallery/${eventId}`} className="text-white/60 hover:text-white transition-colors mb-4 inline-flex" />
          <h1 className="font-display font-bold text-3xl md:text-4xl flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Search size={28} />
            </div>
            Trouver mes photos
          </h1>
          <p className="text-white/60 mt-2 text-lg">{event.name}</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="card mb-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-gold" />
          
          {!webcamActive && !capturedImage && !results.length && (
            <div className="space-y-8 p-6 md:p-12 text-center">
              <div className="max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">Comment souhaitez-vous procéder ?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-10">Prenez un selfie en direct ou importez une photo de votre galerie pour lancer la reconnaissance faciale.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center p-12 border-3 border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] hover:border-brand-blue hover:bg-brand-blue/5 transition-all duration-500"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={searching}
                    className="hidden"
                  />
                  <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload size={40} className="text-gray-600 dark:text-gray-400" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Charger une photo</h3>
                  <p className="text-sm text-gray-500">Depuis votre appareil</p>
                </button>

                <button
                  onClick={startWebcam}
                  className="group flex flex-col items-center justify-center p-12 border-3 border-dashed border-brand-blue/30 rounded-[2rem] hover:bg-brand-blue/10 hover:border-brand-blue transition-all duration-500"
                >
                  <div className="w-20 h-20 bg-brand-blue/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Camera size={40} className="text-brand-blue" />
                  </div>
                  <h3 className="font-bold text-xl text-brand-navy dark:text-white mb-2">Prendre un selfie</h3>
                  <p className="text-sm text-gray-500">Utiliser la caméra</p>
                </button>
              </div>
            </div>
          )}

          {webcamActive && (
            <div className="p-6 md:p-12 text-center space-y-6">
              <div className="relative max-w-2xl mx-auto bg-black rounded-[2.5rem] overflow-hidden aspect-video shadow-2xl">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-8 border-brand-blue/20 rounded-[2.5rem] pointer-events-none" />
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={captureFromWebcam} className="btn-primary !px-8 !py-4 flex items-center gap-2 text-lg">
                  <CheckCircle size={24} /> Capturer
                </button>
                <button onClick={stopWebcam} className="btn-secondary !px-8 !py-4 flex items-center gap-2 text-lg">
                  <X size={24} /> Annuler
                </button>
              </div>
            </div>
          )}

          {capturedImage && !webcamActive && !results.length && (
            <div className="p-6 md:p-12 text-center space-y-8 animate-fade-in">
              <div className="relative max-w-sm mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-brand-blue/10">
                <img src={capturedImage} alt="Selfie" className="w-full h-auto" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const img = new Image();
                    img.src = capturedImage;
                    img.onload = () => { setSearching(true); performFaceSearch(img); };
                  }}
                  disabled={searching}
                  className="btn-primary !px-10 !py-4 text-xl flex items-center justify-center gap-3"
                >
                  {searching ? <Loader2 className="animate-spin" /> : <Search />}
                  Lancer la recherche
                </button>
                <button onClick={() => { setCapturedImage(null); startWebcam(); }} disabled={searching} className="btn-secondary !px-10 !py-4 text-xl">
                  Refaire la photo
                </button>
              </div>
            </div>
          )}

          {searching && (
            <div className="p-20 text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-brand-blue/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
                <Search size={40} className="absolute inset-0 m-auto text-brand-blue animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-navy dark:text-white mb-2">Analyse en cours...</h3>
                <p className="text-gray-500">Notre IA parcourt l'événement pour vous trouver.</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-6 md:p-12 bg-white dark:bg-brand-navy-light animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-brand-navy dark:text-white flex items-center gap-3">
                    <CheckCircle2 size={32} className="text-green-500" />
                    {results.length} photo{results.length > 1 ? 's' : ''} trouvée{results.length > 1 ? 's' : ''} !
                  </h2>
                  <p className="text-gray-500 mt-2">Sélectionnez les photos que vous souhaitez télécharger.</p>
                </div>
                <button 
                  onClick={() => { setResults([]); setCapturedImage(null); setSelectedIds([]); }}
                  className="btn-secondary text-sm flex items-center gap-2"
                >
                  <RotateCcw size={16} /> Nouvelle recherche
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {results.map(photo => {
                  const isSelected = selectedIds.includes(photo.id);
                  return (
                    <div 
                      key={photo.id} 
                      onClick={() => toggleSelect(photo.id)}
                      className={`group relative card !p-0 overflow-hidden cursor-pointer transition-all duration-500 rounded-[2rem] ${
                        isSelected ? 'ring-4 ring-brand-blue scale-[0.98]' : 'hover:-translate-y-2'
                      }`}
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                        <img
                          src={photo.thumbnailUrl}
                          alt="Match"
                          className={`w-full h-full object-cover transition-all duration-700 ${
                            isSelected ? 'scale-110 opacity-70' : 'group-hover:scale-110'
                          }`}
                        />
                      </div>
                      
                      <div className="absolute top-4 left-4">
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                          {photo.confidence.toFixed(0)}% Match
                        </div>
                      </div>

                      {/* Individual Buy Button */}
                      <div className="p-4 bg-white dark:bg-brand-navy-light border-t border-gray-100 dark:border-white/5">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Photo HD</span>
                          <span className="text-sm font-black text-brand-blue">{event?.pricePerPhoto || 0} FCFA</span>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/checkout?photoId=${photo.id}`);
                          }}
                          className="w-full py-2.5 bg-brand-blue hover:bg-brand-navy text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <ShoppingCart size={14} />
                          Acheter cette photo
                        </button>
                      </div>

                      {/* Selection indicator (overlay) */}
                      <div className={`absolute top-4 right-4 transition-all duration-300 ${
                        isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100'
                      }`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'bg-brand-blue border-brand-blue text-white' : 'bg-black/20 border-white text-transparent'
                        }`}>
                          <CheckCircle2 size={16} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && !searching && !results.length && (
            <div className="p-12 text-center animate-shake">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <AlertCircle size={40} />
              </div>
              <p className="text-xl font-bold text-red-800 mb-4">{error}</p>
              <button onClick={() => { setError(''); setCapturedImage(null); startWebcam(); }} className="btn-secondary">Réessayer</button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </main>

      {/* Floating Action Bar */}
      {results.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl animate-slide-up">
          <div className="bg-brand-navy/90 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-[2.5rem] shadow-2xl shadow-black/50 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4 px-2">
              <div className="w-14 h-14 rounded-2xl bg-brand-blue flex items-center justify-center text-white font-black text-2xl">
                {selectedIds.length}
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-bold text-lg">Sélectionnées</p>
                <button onClick={() => setSelectedIds([])} className="text-white/40 text-xs hover:text-white transition-colors uppercase tracking-widest font-bold">Annuler</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(event?.pricePerPhoto || 0) === 0 ? (
                <button 
                  onClick={handleDownloadZip}
                  disabled={isDownloading || selectedIds.length === 0}
                  className={`btn-primary !py-4 px-8 flex items-center gap-3 text-lg font-bold ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                  <span>Télécharger ZIP</span>
                </button>
              ) : (
                <button 
                  onClick={() => router.push(`/checkout?photoIds=${selectedIds.join(',')}`)}
                  disabled={selectedIds.length === 0}
                  className={`btn-primary !py-4 px-8 flex items-center gap-3 text-lg font-bold ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ShoppingCart size={24} />
                  <span>Tout acheter ({(event?.pricePerPhoto || 0) * selectedIds.length} FCFA)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
