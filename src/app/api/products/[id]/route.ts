import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'

export async function GET(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()

 const { id } = await context.params
 const product = await Product.findById(id).select('-__v')

 if (!product) {
 return NextResponse.json(
 { error: 'Produit non trouvé' },
 { status: 404 }
 )
 }

 return NextResponse.json(product)

 } catch (error) {
 console.error('Erreur lors de la récupération du produit:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

