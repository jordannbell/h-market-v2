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
 
 // Récupérer toutes les commandes non livrées
 const allOrders = await Order.find({
 'delivery.status': { $ne: 'delivered' }
 }).populate('userId', 'name email phone')
 
 console.log(` Requête MongoDB: delivery.status != 'delivered'`)
 console.log(` ${allOrders.length} commandes trouvées`)
 
 console.log(` ${allOrders.length} commandes récupérées pour le livreur ${decoded.userId}`)
 
 return NextResponse.json({
 success: true,
 deliveries: allOrders.map(order => ({
 _id: order._id.toString(),
 orderNumber: order.orderNumber,
 customer: {
 name: order.userId ? `${order.userId.name?.first || ''} ${order.userId.name?.last || ''}`.trim() : 'Client inconnu',
 email: order.userId?.email || '',
 phone: order.userId?.phone || ''
 },
 address: order.address || {},
 items: (order.items || []).map((item: OrderItem) => ({
 title: item.title,
 quantity: item.quantity,
 totalPrice: item.totalPrice,
 image: item.image
 })),
 totals: {
 total: order.totals?.total || 0
 },
 status: order.status,
 deliveryStatus: order.delivery?.status || 'pending',
 deliveryCode: order.delivery?.deliveryCode || '',
 estimatedDeliveryTime: order.delivery?.estimatedDeliveryTime,
 currentLocation: order.delivery?.currentLocation,
 createdAt: order.createdAt
 }))
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la récupération de toutes les commandes:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la récupération des commandes',
 details: error.message 
 }, { status: 500 })
 }
}
