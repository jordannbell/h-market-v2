import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
 try {
 await connectDB()
 
 // Vérifier le token d'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
 }

 const decoded = verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }

 // Mettre à jour la dernière connexion de l'utilisateur
 await User.findByIdAndUpdate(decoded.userId, {
 lastLoginAt: new Date(),
 isActive: true
 })

 console.log(` Dernière connexion mise à jour pour l'utilisateur: ${(decoded as any).email}`)

 return NextResponse.json({
 success: true,
 message: 'Dernière connexion mise à jour'
 })

 } catch (error) {
 console.error(' Erreur lors de la mise à jour de la connexion:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la mise à jour de la connexion' },
 { status: 500 }
 )
 }
}
