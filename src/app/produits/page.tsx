'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { FiArrowRight, FiCoffee, FiDroplet, FiFilter, FiPackage, FiSearch, FiShoppingCart, FiStar, FiZap } from 'react-icons/fi'


interface Product {
 _id: string
 title: string
 price: number
 images: string[]
 category: string
 originCountry: string
 slug: string
 isFeatured: boolean
}

const categories = [
 { name: 'Fruits & Légumes', icon: <FiPackage className="w-6 h-6 text-red-500" />, color: 'bg-red-100 text-red-800' },
 { name: 'Épices & Condiments', icon: <FiZap className="w-6 h-6 text-orange-500" />, color: 'bg-orange-100 text-orange-800' },
 { name: 'Céréales & Grains', icon: <FiPackage className="w-6 h-6 text-yellow-500" />, color: 'bg-yellow-100 text-yellow-800' },
 { name: 'Boissons', icon: <FiCoffee className="w-6 h-6 text-blue-500" />, color: 'bg-blue-100 text-blue-800' },
 { name: 'Huiles & Beurres', icon: <FiDroplet className="w-6 h-6 text-green-500" />, color: 'bg-green-100 text-green-800' },
 { name: 'Produits Transformés', icon: <FiPackage className="w-6 h-6 text-purple-500" />, color: 'bg-purple-100 text-purple-800' }
]

