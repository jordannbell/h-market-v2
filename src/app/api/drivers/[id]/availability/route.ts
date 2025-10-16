import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'

export async function PATCH(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()

 const { isAvailable } = await request.json()

 // Vérifier que le paramètre est fourni
 if (typeof isAvailable !== 'boolean') {
 return NextResponse.json(
 { error: 'Le paramètre isAvailable est requis et doit être un booléen' },
 { status: 400 }
 )
 }

 // Mettre à jour le statut de disponibilité
 const driver = await User.findByIdAndUpdate(
 (await context.params).id,
 { isAvailable },
 { new: true }
 ).select('-password -__v')

 if (!driver) {
 return NextResponse.json(
 { error: 'Livreur non trouvé' },
 { status: 404 }
 )
 }

 if (driver.role !== 'livreur') {
 return NextResponse.json(
 { error: 'Cet utilisateur n\'est pas un livreur' },
 { status: 400 }
 )
 }

 return NextResponse.json({
 message: `Livreur ${isAvailable ? 'disponible' : 'indisponible'}`,
 driver
 })

 } catch (error) {
 console.error('Erreur lors de la mise à jour du statut:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

