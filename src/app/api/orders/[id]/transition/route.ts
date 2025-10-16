import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'
import { sendNotificationToUser, sendNotificationToAvailableDrivers } from '@/lib/notifications'

// États de commande professionnels
const ORDER_STATES = {
 // États généraux
 PENDING: 'pending',
 CONFIRMED: 'confirmed',
 PREPARING: 'preparing',
 READY_FOR_PICKUP: 'ready_for_pickup',
 OUT_FOR_DELIVERY: 'out_for_delivery',
 DELIVERED: 'delivered',
 CANCELLED: 'cancelled',
 FAILED: 'failed'
} as const

const DELIVERY_STATES = {
 PENDING: 'pending',
 ASSIGNED: 'assigned',
 PICKED_UP: 'picked_up',
 IN_TRANSIT: 'in_transit',
 ARRIVED: 'arrived',
 DELIVERED: 'delivered',
 FAILED: 'failed'
} as const

// Matrice de transitions autorisées
const ALLOWED_TRANSITIONS = {
 [ORDER_STATES.PENDING]: [ORDER_STATES.CONFIRMED, ORDER_STATES.CANCELLED],
 [ORDER_STATES.CONFIRMED]: [ORDER_STATES.PREPARING, ORDER_STATES.CANCELLED],
 [ORDER_STATES.PREPARING]: [ORDER_STATES.READY_FOR_PICKUP, ORDER_STATES.CANCELLED],
 [ORDER_STATES.READY_FOR_PICKUP]: [ORDER_STATES.OUT_FOR_DELIVERY, ORDER_STATES.CANCELLED],
 [ORDER_STATES.OUT_FOR_DELIVERY]: [ORDER_STATES.DELIVERED, ORDER_STATES.FAILED],
 [ORDER_STATES.DELIVERED]: [], // État final
 [ORDER_STATES.CANCELLED]: [], // État final
 [ORDER_STATES.FAILED]: [ORDER_STATES.PREPARING] // Retry possible
}

const DELIVERY_TRANSITIONS = {
 [DELIVERY_STATES.PENDING]: [DELIVERY_STATES.ASSIGNED],
 [DELIVERY_STATES.ASSIGNED]: [DELIVERY_STATES.PICKED_UP],
 [DELIVERY_STATES.PICKED_UP]: [DELIVERY_STATES.IN_TRANSIT],
 [DELIVERY_STATES.IN_TRANSIT]: [DELIVERY_STATES.ARRIVED],
 [DELIVERY_STATES.ARRIVED]: [DELIVERY_STATES.DELIVERED, DELIVERY_STATES.FAILED],
 [DELIVERY_STATES.DELIVERED]: [], // État final
 [DELIVERY_STATES.FAILED]: [DELIVERY_STATES.ASSIGNED] // Retry possible
}

