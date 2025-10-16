import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'
import { verifyToken } from '@/lib/auth'

export async function GET(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 const { id: orderId } = await context.params

 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }

 const decoded = await verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }

 await connectDB()

 // Récupérer la commande
 const order = await Order.findById(orderId)
 .select('-__v')

 if (!order) {
 return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
 }

 // Vérifier que l'utilisateur est bien le propriétaire de la commande
 if (order.userId.toString() !== decoded.userId) {
 return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
 }

 return NextResponse.json({
 success: true,
 order
 })

 } catch (error: any) {
 console.error('Erreur lors de la récupération de la commande:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la récupération de la commande' },
 { status: 500 }
 )
 }
}
