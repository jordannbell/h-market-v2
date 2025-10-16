import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'

export async function PATCH(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()

 const product = await Product.findByIdAndUpdate(
 (await context.params).id,
 { isApproved: true },
 { new: true }
 ).select('-__v')

 if (!product) {
 return NextResponse.json(
 { error: 'Produit non trouvé' },
 { status: 404 }
 )
 }

 return NextResponse.json({
 message: 'Produit approuvé avec succès',
 product
 })

 } catch (error) {
 console.error('Erreur lors de l\'approbation du produit:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

