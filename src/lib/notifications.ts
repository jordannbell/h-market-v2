/**
 * Gestionnaire de notifications en temps réel via Server-Sent Events (SSE)
 * Ce module gère les connexions SSE et l'envoi de notifications aux utilisateurs
 */

// Store global pour les connexions SSE actives
// Map: userId -> ReadableStreamDefaultController
const connections = new Map<string, ReadableStreamDefaultController>()

/**
 * Interface pour une notification
 */
export interface Notification {
 type: string
 title: string
 message: string
 data?: Record<string, unknown>
 timestamp?: string
}

/**
 * Enregistre une nouvelle connexion SSE pour un utilisateur
 * @param userId - ID de l'utilisateur
 * @param controller - Contrôleur du stream SSE
 */
export function registerConnection(
 userId: string,
 controller: ReadableStreamDefaultController
): void {
 connections.set(userId, controller)
 console.log(` Connexion SSE enregistrée pour l'utilisateur ${userId}`)
}

/**
 * Supprime une connexion SSE
 * @param userId - ID de l'utilisateur
 */
export function unregisterConnection(userId: string): void {
 connections.delete(userId)
 console.log(` Connexion SSE fermée pour l'utilisateur ${userId}`)
}

/**
 * Obtient le nombre de connexions actives
 * @returns number - Nombre de connexions actives
 */
export function getActiveConnectionsCount(): number {
 return connections.size
}

/**
 * Vérifie si un utilisateur a une connexion active
 * @param userId - ID de l'utilisateur
 * @returns boolean - True si l'utilisateur a une connexion active
 */
export function hasActiveConnection(userId: string): boolean {
 return connections.has(userId)
}

/**
 * Envoie une notification à un utilisateur spécifique
 * @param userId - ID de l'utilisateur destinataire
 * @param notification - Notification à envoyer
 * @returns boolean - True si la notification a été envoyée avec succès
 */
export function sendNotificationToUser(
 userId: string,
 notification: Notification
): boolean {
 const controller = connections.get(userId)
 
 if (!controller) {
 console.warn(`️ Pas de connexion active pour l'utilisateur ${userId}`)
 return false
 }

 try {
 const message = `data: ${JSON.stringify({
 ...notification,
 timestamp: notification.timestamp || new Date().toISOString(),
 })}\n\n`

 controller.enqueue(new TextEncoder().encode(message))
 console.log(` Notification envoyée à ${userId}: ${notification.title}`)
 return true
 } catch (error) {
 console.error(` Erreur lors de l'envoi de notification à ${userId}:`, error)
 // Supprimer la connexion en cas d'erreur
 connections.delete(userId)
 return false
 }
}

/**
 * Envoie une notification à tous les utilisateurs d'un rôle spécifique
 * Note: Cette implémentation basique envoie à tous les utilisateurs connectés
 * Pour filtrer par rôle, il faudrait stocker le rôle avec la connexion
 * @param role - Rôle des utilisateurs destinataires
 * @param notification - Notification à envoyer
 * @returns number - Nombre de notifications envoyées avec succès
 */
export function sendNotificationToRole(
 role: string,
 notification: Notification
): number {
 let sentCount = 0

 for (const [userId, controller] of connections.entries()) {
 try {
 const message = `data: ${JSON.stringify({
 ...notification,
 timestamp: notification.timestamp || new Date().toISOString(),
 })}\n\n`

 controller.enqueue(new TextEncoder().encode(message))
 sentCount++
 console.log(` Notification envoyée à l'utilisateur ${userId}`)
 } catch (error) {
 console.error(` Erreur lors de l'envoi à ${userId}:`, error)
 connections.delete(userId)
 }
 }

 console.log(
 ` Notification "${notification.title}" envoyée à ${sentCount} utilisateur(s) (rôle: ${role})`
 )
 return sentCount
}

/**
 * Envoie une notification à tous les utilisateurs connectés
 * @param notification - Notification à envoyer
 * @returns number - Nombre de notifications envoyées avec succès
 */
export function broadcastNotification(notification: Notification): number {
 let sentCount = 0

 for (const [userId, controller] of connections.entries()) {
 try {
 const message = `data: ${JSON.stringify({
 ...notification,
 timestamp: notification.timestamp || new Date().toISOString(),
 })}\n\n`

 controller.enqueue(new TextEncoder().encode(message))
 sentCount++
 } catch (error) {
 console.error(` Erreur lors de l'envoi broadcast à ${userId}:`, error)
 connections.delete(userId)
 }
 }

 console.log(` Broadcast: "${notification.title}" envoyée à ${sentCount} utilisateur(s)`)
 return sentCount
}

/**
 * Envoie une notification à tous les livreurs disponibles
 * Note: Cette implémentation nécessiterait une amélioration pour filtrer
 * uniquement les livreurs disponibles en consultant la base de données
 * @param notification - Notification à envoyer
 * @returns number - Nombre de notifications envoyées
 */
export function sendNotificationToAvailableDrivers(
 notification: Notification
): number {
 // Pour l'instant, on utilise sendNotificationToRole
 // Dans une vraie implémentation, on filtrerait les livreurs disponibles
 console.log(` Notification pour livreurs disponibles: ${notification.title}`)
 return sendNotificationToRole('livreur', notification)
}

/**
 * Envoie un ping (heartbeat) à tous les utilisateurs connectés
 * pour maintenir la connexion SSE active
 */
export function sendHeartbeat(): void {
 const heartbeat = ': heartbeat\n\n'
 const encoder = new TextEncoder()

 for (const [userId, controller] of connections.entries()) {
 try {
 controller.enqueue(encoder.encode(heartbeat))
 } catch (error) {
 console.error(` Erreur heartbeat pour ${userId}:`, error)
 connections.delete(userId)
 }
 }
}

/**
 * Ferme toutes les connexions actives
 * Utile lors de l'arrêt du serveur
 */
export function closeAllConnections(): void {
 for (const [userId, controller] of connections.entries()) {
 try {
 controller.close()
 } catch (error) {
 console.error(` Erreur lors de la fermeture de connexion ${userId}:`, error)
 }
 }
 connections.clear()
 console.log(' Toutes les connexions SSE ont été fermées')
}

