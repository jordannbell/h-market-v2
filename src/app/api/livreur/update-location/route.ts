import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import Order from '@/models/Order'
import { DeliveryLocation } from '@/types/jwt'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
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
 
 const { latitude, longitude, address, orderId } = await request.json()
 
 // Validation des coordonnées
 if (typeof latitude !== 'number' || typeof longitude !== 'number') {
 return NextResponse.json({ error: 'Coordonnées GPS invalides' }, { status: 400 })
 }
 
 // Mettre à jour la position du livreur dans son profil
 await User.findByIdAndUpdate(decoded.userId, {
 'location.latitude': latitude,
 'location.longitude': longitude,
 'location.updatedAt': new Date()
 })
 
 // Si une commande est spécifiée, mettre à jour sa position de livraison
 if (orderId) {
 const order = await Order.findById(orderId)
 if (order && order.delivery.assignedDriverId?.toString() === decoded.userId) {
 order.delivery.currentLocation = {
 lat: latitude,
 lng: longitude,
 address: address,
 updatedAt: new Date()
 }
 
 // Ajouter à l'historique de suivi
 order.delivery.trackingHistory.push({
 status: 'location_update',
 location: {
 lat: latitude,
 lng: longitude,
 address: address
 },
 timestamp: new Date(),
 notes: 'Position mise à jour par le livreur'
 })
 
 await order.save()
 
 console.log(` Position mise à jour pour la commande ${order.orderNumber}:`, {
 lat: latitude,
 lng: longitude,
 address: address
 })
 }
 }
 
 console.log(` Position du livreur ${decoded.userId} mise à jour:`, {
 lat: latitude,
 lng: longitude,
 address: address
 })
 
 return NextResponse.json({
 success: true,
 message: 'Position mise à jour avec succès',
 location: {
 lat: latitude,
 lng: longitude,
 address: address,
 updatedAt: new Date()
 }
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la mise à jour de la position:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la mise à jour de la position',
 details: error.message 
 }, { status: 500 })
 }
}
