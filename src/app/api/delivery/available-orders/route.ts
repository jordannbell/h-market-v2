import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import { OrderItem } from '@/types/jwt'
import { verifyToken } from '@/lib/auth'

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
 
 // Vérifier que c'est un livreur
 if (decoded.role !== 'livreur') {
 return NextResponse.json({ error: 'Accès réservé aux livreurs' }, { status: 403 })
 }
 
 // Récupérer les commandes disponibles pour la livraison
 // Logique professionnelle : commandes créées (pending/confirmed), non assignées
 const availableOrders = await Order.find({
 $and: [
 { status: { $in: ['pending', 'confirmed', 'ready_for_pickup'] } }, // Inclure les commandes en attente
 { 'payment.status': { $in: ['paid', 'pending'] } }, // Inclure les commandes en attente de paiement
 { 'delivery.assignedDriverId': { $exists: false } }, // Pas encore assignée
 { 'delivery.status': 'pending' } // Statut de livraison en attente
 ]
 })
 .populate('userId', 'name email phone')
 .sort({ 
 createdAt: -1 // Plus récentes en premier
 })
 
 console.log(` ${availableOrders.length} commandes disponibles pour la livraison`)
 
 return NextResponse.json({
 success: true,
 orders: availableOrders.map(order => ({
 _id: order._id,
 orderNumber: order.orderNumber,
 customer: {
 name: `${order.userId.name.first} ${order.userId.name.last}`,
 email: order.userId.email,
 phone: order.userId.phone
 },
 address: order.address,
 items: order.items.map((item: OrderItem) => ({
 title: item.title,
 quantity: item.quantity,
 totalPrice: item.totalPrice,
 image: item.image
 })),
 totals: order.totals,
 status: order.status,
 deliveryStatus: order.delivery.status,
 estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
 createdAt: order.createdAt,
 // Informations de distance et temps estimé (à calculer côté client)
 estimatedDistance: null, // Calculé côté client avec Google Maps
 estimatedDuration: null // Calculé côté client avec Google Maps
 }))
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la récupération des commandes disponibles:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la récupération des commandes disponibles',
 details: error.message 
 }, { status: 500 })
 }
}
