import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'

export async function POST(_request: NextRequest) {
 try {
 await connectDB()
 console.log(' Connexion à MongoDB réussie')

 // Produits de test
 const testProducts = [
 {
 title: 'Yassa Poulet',
 description: 'Poulet mariné aux oignons et citron, spécialité sénégalaise',
 price: 12.99,
 images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500'],
 category: 'Plats préparés',
 originCountry: 'Sénégal',
 slug: 'yassa-poulet',
 isFeatured: true,
 unit: 'portion',
 stock: 50,
 isActive: true,
 isApproved: true
 },
 {
 title: 'Attieke',
 description: 'Semoule de manioc fermentée, base de nombreux plats ivoiriens',
 price: 4.99,
 images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'],
 category: 'Féculents',
 originCountry: 'Côte d\'Ivoire',
 slug: 'attieke',
 isFeatured: true,
 unit: 'kg',
 stock: 100,
 isActive: true,
 isApproved: true
 },
 {
 title: 'Mafé',
 description: 'Ragoût de viande en sauce d\'arachide, plat traditionnel malien',
 price: 15.99,
 images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500'],
 category: 'Plats préparés',
 originCountry: 'Mali',
 slug: 'mafe',
 isFeatured: true,
 unit: 'portion',
 stock: 30,
 isActive: true,
 isApproved: true
 },
 {
 title: 'Bissap',
 description: 'Boisson à base de fleurs d\'hibiscus, rafraîchissante et naturelle',
 price: 3.99,
 images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500'],
 category: 'Boissons',
 originCountry: 'Sénégal',
 slug: 'bissap',
 isFeatured: true,
 unit: 'bouteille',
 stock: 80,
 isActive: true,
 isApproved: true
 }
 ]

 // Supprimer les produits existants
 await Product.deleteMany({})
 console.log('️ Produits existants supprimés')

 // Ajouter les nouveaux produits
 const createdProducts = await Product.insertMany(testProducts)
 console.log(` ${createdProducts.length} produits créés`)

 return NextResponse.json({
 success: true,
 message: `${createdProducts.length} produits de test créés`,
 products: createdProducts
 })

 } catch (error) {
 console.error(' Erreur lors de la création des produits de test:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la création des produits de test' },
 { status: 500 }
 )
 }
}