function ProductsPageContent() {
 const searchParams = useSearchParams()
 const router = useRouter()
 const [products, setProducts] = useState<Product[]>([])
 const [loading, setLoading] = useState(true)
 const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
 const [searchQuery, setSearchQuery] = useState('')
 const [sortBy, setSortBy] = useState('newest')

 useEffect(() => {
 fetchProducts()
 }, [selectedCategory, searchQuery, sortBy])

 const fetchProducts = async () => {
 try {
 setLoading(true)
 const params = new URLSearchParams()
 if (selectedCategory) params.append('category', selectedCategory)
 if (searchQuery) params.append('search', searchQuery)
 if (sortBy) params.append('sort', sortBy === 'newest' ? 'createdAt' : 'price')
 params.append('order', sortBy === 'price-low' ? 'asc' : 'desc')

 const response = await fetch(`/api/products?${params.toString()}`)
 if (response.ok) {
 const data = await response.json()
 setProducts(data.products)
 }
 } catch (error) {
 console.error('Erreur lors du chargement des produits:', error)
 } finally {
 setLoading(false)
 }
 }

 const handleCategoryClick = (category: string) => {
 setSelectedCategory(category === selectedCategory ? '' : category)
 const params = new URLSearchParams(searchParams)
 if (category === selectedCategory) {
 params.delete('category')
 } else {
 params.set('category', category)
 }
 router.push(`/produits?${params.toString()}`)
 }

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault()
 const params = new URLSearchParams(searchParams)
 if (searchQuery) {
 params.set('search', searchQuery)
 } else {
 params.delete('search')
 }
 router.push(`/produits?${params.toString()}`)
 }

 return (
 <div className="min-h-screen bg-gray-50">
 {/* Header avec navigation */}
 <Navigation showSearch={false} />

 {/* Page Title */}
 <div className="bg-white border-b border-gray-200">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="text-center">
 <h1 className="text-3xl font-bold text-gray-900 mb-2">
 Nos Produits
 </h1>
 <p className="text-lg text-gray-600">
 Découvrez notre sélection de produits africains authentiques
 </p>
 </div>
 </div>
 </div>

 {/* Main Content */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <div className="flex flex-col lg:flex-row gap-8">
 {/* Sidebar */}
 <div className="lg:w-80 flex-shrink-0">
 <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
 <div className="flex items-center space-x-3 mb-8">
 <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
 <FiFilter className="w-5 h-5 text-white" />
 </div>
 <div>
 <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
 <p className="text-sm text-gray-500">Affinez votre recherche</p>
 </div>
 </div>

 {/* Categories */}
 <div className="mb-8">
 <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
 <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
 Catégories
 </h3>
 <div className="space-y-3">
 {categories.map((category) => (
 <button
 key={category.name}
 onClick={() => handleCategoryClick(category.name)}
 className={`w-full flex items-center space-x-4 p-4 rounded-xl text-left transition-all duration-200 ${
 selectedCategory === category.name
 ? 'bg-green-50 border-2 border-green-200 shadow-md'
 : 'hover:bg-gray-50 border-2 border-transparent'
 }`}
 >
 <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
 selectedCategory === category.name ? 'bg-green-100' : 'bg-gray-100'
 }`}>
 {category.icon}
 </div>
 <div className="flex-1">
 <span className={`font-medium text-sm ${
 selectedCategory === category.name ? 'text-green-800' : 'text-gray-700'
 }`}>
 {category.name}
 </span>
 {selectedCategory === category.name && (
 <div className="flex items-center mt-1">
 <FiArrowRight className="w-4 h-4 text-green-600" />
 <span className="text-xs text-green-600 ml-1">Sélectionné</span>
 </div>
 )}
 </div>
 </button>
 ))}
 </div>
 </div>

 {/* Sort */}
 <div>
 <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
 <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
 Trier par
 </h3>
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
 >
 <option value="newest">Plus récents</option>
 <option value="price-low">Prix croissant</option>
 <option value="price-high">Prix décroissant</option>
 </select>
 </div>

 {/* Clear Filters */}
 {(selectedCategory || searchQuery) && (
 <div className="mt-6 pt-6 border-t border-gray-200">
 <button
 onClick={() => {
 setSelectedCategory('')
 setSearchQuery('')
 router.push('/produits')
 }}
 className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
 >
 Réinitialiser les filtres
 </button>
 </div>
 )}
 </div>
 </div>

 {/* Products Grid */}
 <div className="flex-1">
 {/* Results Header */}
 <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold text-gray-900">
 {selectedCategory ? `Catégorie: ${selectedCategory}` : 'Tous les produits'}
 </h2>
 <p className="text-gray-600 mt-1">
 {products.length} produit{products.length !== 1 ? 's' : ''} trouvé{products.length !== 1 ? 's' : ''}
 </p>
 </div>
 <div className="flex items-center space-x-2">
 <span className="text-sm text-gray-500">Tri:</span>
 <span className="text-sm font-medium text-gray-900">
 {sortBy === 'newest' ? 'Plus récents' : 
 sortBy === 'price-low' ? 'Prix croissant' : 'Prix décroissant'}
 </span>
 </div>
 </div>
 </div>

 {/* Products */}
 {loading ? (
 <div className="text-center py-16">
 <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
 <p className="mt-6 text-gray-600 text-lg">Chargement des produits...</p>
 </div>
 ) : products.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {products.map((product) => (
 <Link
 key={product._id}
 href={`/produits/${product.slug}`}
 className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
 >
 <div className="aspect-square bg-gray-100 overflow-hidden relative">
 <img
 src={product.images[0] || '/placeholder-product.jpg'}
 alt={product.title}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
 />
 {product.isFeatured && (
 <div className="absolute top-3 left-3">
 <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg flex items-center space-x-1">
 <FiStar className="w-3 h-3 fill-current" />
 <span>Vedette</span>
 </span>
 </div>
 )}
 <div className="absolute top-3 right-3">
 <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
 {product.originCountry}
 </span>
 </div>
 </div>
 <div className="p-6">
 <div className="flex items-center justify-between mb-3">
 <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
 {product.category}
 </span>
 <div className="flex items-center text-yellow-400">
 <FiStar className="w-4 h-4 fill-current" />
 <span className="text-xs text-gray-600 ml-1 font-medium">4.5</span>
 </div>
 </div>
 <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-green-600 transition-colors">
 {product.title}
 </h3>
 <div className="flex items-center justify-between">
 <span className="text-2xl font-bold text-green-600">
 {product.price.toFixed(2)} €
 </span>
 <div className="bg-green-50 group-hover:bg-green-100 p-2 rounded-lg transition-colors">
 <FiShoppingCart className="w-5 h-5 text-green-600" />
 </div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 ) : (
 <div className="text-center py-16 bg-white rounded-xl shadow-lg">
 <div className="mb-6">
 <FiSearch className="w-20 h-20 text-gray-400 mx-auto" />
 </div>
 <h3 className="text-2xl font-bold text-gray-900 mb-4">
 Aucun produit trouvé
 </h3>
 <p className="text-gray-600 mb-8 text-lg">
 Essayez de modifier vos filtres ou votre recherche
 </p>
 <button
 onClick={() => {
 setSelectedCategory('')
 setSearchQuery('')
 router.push('/produits')
 }}
 className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors text-lg"
 >
 Réinitialiser les filtres
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
}

export default function ProductsPage() {
 return (
 <Suspense fallback={<div>Chargement...</div>}>
 <ProductsPageContent />
 </Suspense>
 )
}
