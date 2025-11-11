/**
 * Tests backend ciblant les helpers JWT situés dans `src/lib/auth.ts`.
 * Objectif : vérifier que la génération et la validation de tokens
 * fonctionnent comme prévu sans dépendre d’un serveur externe.
 */

import jwt from 'jsonwebtoken'

import { generateToken, verifyToken, refreshToken, isTokenExpired } from '@/lib/auth'

// --- Contexte commun aux différents tests ---
const payload = {
  userId: 'user-123',
  email: 'user@example.com',
  role: 'client' as const,
}

describe('Helpers JWT (auth.ts)', () => {
  it('génère un token signé réutilisable et vérifiable', () => {
    // GIVEN : un payload minimal côté backend
    const token = generateToken(payload)

    // WHEN : on tente de le décoder avec verifyToken
    const decoded = verifyToken(token)

    // THEN : les champs d’origine doivent être retrouvés
    expect(typeof token).toBe('string')
    expect(decoded).not.toBeNull()
    expect(decoded?.userId).toBe(payload.userId)
    expect(decoded?.email).toBe(payload.email)
    expect(decoded?.role).toBe(payload.role)
  })

  it('retourne null sur un token invalide', () => {
    // GIVEN : une chaîne totalement invalide
    const decoded = verifyToken('invalid.token.value')

    // THEN : verifyToken doit protéger l’API en renvoyant null
    expect(decoded).toBeNull()
  })

  it('rafraîchit un token valide', () => {
    // GIVEN : un token généré par notre helper
    const token = generateToken(payload)

    // WHEN : on demande un refresh
    const refreshed = refreshToken(token)

    // THEN : un nouveau token doit être produit et rester vérifiable
    expect(refreshed).not.toBeNull()
    const decodedOriginal = verifyToken(token)
    const decodedRefreshed = verifyToken(refreshed!)

    expect(decodedOriginal).not.toBeNull()
    expect(decodedRefreshed).not.toBeNull()
    expect(decodedRefreshed?.exp).toBeGreaterThanOrEqual(decodedOriginal!.exp)
  })

  it('détecte correctement la validité ou l’expiration d’un token', () => {
    // GIVEN : deux tokens signés manuellement avec des expirations distinctes
    const secret = process.env.JWT_SECRET as string
    const expiredToken = jwt.sign(payload, secret, { expiresIn: -10 }) // déjà expiré
    const validToken = jwt.sign(payload, secret, { expiresIn: '1h' }) // encore valable

    // THEN : isTokenExpired reflète bien l’état de chaque token
    expect(isTokenExpired(expiredToken)).toBe(true)
    expect(isTokenExpired(validToken)).toBe(false)
  })
})


