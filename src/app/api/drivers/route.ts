import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'

export async function GET(request: NextRequest) {
 try {
 await connectDB()

 const { searchParams } = new URL(request.url)
 const deliveryZone = searchParams.get('zone')
 const available = searchParams.get('available')

 // Construire la requête
 const query: any = { 
 role: 'livreur',
 isActive: true
 }

 // Filtrer par zone de livraison si spécifiée
 if (deliveryZone) {
 query.deliveryZone = deliveryZone
 }

 // Filtrer par disponibilité si spécifiée
 if (available === 'true') {
 query.isAvailable = true
 }

 // Récupérer les livreurs
 const drivers = await User.find(query)
 .select('-password -__v')
 .sort({ rating: -1, totalDeliveries: -1 })

 return NextResponse.json({
 drivers,
 count: drivers.length
 })

 } catch (error) {
 console.error('Erreur lors de la récupération des livreurs:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

