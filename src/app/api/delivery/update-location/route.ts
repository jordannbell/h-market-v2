import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import { DeliveryLocation } from '@/types/jwt'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// Rate limiting pour éviter les abus de géolocalisation
const locationUpdateLimits = new Map<string, { count: number, lastReset: number }>()
const MAX_UPDATES_PER_MINUTE = 10

export async function POST(request: NextRequest) {
 try {
 await connectDB()
 
 const { orderId, latitude, longitude, address } = await request.json()
 
 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }
 
 const decoded = await verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }
 
 // Rate limiting
 const userId = decoded.userId
 const now = Date.now()
 const userLimit = locationUpdateLimits.get(userId)
 
 if (userLimit) {
 // Reset le compteur si c'est une nouvelle minute
 if (now - userLimit.lastReset > 60000) {
 userLimit.count = 0
 userLimit.lastReset = now
 }
 
 if (userLimit.count >= MAX_UPDATES_PER_MINUTE) {
 return NextResponse.json({ 
 error: 'Trop de mises à jour de localisation. Attendez avant de réessayer.' 
 }, { status: 429 })
 }
 
 userLimit.count++
 } else {
 locationUpdateLimits.set(userId, { count: 1, lastReset: now })
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
 
 // Mettre à jour la position actuelle
 order.delivery.currentLocation = {
 lat: latitude,
 lng: longitude,
 address: address,
 updatedAt: new Date()
 }
 
 // Ajouter à l'historique de suivi si c'est une nouvelle position
 const lastLocation = order.delivery.trackingHistory[order.delivery.trackingHistory.length - 1]
 if (!lastLocation || 
 lastLocation.location?.lat !== latitude || 
 lastLocation.location?.lng !== longitude) {
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
 }
 
 // Sauvegarder les modifications
 await order.save()
 
 console.log(`Position mise à jour pour la livraison ${order.orderNumber}:`, {
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
 console.error('Erreur lors de la mise à jour de la position:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la mise à jour de la position',
 details: error.message 
 }, { status: 500 })
 }
}
