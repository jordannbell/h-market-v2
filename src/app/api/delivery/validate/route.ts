import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
 try {
 await connectDB()
 
 const { orderId, deliveryCode } = await request.json()
 
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
 
 // Vérifier que la commande existe et est assignée au livreur
 const order = await Order.findById(orderId)
 if (!order) {
 return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
 }
 
 if (order.delivery.assignedDriverId?.toString() !== decoded.userId) {
 return NextResponse.json({ error: 'Cette commande ne vous est pas assignée' }, { status: 403 })
 }
 
 if (order.delivery.status === 'delivered') {
 return NextResponse.json({ error: 'Cette commande est déjà livrée' }, { status: 400 })
 }
 
 // Vérifier le code de livraison
 if (order.delivery.deliveryCode !== deliveryCode) {
 return NextResponse.json({ error: 'Code de livraison incorrect' }, { status: 400 })
 }
 
 // Marquer la livraison comme terminée
 order.delivery.status = 'delivered'
 order.delivery.actualDeliveryTime = new Date()
 order.status = 'delivered'
 order.orderProgress.step = 'completed'
 order.orderProgress.currentStep = 3
 
 // Ajouter à l'historique de suivi
 order.delivery.trackingHistory.push({
 status: 'delivered',
 timestamp: new Date(),
 notes: `Livraison terminée et validée par le livreur ${decoded.userId}`
 })
 
 // Sauvegarder les modifications
 await order.save()
 
 console.log(` Livraison ${order.orderNumber} validée avec succès par le livreur ${decoded.userId}`)
 
 return NextResponse.json({
 success: true,
 message: 'Livraison validée avec succès',
 order: {
 id: order._id,
 orderNumber: order.orderNumber,
 status: order.status,
 delivery: {
 status: order.delivery.status,
 actualDeliveryTime: order.delivery.actualDeliveryTime
 },
 orderProgress: order.orderProgress
 }
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la validation de la livraison:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la validation de la livraison',
 details: error.message 
 }, { status: 500 })
 }
}
