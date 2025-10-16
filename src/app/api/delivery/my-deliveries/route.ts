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
 
 // Récupérer les livraisons assignées au livreur (exclure les livraisons terminées)
 const myDeliveries = await Order.find({
   'delivery.assignedDriverId': decoded.userId,
   'delivery.status': { $in: ['assigned', 'picked_up', 'in_transit'] }
 }).populate('userId', 'name email phone')
 
 console.log(` ${myDeliveries.length} livraisons assignées au livreur ${decoded.userId}`)
 
 return NextResponse.json({
   success: true,
   deliveries: myDeliveries.map(order => ({
     _id: order._id.toString(),
     orderNumber: order.orderNumber,
     customer: {
       name: `${order.userId.name.first} ${order.userId.name.last}`,
       email: order.userId.email,
       phone: order.userId.phone
     },
     address: order.address,
     deliveryStatus: order.delivery.status,
     delivery: {
       status: order.delivery.status,
       mode: order.delivery.mode,
       scheduledAt: order.delivery.scheduledAt,
       estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
       currentLocation: order.delivery.currentLocation,
       deliveryCode: order.delivery.deliveryCode,
       pickupTime: order.delivery.pickupTime
     },
     items: order.items.map((item: OrderItem) => ({
       title: item.title,
       quantity: item.quantity,
       totalPrice: item.totalPrice,
       image: item.image || '/placeholder-product.jpg'
     })),
     totals: {
       total: order.totals.total
     },
     orderProgress: order.orderProgress,
     createdAt: order.createdAt
   }))
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la récupération des livraisons:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la récupération des livraisons',
 details: error.message 
 }, { status: 500 })
 }
}
