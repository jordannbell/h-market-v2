import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
 try {
 console.log('=== DEBUG: Tentative de connexion ===')
 
 await connectDB()
 console.log(' Base de données connectée')

 const { email, password } = await request.json()
 console.log('Email reçu:', email)
 console.log('Données reçues:', { email: email ? 'Présent' : 'Manquant', password: password ? 'Présent' : 'Manquant' })

 // Validation des données
 if (!email || !password) {
 console.log(' Données manquantes')
 return NextResponse.json(
 { error: 'Email et mot de passe requis' },
 { status: 400 }
 )
 }

 // Trouver l'utilisateur
 console.log(' Recherche de l\'utilisateur...')
 const user = await User.findOne({ email })
 console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non')
 
 if (!user) {
 console.log(' Utilisateur non trouvé')
 return NextResponse.json(
 { error: 'Email ou mot de passe incorrect' },
 { status: 401 }
 )
 }

 console.log(' Utilisateur trouvé:', { email: user.email, role: user.role, isVerified: user.isVerified })

 // Vérifier le mot de passe
 console.log(' Vérification du mot de passe...')
 const isPasswordValid = await user.comparePassword(password)
 console.log('Mot de passe valide:', isPasswordValid ? 'Oui' : 'Non')
 
 if (!isPasswordValid) {
 console.log(' Mot de passe incorrect')
 return NextResponse.json(
 { error: 'Email ou mot de passe incorrect' },
 { status: 401 }
 )
 }

 // Vérifier si le compte est actif
 if (!user.isVerified) {
 return NextResponse.json(
 { error: 'Votre compte n\'est pas encore vérifié' },
 { status: 401 }
 )
 }

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

 // Retourner la réponse sans le mot de passe
 const userResponse = {
 _id: user._id,
 name: user.name,
 email: user.email,
 phone: user.phone,
 role: user.role,
 isVerified: user.isVerified,
 createdAt: user.createdAt
 }

 return NextResponse.json({
 message: 'Connexion réussie',
 user: userResponse,
 token
 })

 } catch (error) {
 console.error('Erreur lors de la connexion:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

