import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(_request: NextRequest) {
 try {
 await connectDB()
 console.log(' Connexion à MongoDB réussie')

 // Vérifier si un admin existe déjà
 const existingAdmin = await User.findOne({ role: 'admin' })
 if (existingAdmin) {
 return NextResponse.json({
 success: false,
 message: 'Un administrateur existe déjà',
 admin: {
 email: existingAdmin.email,
 role: existingAdmin.role
 }
 })
 }

 // Créer le compte admin (mot de passe non haché, le middleware s'en charge)
 const adminUser = new User({
 name: {
 first: 'Admin',
 last: 'H-Market'
 },
 email: 'admin@h-market.com',
 phone: '0123456789',
 password: 'admin123', // Le middleware va le hasher automatiquement
 role: 'admin',
 isVerified: true,
 isActive: true
 })

 await adminUser.save()
 console.log(' Compte admin créé avec succès')

 return NextResponse.json({
 success: true,
 message: 'Compte administrateur créé avec succès',
 admin: {
 email: adminUser.email,
 role: adminUser.role,
 isVerified: adminUser.isVerified
 }
 })

 } catch (error) {
 console.error(' Erreur lors de la création de l\'admin:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la création de l\'administrateur' },
 { status: 500 }
 )
 }
}
