'use client'

export const shareService = {
  shareWhatsApp(text: string, url: string) {
    const message = `${text} ${url}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank'
    )
  },

  shareFacebook(url: string) {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    )
  },

  shareTwitter(text: string, url: string) {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  },

  shareEmail(to: string, subject: string, body: string) {
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  },

  copyLink(url: string) {
    navigator.clipboard.writeText(url)
  },
}
