'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiEdit, FiEye, FiPackage, FiPlus, FiTrash2 } from 'react-icons/fi'


interface Product {
 _id: string
 title: string
 price: number
 category: string
 stock: number
 unit: string
 images: string[]
 isApproved: boolean
 isActive: boolean
}

export default function AdminDashboard() {
 const [products, setProducts] = useState<Product[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const router = useRouter()

 useEffect(() => {
 fetchProducts()
 }, [])

 const fetchProducts = async () => {
 try {
 const token = localStorage.getItem('token')
 const response = await fetch('/api/admin/products', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 setProducts(data.products)
 } else {
 setError('Erreur lors du chargement des produits')
 }
 } catch (error) {
 setError('Erreur de connexion')
 } finally {
 setLoading(false)
 }
 }

 const handleDelete = async (productId: string) => {
 if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
 return
 }

 try {
 const token = localStorage.getItem('token')
 const response = await fetch(`/api/admin/products/${productId}`, {
 method: 'DELETE',
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 setProducts(products.filter(p => p._id !== productId))
 } else {
 setError('Erreur lors de la suppression')
 }
 } catch (error) {
 setError('Erreur de connexion')
 }
 }

 const handleToggleActive = async (productId: string) => {
 try {
 const token = localStorage.getItem('token')
 const response = await fetch(`/api/admin/products/${productId}/toggle-active`, {
 method: 'PATCH',
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 setProducts(products.map(p => 
 p._id === productId ? { ...p, isActive: !p.isActive } : p
 ))
 } else {
 setError('Erreur lors de la mise à jour')
 }
 } catch (error) {
 setError('Erreur de connexion')
 }
 }

 const handleApprove = async (productId: string) => {
 try {
 const token = localStorage.getItem('token')
 const response = await fetch(`/api/admin/products/${productId}/approve`, {
 method: 'PATCH',
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 setProducts(products.map(p => 
 p._id === productId ? { ...p, isApproved: true } : p
 ))
 } else {
 setError('Erreur lors de l\'approbation')
 }
 } catch (error) {
 setError('Erreur de connexion')
 }
 }

 if (loading) {
 return (
 <div className="p-6">
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 </div>
 )
 }

 return (
 <div className="p-6">
 {/* Header */}
 <div className="flex items-center justify-between mb-6">
 <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
 <Link
 href="/admin/products/new"
 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
 >
 <FiPlus className="w-4 h-4" />
 <span>Ajouter un Produit</span>
 </Link>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
 {error}
 </div>
 )}

 {/* Products Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {products.map((product) => (
 <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
 {/* Product Image */}
 <div className="h-48 bg-gray-200 flex items-center justify-center">
 {product.images && product.images.length > 0 ? (
 <img
 src={product.images[0]}
 alt={product.title}
 className="w-full h-full object-cover"
 />
 ) : (
 <div className="text-gray-400 text-center">
 <FiPackage className="w-12 h-12 text-green-600 mb-2" />
 <p className="text-sm">Aucune image</p>
 </div>
 )}
 </div>

 {/* Product Info */}
 <div className="p-4">
 <h3 className="font-semibold text-gray-900 mb-2 truncate">
 {product.title}
 </h3>
 <p className="text-blue-600 font-medium mb-2">
 {product.price.toFixed(2)} €
 </p>
 <p className="text-gray-600 text-sm mb-2">
 {product.category}
 </p>
 <p className="text-gray-600 text-sm mb-4">
 Stock: {product.stock} {product.unit}
 </p>

 {/* Status Badges */}
 <div className="flex flex-wrap gap-2 mb-4">
 {!product.isApproved && (
 <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
 En attente
 </span>
 )}
 {!product.isActive && (
 <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
 Inactif
 </span>
 )}
 </div>

 {/* Action Buttons */}
 <div className="flex space-x-2">
 <Link
 href={`/admin/products/${product._id}`}
 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium flex items-center justify-center transition-colors"
 >
 <FiEye className="w-4 h-4 mr-1" />
 Voir
 </Link>
 <Link
 href={`/admin/products/${product._id}/edit`}
 className="flex-1 border border-green-500 text-green-600 hover:bg-green-50 px-3 py-2 rounded text-sm font-medium flex items-center justify-center transition-colors"
 >
 <FiEdit className="w-4 h-4 mr-1" />
 Modifier
 </Link>
 <button
 onClick={() => handleDelete(product._id)}
 className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded text-sm font-medium flex items-center justify-center transition-colors"
 >
 <FiTrash2 className="w-4 h-4 mr-1" />
 Supprimer
 </button>
 </div>

 {/* Additional Actions */}
 {!product.isApproved && (
 <button
 onClick={() => handleApprove(product._id)}
 className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
 >
 Approuver
 </button>
 )}
 <button
 onClick={() => handleToggleActive(product._id)}
 className={`w-full mt-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
 product.isActive
 ? 'bg-red-600 hover:bg-red-700 text-white'
 : 'bg-green-600 hover:bg-green-700 text-white'
 }`}
 >
 {product.isActive ? 'Désactiver' : 'Activer'}
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Empty State */}
 {products.length === 0 && !loading && (
 <div className="text-center py-12">
 <FiPackage className="w-16 h-16 text-gray-400 mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">
 Aucun produit trouvé
 </h3>
 <p className="text-gray-600 mb-6">
 Commencez par ajouter votre premier produit
 </p>
 <Link
 href="/admin/products/new"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center space-x-2 transition-colors"
 >
 <FiPlus className="w-4 h-4" />
 <span>Ajouter un Produit</span>
 </Link>
 </div>
 )}
 </div>
 )
}
