import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import { OrderItem } from '@/types/jwt'

export async function PATCH(
 request: NextRequest,
 context: { params: Promise<{ orderId: string }> }
) {
 try {
 const { orderId } = await context.params
 const { status } = await request.json()

 if (!status) {
 return NextResponse.json(
 { error: 'Le statut est requis' },
 { status: 400 }
 )
 }

 // Statuts valides
 const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']
 
 if (!validStatuses.includes(status)) {
 return NextResponse.json(
 { error: 'Statut invalide' },
 { status: 400 }
 )
 }

 await connectDB()
 console.log(` Mise à jour du statut de la commande ${orderId} vers: ${status}`)

 // Mettre à jour la commande
 const updatedOrder = await Order.findByIdAndUpdate(
 orderId,
 { 
 status,
 updatedAt: new Date()
 },
 { new: true }
 )

 if (!updatedOrder) {
 return NextResponse.json(
 { error: 'Commande non trouvée' },
 { status: 404 }
 )
 }

 // Convertir en objet simple
 const orderObj = updatedOrder.toObject()

 console.log(` Statut de la commande ${orderId} mis à jour vers: ${status}`)

 // Formater la réponse
 const formattedOrder = {
 _id: orderObj._id,
 orderNumber: orderObj.orderNumber,
 userId: orderObj.userId,
 items: orderObj.items.map((item) => ({
 productId: item.productId.toString(),
 title: item.title,
 slug: item.slug,
 image: item.image,
 price: item.price,
 quantity: item.quantity,
 totalPrice: item.totalPrice
 })),
 totals: orderObj.totals,
 payment: {
 method: orderObj.payment.method,
 status: orderObj.payment.status,
 amount: orderObj.payment.amount,
 currency: orderObj.payment.currency
 },
 address: orderObj.address,
 delivery: {
 mode: orderObj.delivery.mode,
 status: orderObj.delivery.status,
 estimatedDeliveryTime: orderObj.delivery.estimatedDeliveryTime,
 actualDeliveryTime: orderObj.delivery.actualDeliveryTime,
 assignedDriverId: orderObj.delivery.assignedDriverId
 },
 status: orderObj.status,
 orderProgress: orderObj.orderProgress,
 notes: orderObj.notes,
 createdAt: orderObj.createdAt,
 updatedAt: orderObj.updatedAt
 }

 return NextResponse.json({
 success: true,
 message: `Statut de la commande mis à jour vers: ${status}`,
 order: formattedOrder
 })

 } catch (error) {
 console.error(' Erreur lors de la mise à jour du statut:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la mise à jour du statut' },
 { status: 500 }
 )
 }
}
