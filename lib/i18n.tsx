'use client'

import { ReactNode, useState, useEffect } from 'react'

type Language = 'fr' | 'en' | 'wo'

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  fr: {
    'home.title': 'Bienvenue sur Photo-Match',
    'home.subtitle': 'Partagez vos photos d\'événements',
    'gallery.title': 'Galerie',
    'admin.title': 'Tableau de bord',
    'auth.login': 'Se connecter',
    'auth.register': "S'inscrire",
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
  },
  en: {
    'home.title': 'Welcome to Photo-Match',
    'home.subtitle': 'Share your event photos',
    'gallery.title': 'Gallery',
    'admin.title': 'Dashboard',
    'auth.login': 'Sign In',
    'auth.register': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  wo: {
    'home.title': 'Dalal ba Photo-Match',
    'home.subtitle': 'Jëm foto yu liwulinewul sa',
    'gallery.title': 'Galerie',
    'admin.title': 'Tablao',
    'auth.login': 'Seetu',
    'auth.register': 'Njëka',
    'auth.email': 'Imeel',
    'auth.password': 'Konngol',
    'common.loading': 'Aatal na...',
    'common.error': 'Suukkat',
    'common.success': 'Aw',
  },
}

let currentLanguage: Language = 'fr'
let languageListeners: (() => void)[] = []

export const i18nService = {
  setLanguage(lang: Language) {
    currentLanguage = lang
    if (typeof window !== 'undefined') {
      localStorage.setItem('photo-match-lang', lang)
    }
    languageListeners.forEach((cb) => cb())
  },

  getLanguage(): Language {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('photo-match-lang') as Language
      if (saved) return saved
    }
    return currentLanguage
  },

  t(key: string, lang?: Language): string {
    const language = lang || currentLanguage
    return translations[language]?.[key] || translations.fr[key] || key
  },

  subscribe(callback: () => void) {
    languageListeners.push(callback)
    return () => {
      languageListeners = languageListeners.filter((cb) => cb !== callback)
    }
  },
}

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Language>('fr')

  useEffect(() => {
    setLang(i18nService.getLanguage())
  }, [])

  return (
    <select
      value={lang}
      onChange={(e) => {
        const newLang = e.target.value as Language
        setLang(newLang)
        i18nService.setLanguage(newLang)
      }}
      className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
    >
      <option value="fr">Français</option>
      <option value="en">English</option>
      <option value="wo">Wolof</option>
    </select>
  )
}
