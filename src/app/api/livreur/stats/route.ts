import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import Order from '@/models/Order'
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
 
 // Récupérer les informations du livreur
 const livreur = await User.findById(decoded.userId)
 if (!livreur) {
 return NextResponse.json({ error: 'Livreur non trouvé' }, { status: 404 })
 }
 
 // Calculer la date d'aujourd'hui (début et fin)
 const today = new Date()
 today.setHours(0, 0, 0, 0)
 const tomorrow = new Date(today)
 tomorrow.setDate(tomorrow.getDate() + 1)
 
 // Statistiques du jour
 const todayDeliveries = await Order.countDocuments({
 'delivery.assignedDriverId': decoded.userId,
 'delivery.status': { $in: ['assigned', 'picked_up', 'in_transit', 'delivered'] },
 createdAt: { $gte: today, $lt: tomorrow }
 })
 
 // Revenus du jour
 const todayRevenue = await Order.aggregate([
 {
 $match: {
 'delivery.assignedDriverId': decoded.userId,
 'delivery.status': 'delivered',
 createdAt: { $gte: today, $lt: tomorrow }
 }
 },
 {
 $group: {
 _id: null,
 total: { $sum: '$totals.total' }
 }
 }
 ])
 
 // Livraisons actives
 const activeDeliveries = await Order.find({
 'delivery.assignedDriverId': decoded.userId,
 'delivery.status': { $in: ['assigned', 'picked_up', 'in_transit'] }
 }).populate('userId', 'name email phone')
 
 // Calculer la note moyenne
 const rating = livreur.rating || 0
 const totalDeliveries = livreur.totalDeliveries || 0
 
 // Statistiques globales
 const totalDeliveriesCompleted = await Order.countDocuments({
 'delivery.assignedDriverId': decoded.userId,
 'delivery.status': 'delivered'
 })
 
 const totalRevenue = await Order.aggregate([
 {
 $match: {
 'delivery.assignedDriverId': decoded.userId,
 'delivery.status': 'delivered'
 }
 },
 {
 $group: {
 _id: null,
 total: { $sum: '$totals.total' }
 }
 }
 ])
 
 const stats = {
 isAvailable: livreur.isAvailable || false,
 todayDeliveries,
 todayRevenue: todayRevenue[0]?.total || 0,
 rating: Math.round(rating * 10) / 10, // Arrondir à 1 décimale
 totalDeliveries: totalDeliveriesCompleted,
 totalRevenue: totalRevenue[0]?.total || 0,
 vehicleType: livreur.vehicleType || 'Non spécifié',
 deliveryZone: livreur.deliveryZone || 'Non spécifié',
 lastActive: livreur.location?.updatedAt || null
 }
 
 const formattedActiveDeliveries = activeDeliveries.map(order => ({
 id: order._id.toString(),
 orderNumber: order.orderNumber,
 customer: {
 name: order.userId ? `${order.userId.name?.first || ''} ${order.userId.name?.last || ''}`.trim() || 'Client inconnu' : 'Client inconnu',
 email: order.userId?.email || '',
 phone: order.userId?.phone || ''
 },
 address: {
 street: order.address?.street || '',
 city: order.address?.city || '',
 postalCode: order.address?.postalCode || ''
 },
 status: order.delivery.status,
 estimatedDeliveryTime: order.delivery.estimatedDeliveryTime,
 total: order.totals.total,
 createdAt: order.createdAt
 }))
 
 console.log(` Statistiques récupérées pour le livreur ${decoded.userId}:`, {
 todayDeliveries: stats.todayDeliveries,
 todayRevenue: stats.todayRevenue,
 activeDeliveries: formattedActiveDeliveries.length
 })
 
 return NextResponse.json({
 success: true,
 stats,
 activeDeliveries: formattedActiveDeliveries
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la récupération des statistiques:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la récupération des statistiques',
 details: error.message 
 }, { status: 500 })
 }
}
