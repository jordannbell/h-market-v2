import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'

export async function POST(_request: NextRequest) {
 try {
 await connectDB()
 console.log(' Connexion à MongoDB réussie')

 // Créer un compte client de test
 const clientUser = new User({
 name: {
 first: 'Test',
 last: 'Client'
 },
 email: 'client@test.com',
 phone: '0123456789',
 password: 'client123',
 role: 'client',
 isVerified: true,
 isActive: true
 })

 await clientUser.save()
 console.log(' Compte client créé avec succès')

 return NextResponse.json({
 success: true,
 message: 'Compte client créé avec succès',
 client: {
 email: clientUser.email,
 role: clientUser.role,
 isVerified: clientUser.isVerified
 }
 })

 } catch (error) {
 console.error(' Erreur lors de la création du client:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la création du client' },
 { status: 500 }
 )
 }
}
