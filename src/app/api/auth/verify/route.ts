import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { connectDB } from '@/lib/database'
import User from '@/models/User'

export async function POST(request: NextRequest) {
 try {
 await connectDB()
 
 // Vérifier si le body est vide
 const body = await request.text()
 if (!body) {
 return NextResponse.json({ 
 valid: false, 
 error: 'Body de la requête vide' 
 }, { status: 400 })
 }
 
 let tokenData
 try {
 tokenData = JSON.parse(body)
 } catch (parseError) {
 return NextResponse.json({ 
 valid: false, 
 error: 'Format JSON invalide' 
 }, { status: 400 })
 }
 
 const { token } = tokenData
 
 if (!token) {
 return NextResponse.json({ 
 valid: false, 
 error: 'Token requis' 
 }, { status: 400 })
 }
 
 // Vérifier le token
 const decoded = verifyToken(token)
 
 if (!decoded) {
 return NextResponse.json({ 
 valid: false, 
 error: 'Token invalide' 
 }, { status: 401 })
 }
 
 // Récupérer l'utilisateur pour vérifier qu'il existe toujours
 const user = await User.findById(decoded.userId).select('-password')
 
 if (!user) {
 return NextResponse.json({ 
 valid: false, 
 error: 'Utilisateur non trouvé' 
 }, { status: 401 })
 }
 
 // Vérifier que l'utilisateur est actif
 if (!user.isActive) {
 return NextResponse.json({ 
 valid: false, 
 error: 'Compte inactif' 
 }, { status: 401 })
 }
 
 console.log(` Token vérifié pour l'utilisateur ${user.email} (${user.role})`)
 
 return NextResponse.json({
 valid: true,
 user: {
 _id: user._id,
 name: user.name,
 email: user.email,
 role: user.role,
 phone: user.phone,
 isVerified: user.isVerified,
 isActive: user.isActive,
 // Champs spécifiques au livreur
 vehicleType: user.vehicleType,
 licensePlate: user.licensePlate,
 deliveryZone: user.deliveryZone,
 isAvailable: user.isAvailable,
 rating: user.rating,
 totalDeliveries: user.totalDeliveries,
 location: user.location
 }
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la vérification du token:', error)
 return NextResponse.json({ 
 valid: false, 
 error: 'Erreur lors de la vérification',
 details: error.message 
 }, { status: 500 })
 }
}
