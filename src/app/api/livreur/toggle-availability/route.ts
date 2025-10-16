import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'
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
 
 const { isAvailable } = await request.json()
 
 // Mettre à jour la disponibilité
 const updatedUser = await User.findByIdAndUpdate(
 decoded.userId,
 { $set: { isAvailable } },
 { new: true }
 )
 
 if (!updatedUser) {
 return NextResponse.json({ error: 'Livreur non trouvé' }, { status: 404 })
 }
 
 console.log(` Disponibilité du livreur ${decoded.userId} mise à jour:`, {
 isAvailable: updatedUser.isAvailable,
 timestamp: new Date().toISOString()
 })
 
 return NextResponse.json({
 success: true,
 isAvailable: updatedUser.isAvailable,
 message: `Disponibilité mise à jour: ${updatedUser.isAvailable ? 'Disponible' : 'Non disponible'}`
 })
 
 } catch (error: any) {
 console.error(' Erreur lors de la mise à jour de la disponibilité:', error)
 return NextResponse.json({ 
 error: 'Erreur lors de la mise à jour de la disponibilité',
 details: error.message 
 }, { status: 500 })
 }
}
