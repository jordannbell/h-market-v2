import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import { verifyToken } from '@/lib/auth'

export async function PUT(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
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
 
 const { deliveryStatus, notes } = await request.json()
 
 if (!deliveryStatus) {
 return NextResponse.json({ error: 'Statut de livraison requis' }, { status: 400 })
 }
 
 // Vérifier que la commande existe
 const { id: orderId } = await context.params
 const order = await Order.findById(orderId)
 if (!order) {
 return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
 }
 
 // Vérifier que le livreur est bien assigné à cette commande
 if (order.delivery.assignedDriverId?.toString() !== decoded.userId) {
 return NextResponse.json({ error: 'Vous n\'êtes pas autorisé à modifier cette commande' }, { status: 403 })
 }
 
 // Mettre à jour le statut de livraison
 order.delivery.status = deliveryStatus
 
 // Ajouter des informations selon le statut
 switch (deliveryStatus) {
 case 'picked_up':
 order.delivery.pickupTime = new Date()
 break
 case 'in_transit':
 order.delivery.inTransitTime = new Date()
 break
 case 'delivered':
 order.delivery.actualDeliveryTime = new Date()
 break
 }
 
 // Ajouter à l'historique de suivi
 order.delivery.trackingHistory.push({
 status: deliveryStatus,
 timestamp: new Date(),
 notes: notes || `Statut mis à jour par le livreur: ${deliveryStatus}`,
 driverId: decoded.userId
 })
 
 await order.save()
 
 console.log(` Statut de la commande ${order.orderNumber} mis à jour:`, {
 newStatus: deliveryStatus,
 driverId: decoded.userId,
 timestamp: new Date().toISOString()
 })
 
 return NextResponse.json({
 success: true,
 message: `Statut mis à jour: ${deliveryStatus}`,
 order: {
 id: order._id,
 orderNumber: order.orderNumber,
 deliveryStatus: order.delivery.status,
 updatedAt: order.updatedAt
 }
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la mise à jour du statut:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la mise à jour du statut',
 details: error.message 
 }, { status: 500 })
 }
}
