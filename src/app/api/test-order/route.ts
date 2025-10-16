import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import OrderSimple from '@/models/OrderSimple'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
 try {
 console.log('=== TEST: Création de commande simplifiée ===')
 
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

 if (!delivery || !delivery.mode || !delivery.slot || !delivery.scheduledAt) {
 return NextResponse.json({ error: 'Informations de livraison requises' }, { status: 400 })
 }

 console.log('Validation des données OK')

 // Calculer les totaux
 const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
 const deliveryFee = delivery.mode === 'express' ? 5.99 : 2.99
 const taxes = subtotal * 0.20 // TVA 20%
 const discounts = 0 // À implémenter plus tard
 const total = subtotal + deliveryFee + taxes - discounts

 console.log('Totaux calculés:', { subtotal, deliveryFee, taxes, total })

 // Créer la commande avec le modèle simplifié
 console.log('Création de l\'objet OrderSimple...')
 
 const orderData = {
 userId: user._id,
 items: items.map(item => ({
 productId: item._id,
 title: item.title,
 slug: item.slug,
 image: item.image,
 price: item.price,
 quantity: item.quantity,
 totalPrice: item.totalPrice
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
 slot: delivery.slot,
 scheduledAt: new Date(delivery.scheduledAt),
 status: 'pending'
 },
 status: 'pending'
 }
 
 console.log('Données de la commande:', JSON.stringify(orderData, null, 2))
 
 const order = new OrderSimple(orderData)
 console.log('Objet OrderSimple créé:', order)

 console.log('Sauvegarde de la commande...')
 await order.save()
 console.log('Commande sauvegardée avec succès')

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
 console.error('=== ERREUR lors de la création de la commande simplifiée ===')
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
