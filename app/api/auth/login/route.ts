import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Auth simplifiée : identifiants admin stockés dans les variables d'environnement
// Pour configurer : ajoutez dans .env.local
//   ADMIN_EMAIL=votre@email.com
//   ADMIN_PASSWORD_HASH=<sha256 de votre mot de passe>
// Pour générer le hash : node -e "console.log(require('crypto').createHash('sha256').update('VOTRE_MOT_DE_PASSE').digest('hex'))"

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@photo-match.sn'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'photomatch2024' // mot de passe par défaut si pas de .env

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const hashedInput = crypto.createHash('sha256').update(password).digest('hex')
    const hashedAdmin = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex')

    if (action === 'register') {
      // L'inscription n'est pas autorisée publiquement.
      // Le seul moyen de "créer" un compte est de définir ADMIN_EMAIL et ADMIN_PASSWORD dans .env.local
      return NextResponse.json(
        { error: 'Les inscriptions sont désactivées. Configurez vos identifiants dans le fichier .env.local.' },
        { status: 403 }
      )
    }

    if (action === 'login') {
      const emailMatch    = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
      const passwordMatch = hashedInput === hashedAdmin

      if (!emailMatch || !passwordMatch) {
        return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
      }

      const token = crypto.randomBytes(32).toString('hex')

      return NextResponse.json({
        success: true,
        photographerId: 'admin',
        email: ADMIN_EMAIL,
        token,
        message: 'Connexion réussie!',
      })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (error) {
    console.error('Erreur auth:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
