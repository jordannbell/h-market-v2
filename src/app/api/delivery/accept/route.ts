import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
 try {
 await connectDB()
 
 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }
 
 const decoded = await verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }
 
 // Vérifier que c'est un livreur
 if (decoded.role !== 'livreur') {
 return NextResponse.json({ error: 'Accès réservé aux livreurs' }, { status: 403 })
 }
 
 const { orderId } = await request.json()
 
 console.log(' Accept - OrderId reçu:', orderId)
 console.log(' Accept - UserId du livreur:', decoded.userId)
 
 if (!orderId) {
 return NextResponse.json({ error: 'ID de commande requis' }, { status: 400 })
 }
 
 // Vérifier que la commande existe et est disponible
 const order = await Order.findById(orderId)
 console.log(' Accept - Commande trouvée:', order ? 'Oui' : 'Non')
 if (order) {
 console.log(' Accept - Statut de la commande:', order.delivery?.status)
 console.log(' Accept - Driver assigné:', order.delivery?.assignedDriverId)
 }
 
 if (!order) {
 return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
 }
 
 // Vérifier que la commande n'est pas déjà assignée ou livrée
 if (order.delivery?.status === 'delivered') {
 return NextResponse.json({ error: 'Cette commande est déjà livrée' }, { status: 400 })
 }
 
 if (order.delivery?.assignedDriverId && order.delivery?.status !== 'pending') {
 return NextResponse.json({ error: 'Cette commande est déjà assignée à un autre livreur' }, { status: 400 })
 }
 
 // Vérifier que le livreur est disponible
 const livreur = await User.findById(decoded.userId)
 if (!livreur || !livreur.isAvailable) {
 return NextResponse.json({ error: 'Vous devez être disponible pour accepter une commande' }, { status: 400 })
 }
 
 // ÉTAPE 1: Assigner la commande au livreur
 order.delivery.assignedDriverId = decoded.userId
 order.delivery.status = 'assigned'
 order.delivery.assignedAt = new Date()
 order.status = 'confirmed' // La commande est confirmée et assignée
 
 // Mise à jour du progrès de la commande
 order.orderProgress = {
 step: 'preparation',
 currentStep: 1,
 totalSteps: 4, // 1: Assignée, 2: Récupérée, 3: En route, 4: Livrée
 estimatedCompletionTime: new Date(Date.now() + 60 * 60 * 1000) // +1h
 }
 
 // Ajouter à l'historique de suivi
 if (!order.delivery.trackingHistory) {
 order.delivery.trackingHistory = []
 }
 
 order.delivery.trackingHistory.push({
 status: 'assigned',
 timestamp: new Date(),
 notes: ` Commande acceptée par ${livreur.name.first} ${livreur.name.last}`,
 actorId: decoded.userId,
 actorRole: 'livreur'
 })
 
 await order.save({ validateBeforeSave: false })
 
 console.log(` ÉTAPE 1: Commande ${order.orderNumber} acceptée par le livreur ${decoded.userId}`)
 
 // Envoyer une notification au client
 try {
 const { sendNotificationToUser } = await import('@/lib/notifications')
 
 sendNotificationToUser(order.userId.toString(), {
 type: 'order_assigned',
 title: ' Livreur assigné !',
 message: `${livreur.name.first} ${livreur.name.last} va livrer votre commande ${order.orderNumber}`,
 data: {
 orderId: order._id,
 orderNumber: order.orderNumber,
 driverName: `${livreur.name.first} ${livreur.name.last}`,
 estimatedTime: order.orderProgress.estimatedCompletionTime
 }
 })
 
 console.log(` Notification envoyée au client ${order.userId}`)
 } catch (notificationError) {
 console.error('Erreur lors de l\'envoi de la notification:', notificationError)
 }
 
 return NextResponse.json({
 success: true,
 message: 'Commande acceptée avec succès',
 order: {
 _id: order._id,
 orderNumber: order.orderNumber,
 status: order.status,
 assignedAt: order.delivery.assignedAt
 }
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de l\'acceptation de la commande:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de l\'acceptation de la commande',
 details: error.message 
 }, { status: 500 })
 }
}
