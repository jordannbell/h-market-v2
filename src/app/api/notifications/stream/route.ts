import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { registerConnection, unregisterConnection } from '@/lib/notifications'

export async function OPTIONS() {
 return new Response(null, {
 status: 200,
 headers: {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'GET, OPTIONS',
 'Access-Control-Allow-Headers': 'Cache-Control, Authorization, Content-Type',
 'Access-Control-Allow-Credentials': 'true'
 }
 })
}

export async function GET(request: NextRequest) {
 // Vérifier l'authentification - d'abord dans les headers, puis dans les paramètres URL
 let token = request.headers.get('authorization')?.replace('Bearer ', '')
 
 // Si pas de token dans les headers, chercher dans les paramètres URL
 if (!token) {
 const url = new URL(request.url)
 token = url.searchParams.get('token')
 }
 
 if (!token) {
 console.log(' Token manquant pour la connexion SSE')
 return new Response('Unauthorized', { status: 401 })
 }

 const decoded = await verifyToken(token)
 if (!decoded) {
 console.log(' Token invalide pour la connexion SSE')
 return new Response('Invalid token', { status: 401 })
 }

 const userId = decoded.userId
 const userRole = decoded.role
 
 console.log(` Authentification SSE réussie pour l'utilisateur ${userId} (${userRole})`)

 // Créer un stream SSE
 const stream = new ReadableStream({
 start(controller) {
 // Enregistrer la connexion dans le gestionnaire global
 registerConnection(userId, controller)

 // Envoyer un message de connexion
 const message = `data: ${JSON.stringify({
 type: 'connected',
 message: 'Connexion établie',
 timestamp: new Date().toISOString()
 })}\n\n`
 
 controller.enqueue(new TextEncoder().encode(message))

 // Gérer la déconnexion
 request.signal.addEventListener('abort', () => {
 unregisterConnection(userId)
 controller.close()
 })

 console.log(` Connexion SSE établie pour l'utilisateur ${userId} (${userRole})`)
 },
 cancel() {
 unregisterConnection(userId)
 console.log(` Connexion SSE fermée pour l'utilisateur ${userId}`)
 }
 })

 return new Response(stream, {
 headers: {
 'Content-Type': 'text/event-stream',
 'Cache-Control': 'no-cache',
 'Connection': 'keep-alive',
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
 'Access-Control-Allow-Methods': 'GET, OPTIONS',
 'Access-Control-Allow-Credentials': 'true'
 }
 })
}

/**
 * Les fonctions d'envoi de notifications sont maintenant disponibles
 * dans le module @/lib/notifications :
 * - sendNotificationToUser(userId, notification)
 * - sendNotificationToRole(role, notification)
 * - sendNotificationToAvailableDrivers(notification)
 * - broadcastNotification(notification)
 * 
 * Importez-les depuis @/lib/notifications pour les utiliser dans d'autres routes
 */
