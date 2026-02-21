// ⚠️ Importer uniquement depuis des composants "use client"
// face-api.js nécessite le DOM et WebGL

let modelsLoaded = false

export async function loadFaceApiModels(): Promise<void> {
  if (modelsLoaded) return

  try {
    // Importer dynamiquement pour éviter les erreurs 'fs' côté client
    const faceapi = await import('face-api.js')

    // Essayer de charger les modèles depuis public/models
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models').catch(() => {
        console.warn('[face-api] Impossible de charger tinyFaceDetector')
      }),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models').catch(() => {
        console.warn('[face-api] Impossible de charger faceLandmark68Net')
      }),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models').catch(() => {
        console.warn('[face-api] Impossible de charger faceRecognitionNet')
      }),
    ])

    modelsLoaded = true
    console.log('[face-api] ✅ Modèles chargés')
  } catch (error) {
    console.error('[face-api] ❌ Erreur lors du chargement:', error)
    throw error
  }
}

export async function getFaceDescriptor(
  element: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<Float32Array | null> {
  try {
    const faceapi = await import('face-api.js')

    const detection = await faceapi
      .detectSingleFace(element, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.5,
      }))
      .withFaceLandmarks()
      .withFaceDescriptor()

    return detection?.descriptor ?? null
  } catch (error) {
    console.error('[face-api] Erreur extraction descripteur:', error)
    return null
  }
}

export async function compareFaces(d1: Float32Array, d2: Float32Array): Promise<number> {
  const faceapi = await import('face-api.js')
  return faceapi.euclideanDistance(d1, d2)
}

export function descriptorToArray(descriptor: Float32Array): number[] {
  return Array.from(descriptor)
}

export function arrayToDescriptor(array: number[]): Float32Array {
  return new Float32Array(array)
}