export async function POST(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()
 
 const params = await context.params
 const orderId = params.id
 
 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }
 
 const decoded = await verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }
 
 const { 
 newOrderState, 
 newDeliveryState, 
 notes, 
 location,
 estimatedDeliveryTime 
 } = await request.json()
 
 // Récupérer la commande
 const order = await Order.findById(orderId)
 if (!order) {
 return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
 }
 
 // Vérifier les permissions selon le rôle
 const userRole = decoded.role
 const userId = decoded.userId
 
 let canTransition = false
 
 // Logique de permissions
 switch (userRole) {
 case 'admin':
 canTransition = true
 break
 case 'livreur':
 // Un livreur peut seulement modifier les états de livraison des commandes qui lui sont assignées
 canTransition = order.delivery.assignedDriverId?.toString() === userId
 break
 case 'client':
 // Un client peut seulement annuler sa commande si elle n'est pas encore en cours de préparation
 canTransition = newOrderState === ORDER_STATES.CANCELLED && 
 [ORDER_STATES.PENDING, ORDER_STATES.CONFIRMED].includes(order.status)
 break
 default:
 canTransition = false
 }
 
 if (!canTransition) {
 return NextResponse.json({ 
 error: 'Vous n\'avez pas les permissions pour effectuer cette transition' 
 }, { status: 403 })
 }
 
 // Vérifier la validité des transitions
 if (newOrderState && !ALLOWED_TRANSITIONS[order.status]?.includes(newOrderState)) {
 return NextResponse.json({ 
 error: `Transition non autorisée de ${order.status} vers ${newOrderState}` 
 }, { status: 400 })
 }
 
 if (newDeliveryState && !DELIVERY_TRANSITIONS[order.delivery.status]?.includes(newDeliveryState)) {
 return NextResponse.json({ 
 error: `Transition de livraison non autorisée de ${order.delivery.status} vers ${newDeliveryState}` 
 }, { status: 400 })
 }
 
 // Effectuer les transitions
 const updates: any = {}
 const trackingEntry: any = {
 timestamp: new Date(),
 notes: notes || `Transition vers ${newOrderState || newDeliveryState}`,
 actorId: userId,
 actorRole: userRole
 }
 
 // Mise à jour de l'état de commande
 if (newOrderState) {
 updates.status = newOrderState
 trackingEntry.status = newOrderState
 
 // Actions spécifiques selon l'état
 switch (newOrderState) {
 case ORDER_STATES.CONFIRMED:
 // Notifier tous les livreurs disponibles
 await notifyAvailableDrivers(order)
 // Envoyer notification SSE
 sendNotificationToAvailableDrivers({
 type: 'new_order',
 title: 'Nouvelle commande disponible',
 message: `Commande ${order.orderNumber} prête pour la livraison`,
 data: {
 orderId: order._id,
 orderNumber: order.orderNumber,
 total: order.totals.total
 }
 })
 break
 case ORDER_STATES.READY_FOR_PICKUP:
 trackingEntry.notes = 'Commande prête pour récupération'
 break
 case ORDER_STATES.OUT_FOR_DELIVERY:
 trackingEntry.notes = 'Commande en cours de livraison'
 break
 case ORDER_STATES.DELIVERED:
 updates['delivery.actualDeliveryTime'] = new Date()
 trackingEntry.notes = 'Commande livrée avec succès'
 break
 }
 }
 
 // Mise à jour de l'état de livraison
 if (newDeliveryState) {
 updates['delivery.status'] = newDeliveryState
 trackingEntry.deliveryStatus = newDeliveryState
 
 // Actions spécifiques selon l'état de livraison
 switch (newDeliveryState) {
 case DELIVERY_STATES.ASSIGNED:
 trackingEntry.notes = `Commande assignée au livreur ${userId}`
 // Notifier le client
 if (order.userId) {
 sendNotificationToUser(order.userId.toString(), {
 type: 'order_assigned',
 title: 'Livreur assigné',
 message: `Votre commande ${order.orderNumber} a été prise en charge par un livreur`,
 data: {
 orderNumber: order.orderNumber,
 estimatedTime: order.delivery.estimatedDeliveryTime
 }
 })
 }
 break
 case DELIVERY_STATES.PICKED_UP:
 updates['delivery.pickupTime'] = new Date()
 trackingEntry.notes = 'Commande récupérée par le livreur'
 break
 case DELIVERY_STATES.IN_TRANSIT:
 trackingEntry.notes = 'Livreur en route vers le client'
 // Notifier le client
 if (order.userId) {
 sendNotificationToUser(order.userId.toString(), {
 type: 'delivery_update',
 title: 'Livraison en cours',
 message: `Votre commande ${order.orderNumber} est en route`,
 data: {
 orderNumber: order.orderNumber
 }
 })
 }
 break
 case DELIVERY_STATES.ARRIVED:
 trackingEntry.notes = 'Livreur arrivé à destination'
 break
 case DELIVERY_STATES.DELIVERED:
 updates['delivery.actualDeliveryTime'] = new Date()
 updates.status = ORDER_STATES.DELIVERED
 trackingEntry.notes = 'Livraison terminée avec succès'
 // Notifier le client
 if (order.userId) {
 sendNotificationToUser(order.userId.toString(), {
 type: 'order_delivered',
 title: 'Commande livrée',
 message: `Votre commande ${order.orderNumber} a été livrée avec succès`,
 data: {
 orderNumber: order.orderNumber,
 deliveredAt: new Date().toISOString()
 }
 })
 }
 break
 }
 }
 
 // Mise à jour de la géolocalisation
 if (location) {
 updates['delivery.currentLocation'] = {
 lat: location.lat,
 lng: location.lng,
 address: location.address,
 updatedAt: new Date()
 }
 trackingEntry.location = {
 lat: location.lat,
 lng: location.lng,
 address: location.address
 }
 }
 
 // Mise à jour du temps de livraison estimé
 if (estimatedDeliveryTime) {
 updates['delivery.estimatedDeliveryTime'] = new Date(estimatedDeliveryTime)
 }
 
 // Ajouter à l'historique de suivi
 updates.$push = {
 'delivery.trackingHistory': trackingEntry
 }
 
 // Mettre à jour la commande
 const updatedOrder = await Order.findByIdAndUpdate(
 orderId,
 updates,
 { new: true, runValidators: true }
 )
 
 console.log(` Transition de commande ${order.orderNumber}:`, {
 orderState: newOrderState,
 deliveryState: newDeliveryState,
 actor: userId,
 role: userRole,
 timestamp: new Date().toISOString()
 })
 
 // Notifier les parties concernées
 await notifyOrderUpdate(updatedOrder, trackingEntry)
 
 return NextResponse.json({
 success: true,
 message: 'Transition effectuée avec succès',
 order: {
 id: updatedOrder._id,
 orderNumber: updatedOrder.orderNumber,
 status: updatedOrder.status,
 deliveryStatus: updatedOrder.delivery.status,
 updatedAt: updatedOrder.updatedAt
 }
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la transition:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la transition',
 details: error.message 
 }, { status: 500 })
 }
}

