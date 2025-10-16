import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'
import jwt from 'jsonwebtoken'
import { AuthTokenPayload } from '@/types/jwt'

// GET - Récupérer tous les produits (public)
export async function GET(request: NextRequest) {
 try {
 await connectDB()

 const { searchParams } = new URL(request.url)
 const page = parseInt(searchParams.get('page') || '1')
 const limit = parseInt(searchParams.get('limit') || '12')
 const category = searchParams.get('category')
 const search = searchParams.get('search')
 const sort = searchParams.get('sort') || 'createdAt'
 const order = searchParams.get('order') || 'desc'

 // Construire le filtre
 const filter: any = {
 isActive: true,
 isApproved: true
 }

 if (category) {
 filter.category = category
 }

 if (search) {
 filter.$or = [
 { title: { $regex: search, $options: 'i' } },
 { description: { $regex: search, $options: 'i' } },
 { originCountry: { $regex: search, $options: 'i' } }
 ]
 }

 // Calculer le skip pour la pagination
 const skip = (page - 1) * limit

 // Récupérer les produits
 const products = await Product.find(filter)
 .sort({ [sort]: order === 'desc' ? -1 : 1 })
 .skip(skip)
 .limit(limit)
 .select('-__v')

 // Compter le total
 const total = await Product.countDocuments(filter)

 return NextResponse.json({
 products,
 pagination: {
 page,
 limit,
 total,
 pages: Math.ceil(total / limit)
 }
 })

 } catch (error) {
 console.error('Erreur lors de la récupération des produits:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

// POST - Créer un nouveau produit (admin/vendeur seulement)
export async function POST(request: NextRequest) {
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
 
 // Vérifier le token JWT
 const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
 
 let decoded
 try {
 decoded = jwt.verify(token, JWT_SECRET)
 } catch {
 return NextResponse.json(
 { error: 'Token invalide' },
 { status: 401 }
 )
 }

 // Vérifier que l'utilisateur est admin ou vendeur
 if (!['admin', 'vendeur'].includes(decoded.role)) {
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

 // Générer un slug unique
 const slug = title.toLowerCase()
 .replace(/[^a-z0-9\s-]/g, '')
 .replace(/\s+/g, '-')
 .replace(/-+/g, '-')
 .trim('-')

 // Vérifier si le slug existe déjà
 const existingProduct = await Product.findOne({ slug })
 if (existingProduct) {
 return NextResponse.json(
 { error: 'Un produit avec ce titre existe déjà' },
 { status: 400 }
 )
 }

 // Créer le produit
 const product = new Product({
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
 nutritionalInfo,
 isApproved: decoded.role === 'admin' // Auto-approuvé si admin
 })

 await product.save()

 return NextResponse.json({
 message: 'Produit créé avec succès',
 product
 }, { status: 201 })

 } catch (error) {
 console.error('Erreur lors de la création du produit:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}
