import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
 try {
 console.log('=== DEBUG: Création de commande ===')
 
 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 console.log('Token reçu:', token ? 'Présent' : 'Manquant')
 
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }

 const decoded = await verifyToken(token)
 console.log('Token décodé:', decoded ? 'Valide' : 'Invalide')
 
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }

 console.log('Connexion à la base de données...')
 await connectDB()
 console.log('Base de données connectée')

 // Vérifier que l'utilisateur existe
 const user = await User.findById(decoded.userId)
 console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non')
 
 if (!user) {
 return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
 }

 const body = await request.json()
 console.log('Données reçues:', { 
 itemsCount: body.items?.length || 0,
 hasAddress: !!body.address,
 hasDelivery: !!body.delivery
 })
 
 const { items, address, delivery, paymentMethod } = body

 // Validation des données
 if (!items || !Array.isArray(items) || items.length === 0) {
 return NextResponse.json({ error: 'Le panier ne peut pas être vide' }, { status: 400 })
 }

 if (!address || !address.street || !address.city || !address.postalCode) {
 return NextResponse.json({ error: 'Adresse de livraison requise' }, { status: 400 })
 }

 if (!delivery || !delivery.mode) {
 return NextResponse.json({ error: 'Mode de livraison requis' }, { status: 400 })
 }

 // Validation spécifique selon le mode de livraison
 if (delivery.mode === 'planned') {
 if (!delivery.slot || !delivery.scheduledAt) {
 return NextResponse.json({ error: 'Date et créneau requis pour la livraison planifiée' }, { status: 400 })
 }
 } else if (delivery.mode === 'outside_idf') {
 if (!delivery.scheduledAt) {
 return NextResponse.json({ error: 'Date de livraison requise pour la livraison hors Île-de-France' }, { status: 400 })
 }
 }
 // Pour 'express', pas de validation supplémentaire (livraison immédiate)

 console.log('Validation des données OK')

 // Calculer les totaux
 const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
 
 // Calculer les frais de livraison selon le mode
 let deliveryFee = 0
 switch (delivery.mode) {
 case 'planned':
 deliveryFee = 3.99
 break
 case 'express':
 deliveryFee = 5.99
 break
 case 'outside_idf':
 deliveryFee = 8.99
 break
 default:
 deliveryFee = 3.99
 }
 
 const taxes = subtotal * 0.20 // TVA 20%
 const discounts = 0 // À implémenter plus tard
 const total = subtotal + deliveryFee + taxes - discounts

 console.log('Totaux calculés:', { subtotal, deliveryFee, taxes, total })

 // Créer la commande
 console.log('Création de l\'objet Order...')
 
 // Log des données avant création
 const orderData = {
 orderNumber: `HM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
 userId: user._id,
 items: items.map(item => ({
 productId: item._id,
 title: item.title,
 slug: item.slug,
 image: item.image,
 price: item.price,
 quantity: item.quantity,
 totalPrice: item.price * item.quantity // Calculer le prix total
 })),
 totals: {
 subtotal,
 deliveryFee,
 taxes,
 discounts,
 total
 },
 payment: {
 method: paymentMethod || 'stripe',
 status: 'pending',
 amount: total,
 currency: 'EUR'
 },
 address: {
 street: address.street,
 city: address.city,
 postalCode: address.postalCode,
 country: address.country || 'France'
 },
 delivery: {
 mode: delivery.mode,
 slot: delivery.mode === 'planned' ? delivery.slot : undefined,
 scheduledAt: delivery.mode === 'express' ? undefined : new Date(delivery.scheduledAt),
 status: 'pending'
 },
 status: 'pending'
 }
 
 console.log('Données de la commande:', JSON.stringify(orderData, null, 2))
 
 const order = new Order(orderData)
 console.log('Objet Order créé:', order)

 console.log('Sauvegarde de la commande...')
 await order.save()
 console.log('Commande sauvegardée avec succès')

 // Envoyer une notification SSE à tous les livreurs disponibles
 try {
 const { sendNotificationToRole } = await import('@/lib/notifications')
 
 sendNotificationToRole('livreur', {
 type: 'new_order',
 title: 'Nouvelle commande disponible',
 message: `Commande ${order.orderNumber} - ${order.totals.total.toFixed(2)}€ - ${address.city}`,
 data: {
 orderId: order._id,
 orderNumber: order.orderNumber,
 total: order.totals.total,
 address: address,
 deliveryMode: delivery.mode,
 itemsCount: items.length
 }
 })
 
 console.log(' Notification SSE envoyée aux livreurs')
 } catch (notificationError) {
 console.error('Erreur lors de l\'envoi de la notification:', notificationError)
 // Ne pas faire échouer la création de commande pour une erreur de notification
 }

 return NextResponse.json({
 success: true,
 order: {
 id: order._id,
 orderNumber: order.orderNumber,
 total: order.totals.total,
 status: order.status
 }
 })

 } catch (error: any) {
 console.error('=== ERREUR lors de la création de la commande ===')
 console.error('Type d\'erreur:', error.constructor.name)
 console.error('Message:', error.message)
 console.error('Stack:', error.stack)
 console.error('Erreur complète:', error)
 
 return NextResponse.json(
 { 
 error: 'Erreur lors de la création de la commande',
 details: error.message,
 type: error.constructor.name
 },
 { status: 500 }
 )
 }
}

export async function GET(request: NextRequest) {
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
 
 // Récupérer toutes les commandes de l'utilisateur connecté
 const userOrders = await Order.find({
 userId: decoded.userId
 })
 .populate('userId', 'name email phone')
 .sort({ createdAt: -1 }) // Plus récentes en premier
 
 console.log(` ${userOrders.length} commandes trouvées pour l'utilisateur ${decoded.userId}`)
 
 return NextResponse.json({
 success: true,
 orders: userOrders.map(order => ({
 _id: order._id,
 orderNumber: order.orderNumber,
 status: order.status,
 payment: order.payment,
 delivery: order.delivery,
 orderProgress: order.orderProgress,
 items: order.items,
 totals: order.totals,
 address: order.address,
 createdAt: order.createdAt,
 updatedAt: order.updatedAt
 }))
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la récupération des commandes:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la récupération des commandes',
 details: error.message 
 }, { status: 500 })
 }
}
