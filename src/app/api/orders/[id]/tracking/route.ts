import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function GET(
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
 
 const userId = decoded.userId
 const userRole = decoded.role
 
 // Récupérer la commande
 const order = await Order.findById(orderId)
 if (!order) {
 return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
 }
 
 // Vérifier les permissions
 let hasAccess = false
 
 switch (userRole) {
 case 'admin':
 hasAccess = true
 break
 case 'client':
 hasAccess = order.userId.toString() === userId
 break
 case 'livreur':
 hasAccess = order.delivery.assignedDriverId?.toString() === userId
 break
 default:
 hasAccess = false
 }
 
 if (!hasAccess) {
 return NextResponse.json({ 
 error: 'Vous n\'avez pas accès aux informations de cette commande' 
 }, { status: 403 })
 }
 
 // Récupérer les informations du livreur si assigné
 let driverInfo = null
 if (order.delivery.assignedDriverId) {
 const driver = await User.findById(order.delivery.assignedDriverId)
 .select('name phone vehicleType licensePlate rating')
 
 if (driver) {
 driverInfo = {
 id: driver._id,
 name: `${driver.name.first} ${driver.name.last}`,
 phone: driver.phone,
 vehicleType: driver.vehicleType,
 licensePlate: driver.licensePlate,
 rating: driver.rating
 }
 }
 }
 
 // Calculer le temps estimé restant si en cours de livraison
 let estimatedTimeRemaining = null
 if (order.delivery.status === 'in_transit' && order.delivery.currentLocation) {
 // Ici, vous pourriez intégrer Google Maps API pour calculer le temps restant
 // Pour l'instant, on utilise une estimation basique
 const now = new Date()
 const estimatedDelivery = order.delivery.estimatedDeliveryTime
 
 if (estimatedDelivery) {
 const timeDiff = new Date(estimatedDelivery).getTime() - now.getTime()
 if (timeDiff > 0) {
 estimatedTimeRemaining = Math.ceil(timeDiff / (1000 * 60)) // en minutes
 }
 }
 }
 
 // Formater les données de suivi
 const trackingData = {
 order: {
 id: order._id,
 orderNumber: order.orderNumber,
 status: order.status,
 deliveryStatus: order.delivery.status,
 estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
 actualDeliveryTime: order.delivery.actualDeliveryTime,
 deliveryCode: order.delivery.deliveryCode
 },
 customer: {
 name: `${order.userId.name.first} ${order.userId.name.last}`,
 phone: order.userId.phone,
 address: order.address
 },
 driver: driverInfo,
 currentLocation: order.delivery.currentLocation ? {
 lat: order.delivery.currentLocation.lat,
 lng: order.delivery.currentLocation.lng,
 address: order.delivery.currentLocation.address,
 updatedAt: order.delivery.currentLocation.updatedAt
 } : null,
 estimatedTimeRemaining,
 trackingHistory: order.delivery.trackingHistory.map((entry: any) => ({
 status: entry.status,
 timestamp: entry.timestamp,
 notes: entry.notes,
 location: entry.location ? {
 lat: entry.location.lat,
 lng: entry.location.lng,
 address: entry.location.address
 } : null,
 actorRole: entry.actorRole
 })),
 // Informations pour Google Maps
 mapData: {
 destination: {
 lat: null, // À géocoder depuis l'adresse
 lng: null, // À géocoder depuis l'adresse
 address: `${order.address.street}, ${order.address.city} ${order.address.postalCode}`
 },
 currentPosition: order.delivery.currentLocation,
 waypoints: order.delivery.trackingHistory
 .filter((entry: any) => entry.location)
 .map((entry: any) => ({
 lat: entry.location.lat,
 lng: entry.location.lng,
 timestamp: entry.timestamp
 }))
 }
 }
 
 console.log(`Données de suivi récupérées pour la commande ${order.orderNumber}`)
 
 return NextResponse.json({
 success: true,
 tracking: trackingData
 })
 
 } catch (error: any) {
 console.error('Erreur lors de la récupération du suivi:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la récupération du suivi',
 details: error.message 
 }, { status: 500 })
 }
}

