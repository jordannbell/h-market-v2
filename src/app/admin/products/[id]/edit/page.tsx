'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi'


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
}

export default function EditProductPage() {
 const router = useRouter()
 const params = useParams()
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [error, setError] = useState('')
 const [formData, setFormData] = useState({
 title: '',
 description: '',
 price: '',
 category: '',
 originCountry: '',
 stock: '',
 unit: 'kg',
 weight: '',
 imageUrl: '',
 ingredients: [''],
 allergens: [''],
 nutritionalInfo: {
 calories: '',
 protein: '',
 carbs: '',
 fat: '',
 fiber: ''
 }
 })

 const categories = [
 'Fruits & Légumes',
 'Épices & Condiments',
 'Céréales & Grains',
 'Boissons',
 'Huiles & Beurres',
 'Produits Transformés'
 ]

 const units = ['kg', 'g', 'l', 'ml', 'unité', 'paquet']

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
 const product: Product = await response.json()
 setFormData({
 title: product.title,
 description: product.description,
 price: product.price.toString(),
 category: product.category,
 originCountry: product.originCountry,
 stock: product.stock.toString(),
 unit: product.unit,
 weight: product.weight?.toString() || '',
 imageUrl: product.images[0] || '',
 ingredients: product.ingredients.length > 0 ? product.ingredients : [''],
 allergens: product.allergens.length > 0 ? product.allergens : [''],
 nutritionalInfo: {
 calories: product.nutritionalInfo?.calories?.toString() || '',
 protein: product.nutritionalInfo?.protein?.toString() || '',
 carbs: product.nutritionalInfo?.carbs?.toString() || '',
 fat: product.nutritionalInfo?.fat?.toString() || '',
 fiber: product.nutritionalInfo?.fiber?.toString() || ''
 }
 })
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

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setSaving(true)
 setError('')

 try {
 const token = localStorage.getItem('token')
 if (!token) {
 setError('Vous devez être connecté pour modifier un produit')
 return
 }

 const response = await fetch(`/api/admin/products/${params.id}`, {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 ...formData,
 price: parseFloat(formData.price),
 stock: parseInt(formData.stock),
 weight: formData.weight ? parseFloat(formData.weight) : undefined,
 nutritionalInfo: {
 calories: formData.nutritionalInfo.calories ? parseFloat(formData.nutritionalInfo.calories) : undefined,
 protein: formData.nutritionalInfo.protein ? parseFloat(formData.nutritionalInfo.protein) : undefined,
 carbs: formData.nutritionalInfo.carbs ? parseFloat(formData.nutritionalInfo.carbs) : undefined,
 fat: formData.nutritionalInfo.fat ? parseFloat(formData.nutritionalInfo.fat) : undefined,
 fiber: formData.nutritionalInfo.fiber ? parseFloat(formData.nutritionalInfo.fiber) : undefined
 },
 images: formData.imageUrl ? [formData.imageUrl] : ['/placeholder-product.jpg']
 })
 })

 const data = await response.json()

 if (response.ok) {
 router.push(`/admin/products/${params.id}`)
 } else {
 setError(data.error || 'Erreur lors de la modification du produit')
 }
 } catch (error) {
 setError('Erreur de connexion au serveur')
 } finally {
 setSaving(false)
 }
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target
 
 if (name.startsWith('nutritionalInfo.')) {
 const field = name.split('.')[1]
 setFormData({
 ...formData,
 nutritionalInfo: {
 ...formData.nutritionalInfo,
 [field]: value
 }
 })
 } else {
 setFormData({
 ...formData,
 [name]: value
 })
 }
 }

 const addIngredient = () => {
 setFormData({
 ...formData,
 ingredients: [...formData.ingredients, '']
 })
 }

 const removeIngredient = (index: number) => {
 setFormData({
 ...formData,
 ingredients: formData.ingredients.filter((_, i) => i !== index)
 })
 }

 const updateIngredient = (index: number, value: string) => {
 const newIngredients = [...formData.ingredients]
 newIngredients[index] = value
 setFormData({
 ...formData,
 ingredients: newIngredients
 })
 }

 const addAllergen = () => {
 setFormData({
 ...formData,
 allergens: [...formData.allergens, '']
 })
 }

 const removeAllergen = (index: number) => {
 setFormData({
 ...formData,
 allergens: formData.allergens.filter((_, i) => i !== index)
 })
 }

 const updateAllergen = (index: number, value: string) => {
 const newAllergens = [...formData.allergens]
 newAllergens[index] = value
 setFormData({
 ...formData,
 allergens: newAllergens
 })
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 )
 }

 if (error && !formData.title) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
 <p className="text-gray-600 mb-4">{error}</p>
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
 href={`/admin/products/${params.id}`}
 className="text-gray-600 hover:text-green-600 transition-colors"
 >
 <FiArrowLeft className="w-6 h-6" />
 </Link>
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
 <p className="text-gray-600">Éditer les informations du produit</p>
 </div>
 </div>
 </div>
 </div>
 </header>

 {/* Form */}
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 <form onSubmit={handleSubmit} className="space-y-8">
 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
 {error}
 </div>
 )}

 {/* Basic Information */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations de base</h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
 Nom du produit *
 </label>
 <input
 type="text"
 id="title"
 name="title"
 required
 value={formData.title}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="Ex: Mangues fraîches du Sénégal"
 />
 </div>

 <div>
 <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
 Catégorie *
 </label>
 <select
 id="category"
 name="category"
 required
 value={formData.category}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 >
 <option value="">Sélectionner une catégorie</option>
 {categories.map((category) => (
 <option key={category} value={category}>
 {category}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
 Prix (€) *
 </label>
 <input
 type="number"
 id="price"
 name="price"
 required
 min="0"
 step="0.01"
 value={formData.price}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0.00"
 />
 </div>

 <div>
 <label htmlFor="originCountry" className="block text-sm font-medium text-gray-700 mb-2">
 Pays d'origine *
 </label>
 <input
 type="text"
 id="originCountry"
 name="originCountry"
 required
 value={formData.originCountry}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="Ex: Sénégal"
 />
 </div>

 <div>
 <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
 Stock *
 </label>
 <input
 type="number"
 id="stock"
 name="stock"
 required
 min="0"
 value={formData.stock}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0"
 />
 </div>

 <div>
 <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
 Unité *
 </label>
 <select
 id="unit"
 name="unit"
 required
 value={formData.unit}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 >
 {units.map((unit) => (
 <option key={unit} value={unit}>
 {unit}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
 Poids (g)
 </label>
 <input
 type="number"
 id="weight"
 name="weight"
 min="0"
 value={formData.weight}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0"
 />
 </div>

 <div className="md:col-span-2">
 <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
 URL de l'image
 </label>
 <input
 type="url"
 id="imageUrl"
 name="imageUrl"
 value={formData.imageUrl}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="https://example.com/image.jpg"
 />
 <p className="text-xs text-gray-500 mt-1">
 Laissez vide pour utiliser l'image par défaut
 </p>
 {formData.imageUrl && (
 <div className="mt-3">
 <p className="text-sm font-medium text-gray-700 mb-2">Aperçu :</p>
 <img
 src={formData.imageUrl}
 alt="Aperçu"
 className="w-32 h-32 object-cover rounded-lg border border-gray-300"
 onError={(e) => {
 e.currentTarget.style.display = 'none'
 }}
 />
 </div>
 )}
 </div>
 </div>

 <div className="mt-6">
 <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
 Description *
 </label>
 <textarea
 id="description"
 name="description"
 required
 rows={4}
 value={formData.description}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="Décrivez votre produit..."
 />
 </div>
 </div>

 {/* Ingredients */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-lg font-semibold text-gray-900 mb-6">Ingrédients</h2>
 
 {formData.ingredients.map((ingredient, index) => (
 <div key={index} className="flex items-center space-x-2 mb-2">
 <input
 type="text"
 value={ingredient}
 onChange={(e) => updateIngredient(index, e.target.value)}
 className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="Ingrédient"
 />
 <button
 type="button"
 onClick={() => removeIngredient(index)}
 className="text-red-600 hover:text-red-800"
 >
 <FiX className="w-5 h-5" />
 </button>
 </div>
 ))}
 
 <button
 type="button"
 onClick={addIngredient}
 className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-2"
 >
 <FiPlus className="w-4 h-4" />
 <span>Ajouter un ingrédient</span>
 </button>
 </div>

 {/* Allergens */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-lg font-semibold text-gray-900 mb-6">Allergènes</h2>
 
 {formData.allergens.map((allergen, index) => (
 <div key={index} className="flex items-center space-x-2 mb-2">
 <input
 type="text"
 value={allergen}
 onChange={(e) => updateAllergen(index, e.target.value)}
 className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="Allergène"
 />
 <button
 type="button"
 onClick={() => removeAllergen(index)}
 className="text-red-600 hover:text-red-800"
 >
 <FiX className="w-5 h-5" />
 </button>
 </div>
 ))}
 
 <button
 type="button"
 onClick={addAllergen}
 className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-2"
 >
 <FiPlus className="w-4 h-4" />
 <span>Ajouter un allergène</span>
 </button>
 </div>

 {/* Nutritional Information */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations nutritionnelles (pour 100g)</h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label htmlFor="nutritionalInfo.calories" className="block text-sm font-medium text-gray-700 mb-2">
 Calories (kcal)
 </label>
 <input
 type="number"
 id="nutritionalInfo.calories"
 name="nutritionalInfo.calories"
 min="0"
 value={formData.nutritionalInfo.calories}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0"
 />
 </div>

 <div>
 <label htmlFor="nutritionalInfo.protein" className="block text-sm font-medium text-gray-700 mb-2">
 Protéines (g)
 </label>
 <input
 type="number"
 id="nutritionalInfo.protein"
 name="nutritionalInfo.protein"
 min="0"
 step="0.1"
 value={formData.nutritionalInfo.protein}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0"
 />
 </div>

 <div>
 <label htmlFor="nutritionalInfo.carbs" className="block text-sm font-medium text-gray-700 mb-2">
 Glucides (g)
 </label>
 <input
 type="number"
 id="nutritionalInfo.carbs"
 name="nutritionalInfo.carbs"
 min="0"
 step="0.1"
 value={formData.nutritionalInfo.carbs}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0"
 />
 </div>

 <div>
 <label htmlFor="nutritionalInfo.fat" className="block text-sm font-medium text-gray-700 mb-2">
 Lipides (g)
 </label>
 <input
 type="number"
 id="nutritionalInfo.fat"
 name="nutritionalInfo.fat"
 min="0"
 step="0.1"
 value={formData.nutritionalInfo.fat}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0"
 />
 </div>

 <div>
 <label htmlFor="nutritionalInfo.fiber" className="block text-sm font-medium text-gray-700 mb-2">
 Fibres (g)
 </label>
 <input
 type="number"
 id="nutritionalInfo.fiber"
 name="nutritionalInfo.fiber"
 min="0"
 step="0.1"
 value={formData.nutritionalInfo.fiber}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="0"
 />
 </div>
 </div>
 </div>

 {/* Submit */}
 <div className="flex justify-end space-x-4">
 <Link
 href={`/admin/products/${params.id}`}
 className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
 >
 Annuler
 </Link>
 <button
 type="submit"
 disabled={saving}
 className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
 >
 {saving ? (
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 ) : (
 <>
 <FiPlus className="w-5 h-5" />
 <span>Enregistrer les modifications</span>
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 )
}

