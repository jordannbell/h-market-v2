import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'

export async function GET(_request: NextRequest) {
 try {
 await connectDB()

 // Récupérer tous les produits (approuvés et non approuvés)
 const products = await Product.find({})
 .sort({ createdAt: -1 })
 .select('-__v')

 return NextResponse.json({
 products,
 count: products.length
 })

 } catch (error) {
 console.error('Erreur lors de la récupération des produits:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}
