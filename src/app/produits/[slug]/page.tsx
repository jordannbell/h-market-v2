'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useCart } from '@/hooks/useCart'
import { FiAlertCircle, FiCheck, FiHeart, FiShare2, FiShoppingCart } from 'react-icons/fi'


interface Product {
 _id: string
 title: string
 description: string
 price: number
 images: string[]
 category: string
 originCountry: string
 stock: number
 unit: string
 weight?: number
 ingredients?: string[]
 allergens?: string[]
 nutritionalInfo?: {
 calories?: number
 protein?: number
 carbs?: number
 fat?: number
 fiber?: number
 }
 isFeatured: boolean
 slug: string
}

export default function ProductDetailPage() {
 const params = useParams()
 const [product, setProduct] = useState<Product | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [quantity, setQuantity] = useState(1)
 const [selectedImage, setSelectedImage] = useState(0)
 const { addToCart, isInCart } = useCart()

 useEffect(() => {
 if (params.slug) {
 fetchProduct(params.slug as string)
 }
 }, [params.slug])

 const fetchProduct = async (slug: string) => {
 try {
 const response = await fetch(`/api/products/by-slug/${slug}`)
 if (response.ok) {
 const data = await response.json()
 setProduct(data.product)
 } else {
 setError('Produit non trouvé')
 }
 } catch (error) {
 setError('Erreur lors du chargement du produit')
 } finally {
 setLoading(false)
 }
 }

 const handleAddToCart = () => {
 if (!product) return
 addToCart(product, quantity)
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-green-50 p-8">
 <div className="max-w-7xl mx-auto">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
 <p className="mt-4 text-gray-600">Chargement du produit...</p>
 </div>
 </div>
 </div>
 )
 }

 if (error || !product) {
 return (
 <div className="min-h-screen bg-green-50 p-8">
 <div className="max-w-7xl mx-auto">
 <div className="text-center">
 <div className="mb-4">
 <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 mb-2">Produit non trouvé</h3>
 <p className="text-gray-600 mb-6">{error}</p>
 <Link
 href="/produits"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
 >
 Retour aux produits
 </Link>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-green-50">
 {/* Navigation */}
 <Navigation showSearch={false} />
 
 {/* Breadcrumb */}
 <div className="bg-white border-b border-gray-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
 <nav className="flex" aria-label="Breadcrumb">
 <ol className="flex items-center space-x-4">
 <li>
 <Link href="/" className="text-gray-500 hover:text-green-600">
 Accueil
 </Link>
 </li>
 <li>
 <div className="flex items-center">
 <span className="text-gray-400 mx-2">/</span>
 <Link href="/produits" className="text-gray-500 hover:text-green-600">
 Produits
 </Link>
 </div>
 </li>
 <li>
 <div className="flex items-center">
 <span className="text-gray-400 mx-2">/</span>
 <span className="text-gray-900">{product.title}</span>
 </div>
 </li>
 </ol>
 </nav>
 </div>
 </div>

 {/* Product Detail */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
 
 {/* Product Images */}
 <div className="space-y-4">
 {/* Main Image */}
 <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
 <img
 src={product.images[selectedImage] || '/placeholder-product.jpg'}
 alt={product.title}
 className="w-full h-full object-cover"
 />
 </div>
 
 {/* Thumbnail Images */}
 {product.images.length > 1 && (
 <div className="grid grid-cols-4 gap-4">
 {product.images.map((image, index) => (
 <button
 key={index}
 onClick={() => setSelectedImage(index)}
 className={`aspect-square bg-white rounded-lg overflow-hidden shadow-sm border-2 transition-colors ${
 selectedImage === index ? 'border-green-500' : 'border-transparent'
 }`}
 >
 <img
 src={image}
 alt={`${product.title} ${index + 1}`}
 className="w-full h-full object-cover"
 />
 </button>
 ))}
 </div>
 )}
 </div>

 {/* Product Info */}
 <div className="space-y-6">
 {/* Title and Badges */}
 <div>
 <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
 <div className="flex items-center space-x-2 mb-4">
 {product.isFeatured && (
 <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
 Vedette
 </span>
 )}
 <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
 {product.originCountry}
 </span>
 </div>
 </div>

 {/* Price */}
 <div className="flex items-baseline space-x-2">
 <span className="text-4xl font-bold text-green-600">
 {product.price.toFixed(2)} €
 </span>
 <span className="text-gray-500">/ {product.unit}</span>
 </div>

 {/* Description */}
 <div>
 <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
 <p className="text-gray-600 leading-relaxed">{product.description}</p>
 </div>

 {/* Stock Status */}
 <div className="flex items-center space-x-2">
 <span className="text-sm text-gray-600">Stock:</span>
 <span className={`text-sm font-semibold ${
 product.stock > 0 ? 'text-green-600' : 'text-red-600'
 }`}>
 {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture de stock'}
 </span>
 </div>

 {/* Quantity and Add to Cart */}
 <div className="space-y-4">
 <div className="flex items-center space-x-4">
 <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
 Quantité:
 </label>
 <select
 id="quantity"
 value={quantity}
 onChange={(e) => setQuantity(Number(e.target.value))}
 className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 >
 {[...Array(Math.min(10, product.stock))].map((_, i) => (
 <option key={i + 1} value={i + 1}>
 {i + 1}
 </option>
 ))}
 </select>
 </div>

 <div className="flex space-x-4">
 {isInCart(product._id) ? (
 <div className="flex-1 bg-green-100 text-green-700 px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
 <FiCheck className="w-5 h-5" />
 <span>Dans le panier</span>
 </div>
 ) : (
 <button
 onClick={handleAddToCart}
 disabled={product.stock === 0}
 className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
 >
 <FiShoppingCart className="w-5 h-5" />
 <span>Ajouter au panier</span>
 </button>
 )}
 
 <button className="bg-green-100 hover:bg-green-200 text-green-600 p-3 rounded-lg transition-colors">
 <FiHeart className="w-5 h-5" />
 </button>
 
 <button className="bg-green-100 hover:bg-green-200 text-green-600 p-3 rounded-lg transition-colors">
 <FiShare2 className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Product Details */}
 <div className="border-t border-gray-200 pt-6 space-y-4">
 {product.weight && (
 <div className="flex justify-between">
 <span className="text-gray-600">Poids:</span>
 <span className="font-medium">{product.weight}g</span>
 </div>
 )}
 
 <div className="flex justify-between">
 <span className="text-gray-600">Catégorie:</span>
 <span className="font-medium">{product.category}</span>
 </div>

 {product.ingredients && product.ingredients.length > 0 && (
 <div>
 <span className="text-gray-600">Ingrédients:</span>
 <p className="text-sm mt-1">{product.ingredients.join(', ')}</p>
 </div>
 )}

 {product.allergens && product.allergens.length > 0 && (
 <div>
 <span className="text-gray-600">Allergènes:</span>
 <p className="text-sm mt-1">{product.allergens.join(', ')}</p>
 </div>
 )}
 </div>

 {/* Nutritional Info */}
 {product.nutritionalInfo && (
 <div className="border-t border-gray-200 pt-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations nutritionnelles</h3>
 <div className="grid grid-cols-2 gap-4 text-sm">
 {product.nutritionalInfo.calories && (
 <div className="flex justify-between">
 <span className="text-gray-600">Calories:</span>
 <span className="font-medium">{product.nutritionalInfo.calories} kcal</span>
 </div>
 )}
 {product.nutritionalInfo.protein && (
 <div className="flex justify-between">
 <span className="text-gray-600">Protéines:</span>
 <span className="font-medium">{product.nutritionalInfo.protein}g</span>
 </div>
 )}
 {product.nutritionalInfo.carbs && (
 <div className="flex justify-between">
 <span className="text-gray-600">Glucides:</span>
 <span className="font-medium">{product.nutritionalInfo.carbs}g</span>
 </div>
 )}
 {product.nutritionalInfo.fat && (
 <div className="flex justify-between">
 <span className="text-gray-600">Lipides:</span>
 <span className="font-medium">{product.nutritionalInfo.fat}g</span>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
}
