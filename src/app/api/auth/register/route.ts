import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
 try {
 await connectDB()

 const body = await request.json()
 const { 
 role, 
 name, 
 email, 
 phone, 
 password,
 // Champs spécifiques au livreur
 vehicleType,
 licensePlate,
 deliveryZone
 } = body

 // Validation des champs obligatoires
 if (!name?.first || !name?.last || !email || !phone || !password || !role) {
 return NextResponse.json(
 { error: 'Tous les champs obligatoires doivent être remplis' },
 { status: 400 }
 )
 }

 // Validation du rôle
 if (!['client', 'livreur'].includes(role)) {
 return NextResponse.json(
 { error: 'Rôle invalide. Seuls "client" et "livreur" sont autorisés' },
 { status: 400 }
 )
 }

 // Validation spécifique pour les livreurs
 if (role === 'livreur') {
 if (!vehicleType || !deliveryZone) {
 return NextResponse.json(
 { error: 'Les livreurs doivent spécifier un type de véhicule et une zone de livraison' },
 { status: 400 }
 )
 }
 if (vehicleType !== 'velo' && !licensePlate) {
 return NextResponse.json(
 { error: 'La plaque d\'immatriculation est requise pour les véhicules motorisés' },
 { status: 400 }
 )
 }
 }

 // Vérifier si l'email existe déjà
 const existingUser = await User.findOne({ email })
 if (existingUser) {
 return NextResponse.json(
 { error: 'Un utilisateur avec cet email existe déjà' },
 { status: 409 }
 )
 }

 // Créer l'utilisateur
 const userData: any = {
 name,
 email,
 phone,
 password,
 role,
 isVerified: true, // Auto-vérification pour simplifier
 isActive: true
 }

 // Ajouter les champs spécifiques au livreur
 if (role === 'livreur') {
 userData.vehicleType = vehicleType
 userData.licensePlate = licensePlate
 userData.deliveryZone = deliveryZone
 userData.isAvailable = false // Par défaut non disponible
 userData.rating = 0
 userData.totalDeliveries = 0
 }

 const user = new User(userData)
 await user.save()

 // Générer le token JWT
 const token = jwt.sign(
 { 
 userId: user._id, 
 email: user.email, 
 role: user.role 
 },
 JWT_SECRET,
 { expiresIn: '7d' }
 )

 // Retourner les données utilisateur (sans mot de passe)
 const userResponse = {
 _id: user._id,
 name: user.name,
 email: user.email,
 phone: user.phone,
 role: user.role,
 isVerified: user.isVerified,
 isActive: user.isActive,
 // Champs spécifiques au livreur
 ...(user.role === 'livreur' && {
 vehicleType: user.vehicleType,
 licensePlate: user.licensePlate,
 deliveryZone: user.deliveryZone,
 isAvailable: user.isAvailable,
 rating: user.rating,
 totalDeliveries: user.totalDeliveries
 }),
 createdAt: user.createdAt,
 updatedAt: user.updatedAt
 }

 return NextResponse.json({
 message: 'Utilisateur créé avec succès',
 token,
 user: userResponse
 })

 } catch (error) {
 console.error('Erreur lors de l\'inscription:', error)
 
 // Gérer les erreurs de validation Mongoose
 if (error instanceof Error && error.message.includes('validation failed')) {
 return NextResponse.json(
 { error: 'Données invalides. Veuillez vérifier vos informations.' },
 { status: 400 }
 )
 }

 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}
