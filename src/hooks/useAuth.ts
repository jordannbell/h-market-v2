import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
 _id: string
 name: {
 first: string
 last: string
 }
 email: string
 role: string
 phone: string
 isVerified: boolean
 isActive: boolean
 // Champs spécifiques au livreur
 vehicleType?: string
 licensePlate?: string
 deliveryZone?: string
 isAvailable?: boolean
 rating?: number
 totalDeliveries?: number
}

export function useAuth() {
 const [user, setUser] = useState<User | null>(null)
 const [loading, setLoading] = useState(true)
 const [token, setToken] = useState<string | null>(null)
 const [isClientSide, setIsClientSide] = useState(false)
 const router = useRouter()

 useEffect(() => {
 // Marquer que nous sommes côté client
 setIsClientSide(true)
 // Vérifier l'authentification au chargement
 checkAuth()
 }, [])

 const checkAuth = async () => {
 try {
 const storedToken = localStorage.getItem('token')
 const storedUser = localStorage.getItem('user')
 
 if (storedToken && storedUser) {
 try {
 const userData = JSON.parse(storedUser)
 
 // Vérifier la validité du token côté serveur
 const isValid = await validateToken(storedToken)
 
 if (isValid) {
 setToken(storedToken)
 setUser(userData)
 } else {
 // Token invalide, nettoyer le localStorage
 logout()
 }
 } catch (parseError) {
 console.error(' Erreur parsing utilisateur:', parseError)
 logout()
 }
 }
 } catch (error) {
 console.error('Erreur lors de la vérification de l\'authentification:', error)
 logout()
 } finally {
 setLoading(false)
 }
 }

 const validateToken = async (token: string): Promise<boolean> => {
 try {
 // Vérification basique du format du token
 if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
 console.error(' Token malformé:', token)
 return false
 }

 const response = await fetch('/api/auth/verify', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ token })
 })
 
 if (response.ok) {
 const data = await response.json()
 return data.valid && data.user
 } else {
 const errorData = await response.json().catch(() => ({}))
 console.error(' Erreur API verify:', response.status, errorData.error || response.statusText)
 return false
 }
 } catch (error) {
 console.error(' Erreur validation token:', error)
 return false
 }
 }

 const login = async (userData: User, userToken: string) => {
 console.log(' useAuth.login appelé avec:', { email: userData.email, role: userData.role })
 
 // Valider le token avant de le stocker
 const isValid = await validateToken(userToken)
 
 if (isValid) {
 // Stocker dans localStorage
 localStorage.setItem('token', userToken)
 localStorage.setItem('user', JSON.stringify(userData))
 
 // Mettre à jour l'état de manière synchrone
 setToken(userToken)
 setUser(userData)
 
 // Mettre à jour la dernière connexion sur le serveur
 try {
 await fetch('/api/auth/update-login', {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${userToken}`,
 'Content-Type': 'application/json'
 }
 })
 } catch (error) {
 console.warn('️ Impossible de mettre à jour la dernière connexion:', error)
 }
 
 // Forcer un re-render en attendant un tick
 await new Promise(resolve => setTimeout(resolve, 0))
 
 console.log(' useAuth.login - État mis à jour, isAuthenticated sera:', !!userToken && !!userData)
 } else {
 throw new Error('Token invalide')
 }
 }

 const logout = (redirectTo?: string) => {
 localStorage.removeItem('token')
 localStorage.removeItem('user')
 setToken(null)
 setUser(null)
 
 // Rediriger vers l'URL spécifiée ou par défaut vers la page d'accueil
 if (redirectTo) {
 router.push(redirectTo)
 } else {
 router.push('/')
 }
 }

 // Éviter l'hydratation en retournant false côté serveur
 const isAuthenticated = isClientSide && !!token && !!user
 
 // Debug: Log de l'état d'authentification
 useEffect(() => {
 if (isClientSide) {
 console.log(' useAuth DEBUG - État actuel:', {
 isClientSide,
 hasToken: !!token,
 hasUser: !!user,
 isAuthenticated,
 userRole: user?.role,
 userEmail: user?.email
 })
 }
 }, [isClientSide, token, user, isAuthenticated])
 
 const isAdmin = user?.role === 'admin'
 const isClient = user?.role === 'client'
 const isLivreur = user?.role === 'livreur'

 return {
 user,
 token,
 loading,
 isAuthenticated,
 isAdmin,
 isClient,
 isLivreur,
 login,
 logout,
 checkAuth
 }
}

