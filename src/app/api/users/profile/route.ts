import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function PUT(request: NextRequest) {
 try {
 await connectDB()
 
 const { name, phone, address } = await request.json()
 
 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }
 
 const decoded = await verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }
 
 // Trouver l'utilisateur
 const user = await User.findById(decoded.userId)
 if (!user) {
 return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
 }
 
 // Mettre à jour les informations
 if (name) {
 user.name = name
 }
 
 if (phone) {
 user.phone = phone
 }
 
 if (address) {
 user.address = address
 }
 
 // Sauvegarder les modifications
 await user.save()
 
 console.log(` Profil utilisateur ${user.email} mis à jour`)
 
 return NextResponse.json({
 success: true,
 message: 'Profil mis à jour avec succès',
 user: {
 _id: user._id,
 name: user.name,
 email: user.email,
 phone: user.phone,
 role: user.role,
 address: user.address,
 isVerified: user.isVerified,
 createdAt: user.createdAt
 }
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la mise à jour du profil:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la mise à jour du profil',
 details: error.message 
 }, { status: 500 })
 }
}
