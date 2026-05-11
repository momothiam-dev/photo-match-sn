import * as admin from 'firebase-admin'

function initializeAdmin() {
  if (admin.apps.length > 0) return admin.app()

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase Admin : Clés manquantes. Le SDK Admin ne sera pas disponible.')
    return null
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error)
    return null
  }
}

// Initialiser au premier appel
const app = initializeAdmin()

export const adminDb = app ? admin.firestore() : null
export { admin }
