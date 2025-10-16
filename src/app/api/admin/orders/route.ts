import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import { OrderItem } from '@/types/jwt'

export async function GET(_request: NextRequest) {
 try {
 await connectDB()
 console.log(' Connexion à MongoDB réussie')

 // Récupérer toutes les commandes avec les détails complets
 const orders = await Order.find({})
 .sort({ createdAt: -1 }) // Plus récentes en premier
 .lean()

 console.log(` ${orders.length} commandes récupérées`)

 // Formater les données pour la réponse
 const formattedOrders = orders.map(order => ({
 _id: order._id,
 orderNumber: order.orderNumber,
 userId: order.userId,
 items: order.items.map((item) => ({
 productId: item.productId.toString(),
 title: item.title,
 slug: item.slug,
 image: item.image,
 price: item.price,
 quantity: item.quantity,
 totalPrice: item.totalPrice
 })),
 totals: order.totals,
 payment: {
 method: order.payment.method,
 status: order.payment.status,
 amount: order.payment.amount,
 currency: order.payment.currency
 },
 address: order.address,
 delivery: {
 mode: order.delivery.mode,
 status: order.delivery.status,
 estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
 actualDeliveryTime: order.delivery.actualDeliveryTime,
 assignedDriverId: order.delivery.assignedDriverId
 },
 status: order.status,
 orderProgress: order.orderProgress,
 notes: order.notes,
 createdAt: order.createdAt,
 updatedAt: order.updatedAt
 }))

 return NextResponse.json({
 success: true,
 orders: formattedOrders,
 total: formattedOrders.length
 })

 } catch (error) {
 console.error(' Erreur lors de la récupération des commandes:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la récupération des commandes' },
 { status: 500 }
 )
 }
}
