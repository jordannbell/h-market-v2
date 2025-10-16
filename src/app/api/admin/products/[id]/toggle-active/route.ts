import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'

export async function PATCH(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()

 const product = await Product.findById((await context.params).id)
 if (!product) {
 return NextResponse.json(
 { error: 'Produit non trouvé' },
 { status: 404 }
 )
 }

 // Toggle the active status
 product.isActive = !product.isActive
 await product.save()

 return NextResponse.json({
 message: `Produit ${product.isActive ? 'activé' : 'désactivé'} avec succès`,
 product: {
 _id: product._id,
 title: product.title,
 isActive: product.isActive
 }
 })

 } catch (error) {
 console.error('Erreur lors du changement de statut du produit:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