// API pour mettre à jour le statut de livraison en temps réel
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
 
 const { status, notes, location } = await request.json()
 
 // Récupérer la commande
 const order = await Order.findById(orderId)
 if (!order) {
 return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
 }
 
 // Vérifier que c'est le livreur assigné
 if (order.delivery.assignedDriverId?.toString() !== decoded.userId) {
 return NextResponse.json({ 
 error: 'Seul le livreur assigné peut mettre à jour cette commande' 
 }, { status: 403 })
 }
 
 // Récupérer le livreur pour les notifications
 const livreur = await User.findById(decoded.userId)
 
 // Mettre à jour le statut
 if (status) {
 order.delivery.status = status
 
 // Actions spécifiques selon le statut avec notifications
 switch (status) {
 case 'picked_up':
 // ÉTAPE 2: Commande récupérée
 order.delivery.pickupTime = new Date()
 order.status = 'preparing'
 order.orderProgress = {
 step: 'preparation',
 currentStep: 2,
 totalSteps: 4,
 estimatedCompletionTime: new Date(Date.now() + 45 * 60 * 1000) // +45min
 }
 
 // Notification au client
 try {
 const { sendNotificationToUser } = await import('@/lib/notifications')
 sendNotificationToUser(order.userId.toString(), {
 type: 'delivery_update',
 title: ' Commande récupérée',
 message: `${livreur?.name.first} a récupéré votre commande et est en route`,
 data: { orderId: order._id, orderNumber: order.orderNumber, status: 'picked_up' }
 })
 } catch (e) { console.error('Erreur notification:', e) }
 
 console.log(` ÉTAPE 2: Commande ${order.orderNumber} récupérée`)
 break
 
 case 'in_transit':
 // ÉTAPE 3: En route vers le client
 order.status = 'out_for_delivery'
 order.orderProgress = {
 step: 'in_transit',
 currentStep: 3,
 totalSteps: 4,
 estimatedCompletionTime: new Date(Date.now() + 30 * 60 * 1000) // +30min
 }
 
 // Notification au client
 try {
 const { sendNotificationToUser } = await import('@/lib/notifications')
 sendNotificationToUser(order.userId.toString(), {
 type: 'delivery_update',
 title: ' En route !',
 message: `${livreur?.name.first} est en route vers vous`,
 data: { orderId: order._id, orderNumber: order.orderNumber, status: 'in_transit' }
 })
 } catch (e) { console.error('Erreur notification:', e) }
 
 console.log(` ÉTAPE 3: Commande ${order.orderNumber} en transit`)
 break
 
 case 'arrived':
 // Livreur arrivé à destination
 // Notification au client
 try {
 const { sendNotificationToUser } = await import('@/lib/notifications')
 sendNotificationToUser(order.userId.toString(), {
 type: 'delivery_update',
 title: ' Livreur arrivé !',
 message: `${livreur?.name.first} est arrivé à votre adresse`,
 data: { orderId: order._id, orderNumber: order.orderNumber, status: 'arrived' }
 })
 } catch (e) { console.error('Erreur notification:', e) }
 
 console.log(` Livreur arrivé pour la commande ${order.orderNumber}`)
 break
 
 case 'delivered':
 // ÉTAPE 4: Commande livrée
 order.delivery.actualDeliveryTime = new Date()
 order.status = 'delivered'
 order.orderProgress = {
 step: 'completed',
 currentStep: 4,
 totalSteps: 4,
 estimatedCompletionTime: new Date()
 }
 
 // Notification au client
 try {
 const { sendNotificationToUser } = await import('@/lib/notifications')
 sendNotificationToUser(order.userId.toString(), {
 type: 'order_delivered',
 title: ' Commande livrée !',
 message: `Votre commande ${order.orderNumber} a été livrée avec succès`,
 data: { orderId: order._id, orderNumber: order.orderNumber, status: 'delivered' }
 })
 } catch (e) { console.error('Erreur notification:', e) }
 
 console.log(` ÉTAPE 4: Commande ${order.orderNumber} livrée`)
 break
 }
 }
 
 // Mettre à jour la localisation si fournie
 if (location) {
 order.delivery.currentLocation = {
 lat: location.lat,
 lng: location.lng,
 address: location.address,
 updatedAt: new Date()
 }
 }
 
 // Ajouter à l'historique
 order.delivery.trackingHistory.push({
 status: status || 'location_update',
 timestamp: new Date(),
 notes: notes || `Statut mis à jour: ${status}`,
 location: location ? {
 lat: location.lat,
 lng: location.lng,
 address: location.address
 } : null,
 actorId: decoded.userId,
 actorRole: 'livreur'
 })
 
 await order.save({ validateBeforeSave: false })
 
 console.log(`Statut de livraison mis à jour pour ${order.orderNumber}: ${status}`)
 
 return NextResponse.json({
 success: true,
 message: 'Statut mis à jour avec succès',
 order: {
 id: order._id,
 orderNumber: order.orderNumber,
 deliveryStatus: order.delivery.status,
 updatedAt: order.updatedAt
 }
 })
 
 } catch (error: any) {
 console.error('Erreur lors de la mise à jour du statut:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la mise à jour du statut',
 details: error.message 
 }, { status: 500 })
 }
}
