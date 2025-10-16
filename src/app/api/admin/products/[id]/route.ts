import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'
import jwt from 'jsonwebtoken'
import { AuthTokenPayload } from '@/types/jwt'

// GET - Récupérer un produit spécifique (admin)
export async function GET(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()

 // Vérifier l'authentification
 const authHeader = request.headers.get('authorization')
 if (!authHeader || !authHeader.startsWith('Bearer ')) {
 return NextResponse.json(
 { error: 'Token d\'authentification requis' },
 { status: 401 }
 )
 }

 const token = authHeader.replace('Bearer ', '')
 const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
 
 let decoded: AuthTokenPayload
 try {
 decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload
 } catch {
 return NextResponse.json(
 { error: 'Token invalide' },
 { status: 401 }
 )
 }

 // Vérifier que l'utilisateur est admin
 if (decoded.role !== 'admin') {
 return NextResponse.json(
 { error: 'Accès non autorisé' },
 { status: 403 }
 )
 }

 const product = await Product.findById((await context.params).id).select('-__v')

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

// PUT - Modifier un produit (admin)
export async function PUT(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()

 // Vérifier l'authentification
 const authHeader = request.headers.get('authorization')
 if (!authHeader || !authHeader.startsWith('Bearer ')) {
 return NextResponse.json(
 { error: 'Token d\'authentification requis' },
 { status: 401 }
 )
 }

 const token = authHeader.replace('Bearer ', '')
 const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
 
 let decoded: AuthTokenPayload
 try {
 decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload
 } catch {
 return NextResponse.json(
 { error: 'Token invalide' },
 { status: 401 }
 )
 }

 // Vérifier que l'utilisateur est admin
 if (decoded.role !== 'admin') {
 return NextResponse.json(
 { error: 'Accès non autorisé' },
 { status: 403 }
 )
 }

 const body = await request.json()
 const { title, description, price, images, category, originCountry, stock, unit, weight, ingredients, allergens, nutritionalInfo } = body

 // Validation des données
 if (!title || !description || !price || !images || !category || !originCountry || !stock || !unit) {
 return NextResponse.json(
 { error: 'Tous les champs obligatoires sont requis' },
 { status: 400 }
 )
 }

 if (price < 0 || stock < 0) {
 return NextResponse.json(
 { error: 'Le prix et le stock doivent être positifs' },
 { status: 400 }
 )
 }

 // Vérifier si le produit existe
 const existingProduct = await Product.findById((await context.params).id)
 if (!existingProduct) {
 return NextResponse.json(
 { error: 'Produit non trouvé' },
 { status: 404 }
 )
 }

 // Générer un nouveau slug si le titre a changé
 let slug = existingProduct.slug
 if (title !== existingProduct.title) {
 slug = title.toLowerCase()
 .replace(/[^a-z0-9\s-]/g, '')
 .replace(/\s+/g, '-')
 .replace(/-+/g, '-')
 .trim('-')

 // Vérifier si le nouveau slug existe déjà
 const slugExists = await Product.findOne({ slug, _id: { $ne: (await context.params).id } })
 if (slugExists) {
 return NextResponse.json(
 { error: 'Un produit avec ce titre existe déjà' },
 { status: 400 }
 )
 }
 }

 // Mettre à jour le produit
 const updatedProduct = await Product.findByIdAndUpdate(
 (await context.params).id,
 {
 title,
 slug,
 description,
 price,
 images,
 category,
 originCountry,
 stock,
 unit,
 weight,
 ingredients,
 allergens,
 nutritionalInfo
 },
 { new: true, runValidators: true }
 ).select('-__v')

 return NextResponse.json({
 message: 'Produit modifié avec succès',
 product: updatedProduct
 })

 } catch (error) {
 console.error('Erreur lors de la modification du produit:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

// DELETE - Supprimer un produit (admin)
export async function DELETE(
 request: NextRequest,
 context: { params: Promise<{ id: string }> }
) {
 try {
 await connectDB()

 // Vérifier l'authentification
 const authHeader = request.headers.get('authorization')
 if (!authHeader || !authHeader.startsWith('Bearer ')) {
 return NextResponse.json(
 { error: 'Token d\'authentification requis' },
 { status: 401 }
 )
 }

 const token = authHeader.replace('Bearer ', '')
 const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
 
 let decoded: AuthTokenPayload
 try {
 decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload
 } catch {
 return NextResponse.json(
 { error: 'Token invalide' },
 { status: 401 }
 )
 }

 // Vérifier que l'utilisateur est admin
 if (decoded.role !== 'admin') {
 return NextResponse.json(
 { error: 'Accès non autorisé' },
 { status: 403 }
 )
 }

 // Vérifier si le produit existe
 const product = await Product.findById((await context.params).id)
 if (!product) {
 return NextResponse.json(
 { error: 'Produit non trouvé' },
 { status: 404 }
 )
 }

 // Supprimer le produit
 await Product.findByIdAndDelete((await context.params).id)

 return NextResponse.json({
 message: 'Produit supprimé avec succès'
 })

 } catch (error) {
 console.error('Erreur lors de la suppression du produit:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}
