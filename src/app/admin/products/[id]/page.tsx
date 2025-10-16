'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiEdit, FiTrash2 } from 'react-icons/fi'


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
 ingredients: string[]
 allergens: string[]
 nutritionalInfo?: {
 calories?: number
 protein?: number
 carbs?: number
 fat?: number
 fiber?: number
 }
 isApproved: boolean
 isActive: boolean
 createdAt: string
 updatedAt: string
}

export default function ProductDetailPage() {
 const router = useRouter()
 const params = useParams()
 const [product, setProduct] = useState<Product | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 useEffect(() => {
 const fetchProduct = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) {
 router.push('/admin/login')
 return
 }

 const response = await fetch(`/api/admin/products/${params.id}`, {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 setProduct(data)
 } else {
 setError('Produit non trouvé')
 }
 } catch (error) {
 setError('Erreur lors du chargement du produit')
 } finally {
 setLoading(false)
 }
 }

 if (params.id) {
 fetchProduct()
 }
 }, [params.id, router])

 const handleDelete = async () => {
 if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
 return
 }

 try {
 const token = localStorage.getItem('token')
 if (!token) {
 router.push('/admin/login')
 return
 }

 const response = await fetch(`/api/admin/products/${params.id}`, {
 method: 'DELETE',
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 router.push('/admin')
 } else {
 setError('Erreur lors de la suppression')
 }
 } catch (error) {
 setError('Erreur lors de la suppression')
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 )
 }

 if (error || !product) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
 <p className="text-gray-600 mb-4">{error || 'Produit non trouvé'}</p>
 <Link
 href="/admin"
 className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
 >
 Retour à l'admin
 </Link>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-green-50">
 {/* Header */}
 <header className="bg-white shadow-lg">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-20">
 <div className="flex items-center space-x-4">
 <Link
 href="/admin"
 className="text-gray-600 hover:text-green-600 transition-colors"
 >
 <FiArrowLeft className="w-6 h-6" />
 </Link>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
 <p className="text-gray-600">Détails du produit</p>
 </div>
 </div>
 <div className="flex items-center space-x-3">
 <Link
 href={`/admin/products/${product._id}/edit`}
 className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2"
 >
 <FiEdit className="w-4 h-4" />
 <span>Modifier</span>
 </Link>
 <button
 onClick={handleDelete}
 className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2"
 >
 <FiTrash2 className="w-4 h-4" />
 <span>Supprimer</span>
 </button>
 </div>
 </div>
 </div>
 </header>

 {/* Content */}
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Image */}
 <div>
 <img
 src={product.images[0] || '/placeholder-product.jpg'}
 alt={product.title}
 className="w-full h-96 object-cover rounded-lg shadow-lg"
 />
 </div>

 {/* Product Info */}
 <div className="space-y-6">
 {/* Basic Info */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de base</h2>
 
 <div className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
 <p className="text-lg text-gray-900">{product.title}</p>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700">Description</label>
 <p className="text-gray-900">{product.description}</p>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700">Prix</label>
 <p className="text-lg font-semibold text-green-600">{product.price}€</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700">Stock</label>
 <p className="text-lg text-gray-900">{product.stock} {product.unit}</p>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700">Catégorie</label>
 <p className="text-gray-900">{product.category}</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700">Pays d'origine</label>
 <p className="text-gray-900">{product.originCountry}</p>
 </div>
 </div>

 {product.weight && (
 <div>
 <label className="block text-sm font-medium text-gray-700">Poids</label>
 <p className="text-gray-900">{product.weight}g</p>
 </div>
 )}
 </div>
 </div>

 {/* Status */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">Statut</h2>
 
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-gray-700">Approuvé</span>
 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
 product.isApproved 
 ? 'bg-green-100 text-green-800' 
 : 'bg-yellow-100 text-yellow-800'
 }`}>
 {product.isApproved ? 'Oui' : 'En attente'}
 </span>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-gray-700">Actif</span>
 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
 product.isActive 
 ? 'bg-green-100 text-green-800' 
 : 'bg-red-100 text-red-800'
 }`}>
 {product.isActive ? 'Oui' : 'Non'}
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Additional Info */}
 <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Ingredients */}
 {product.ingredients.length > 0 && (
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingrédients</h2>
 <ul className="space-y-2">
 {product.ingredients.map((ingredient, index) => (
 <li key={index} className="text-gray-900">• {ingredient}</li>
 ))}
 </ul>
 </div>
 )}

 {/* Allergens */}
 {product.allergens.length > 0 && (
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">Allergènes</h2>
 <ul className="space-y-2">
 {product.allergens.map((allergen, index) => (
 <li key={index} className="text-gray-900">• {allergen}</li>
 ))}
 </ul>
 </div>
 )}
 </div>

 {/* Nutritional Info */}
 {product.nutritionalInfo && (
 <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations nutritionnelles (pour 100g)</h2>
 
 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
 {product.nutritionalInfo.calories && (
 <div className="text-center">
 <p className="text-2xl font-bold text-green-600">{product.nutritionalInfo.calories}</p>
 <p className="text-sm text-gray-600">Calories</p>
 </div>
 )}
 
 {product.nutritionalInfo.protein && (
 <div className="text-center">
 <p className="text-2xl font-bold text-green-600">{product.nutritionalInfo.protein}g</p>
 <p className="text-sm text-gray-600">Protéines</p>
 </div>
 )}
 
 {product.nutritionalInfo.carbs && (
 <div className="text-center">
 <p className="text-2xl font-bold text-green-600">{product.nutritionalInfo.carbs}g</p>
 <p className="text-sm text-gray-600">Glucides</p>
 </div>
 )}
 
 {product.nutritionalInfo.fat && (
 <div className="text-center">
 <p className="text-2xl font-bold text-green-600">{product.nutritionalInfo.fat}g</p>
 <p className="text-sm text-gray-600">Lipides</p>
 </div>
 )}
 
 {product.nutritionalInfo.fiber && (
 <div className="text-center">
 <p className="text-2xl font-bold text-green-600">{product.nutritionalInfo.fiber}g</p>
 <p className="text-sm text-gray-600">Fibres</p>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </div>
 )
}

