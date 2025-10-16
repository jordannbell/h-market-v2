import jwt from 'jsonwebtoken'
import type { UserRole } from '@/types/models'

// Validation du secret JWT
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
 throw new Error(
 'La variable d\'environnement JWT_SECRET doit être définie dans .env'
 )
}

/**
 * Interface pour le payload du JWT décodé
 */
export interface DecodedToken {
 userId: string
 email: string
 role: UserRole
 iat: number // Issued at (timestamp)
 exp: number // Expiration (timestamp)
}

/**
 * Interface pour le payload lors de la génération du token
 */
export interface TokenPayload {
 userId: string
 email: string
 role: UserRole
}

/**
 * Vérifie et décode un token JWT
 * @param token - Token JWT à vérifier
 * @returns DecodedToken | null - Token décodé ou null si invalide
 */
export function verifyToken(token: string): DecodedToken | null {
 try {
 // Vérifier le format du token
 if (!token || typeof token !== 'string') {
 console.error(' Token invalide: format incorrect')
 return null
 }

 // Vérifier que le token a 3 parties (header.payload.signature)
 const parts = token.split('.')
 if (parts.length !== 3) {
 console.error(' Token invalide: structure incorrecte')
 return null
 }

 // Vérifier et décoder le token
 const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken

 // Vérifier que le token contient les champs requis
 if (!decoded.userId || !decoded.email || !decoded.role) {
 console.error(' Token invalide: champs manquants')
 return null
 }

 return decoded
 } catch (error) {
 // Logger l'erreur spécifique
 if (error instanceof jwt.TokenExpiredError) {
 console.error(' Token expiré:', error.message)
 } else if (error instanceof jwt.JsonWebTokenError) {
 console.error(' Token JWT invalide:', error.message)
 } else {
 console.error(' Erreur lors de la vérification du token:', error)
 }
 return null
 }
}

/**
 * Génère un nouveau token JWT
 * @param payload - Données à encoder dans le token
 * @returns string - Token JWT généré
 */
export function generateToken(payload: TokenPayload): string {
 try {
 // Valider le payload
 if (!payload.userId || !payload.email || !payload.role) {
 throw new Error('Le payload du token doit contenir userId, email et role')
 }

 // Générer le token avec une expiration de 7 jours
 const token = jwt.sign(payload, JWT_SECRET, {
 expiresIn: '7d',
 issuer: 'h-market', // Émetteur du token
 })

 return token
 } catch (error) {
 console.error(' Erreur lors de la génération du token:', error)
 throw error
 }
}

/**
 * Rafraîchit un token JWT en générant un nouveau token avec le même payload
 * @param token - Token JWT à rafraîchir
 * @returns string | null - Nouveau token ou null si le token est invalide
 */
export function refreshToken(token: string): string | null {
 try {
 // Vérifier le token actuel
 const decoded = verifyToken(token)
 if (!decoded) {
 return null
 }

 // Générer un nouveau token avec les mêmes données
 return generateToken({
 userId: decoded.userId,
 email: decoded.email,
 role: decoded.role,
 })
 } catch (error) {
 console.error(' Erreur lors du rafraîchissement du token:', error)
 return null
 }
}

/**
 * Extrait le token JWT d'un header Authorization
 * @param authHeader - Header Authorization (format: "Bearer TOKEN")
 * @returns string | null - Token extrait ou null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
 if (!authHeader) {
 return null
 }

 // Vérifier le format "Bearer TOKEN"
 const parts = authHeader.split(' ')
 if (parts.length !== 2 || parts[0] !== 'Bearer') {
 console.error(' Format d\'authorization invalide (attendu: "Bearer TOKEN")')
 return null
 }

 return parts[1]
}

/**
 * Vérifie si un token est expiré sans lever d'exception
 * @param token - Token JWT à vérifier
 * @returns boolean - True si le token est expiré
 */
export function isTokenExpired(token: string): boolean {
 try {
 const decoded = jwt.decode(token) as DecodedToken | null
 if (!decoded || !decoded.exp) {
 return true
 }

 // Comparer l'expiration avec le timestamp actuel (en secondes)
 const now = Math.floor(Date.now() / 1000)
 return decoded.exp < now
 } catch (error) {
 return true
 }
}
