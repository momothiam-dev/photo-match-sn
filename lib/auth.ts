// Gestion simple de l'authentification côté client
export interface AuthUser {
  photographerId: string
  email: string
  token: string
}

const AUTH_KEY = 'photo-match-auth'

export const authService = {
  setAuth(user: AuthUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    }
  },

  getAuth(): AuthUser | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(AUTH_KEY)
      return data ? JSON.parse(data) : null
    }
    return null
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_KEY)
    }
  },

  isAuthenticated(): boolean {
    return this.getAuth() !== null
  },
}