// Fonction pour notifier les livreurs disponibles
async function notifyAvailableDrivers(order: any) {
 try {
 // Récupérer tous les livreurs disponibles
 const availableDrivers = await User.find({
 role: 'livreur',
 isAvailable: true,
 isActive: true
 }).select('_id name email')
 
 console.log(` Notification envoyée à ${availableDrivers.length} livreurs pour la commande ${order.orderNumber}`)
 
 // Ici, vous pouvez intégrer un système de notifications push
 // Pour l'instant, on log juste l'information
 for (const driver of availableDrivers) {
 console.log(` Notification pour livreur ${driver.name.first} ${driver.name.last}: Nouvelle commande disponible`)
 }
 
 } catch (error) {
 console.error(' Erreur lors de la notification des livreurs:', error)
 }
}

// Fonction pour notifier les mises à jour de commande
async function notifyOrderUpdate(order: any, trackingEntry: any) {
 try {
 // Notifier le client
 if (order.userId) {
 console.log(` Notification client pour commande ${order.orderNumber}: ${trackingEntry.notes}`)
 }
 
 // Notifier le livreur
 if (order.delivery.assignedDriverId) {
 console.log(` Notification livreur pour commande ${order.orderNumber}: ${trackingEntry.notes}`)
 }
 
 // Notifier l'admin si nécessaire
 if (trackingEntry.deliveryStatus === DELIVERY_STATES.FAILED || 
 order.status === ORDER_STATES.FAILED) {
 console.log(` Notification admin pour commande ${order.orderNumber}: Intervention requise`)
 }
 
 } catch (error) {
 console.error(' Erreur lors de la notification des mises à jour:', error)
 }
}
