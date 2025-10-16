import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'

export async function DELETE(_request: NextRequest) {
 try {
 await connectDB()
 console.log(' Connexion à MongoDB réussie')

 // Supprimer l'admin existant
 const result = await User.deleteMany({ role: 'admin' })
 console.log(`️ ${result.deletedCount} administrateur(s) supprimé(s)`)

 return NextResponse.json({
 success: true,
 message: `${result.deletedCount} administrateur(s) supprimé(s)`,
 deletedCount: result.deletedCount
 })

 } catch (error) {
 console.error(' Erreur lors de la suppression de l\'admin:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la suppression de l\'administrateur' },
 { status: 500 }
 )
 }
}
