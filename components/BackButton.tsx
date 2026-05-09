'use client'

import { useRouter } from 'next/navigation'

interface BackButtonProps {
  fallback?: string
  className?: string
  label?: string
}

export function BackButton({ fallback, className = '', label = 'Retour' }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else if (fallback) {
      router.push(fallback)
    } else {
      router.push('/')
    }
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-brand-blue dark:text-gray-400 dark:hover:text-brand-blue-light transition-colors ${className}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6"/>
      </svg>
      {label}
    </button>
  )
}
