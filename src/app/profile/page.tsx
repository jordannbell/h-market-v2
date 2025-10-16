'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { FiEdit, FiMail, FiMapPin, FiPackage, FiPhone, FiSave, FiShield, FiUser, FiX } from 'react-icons/fi'


interface UserProfile {
 _id: string
 name: {
 first: string
 last: string
 }
 email: string
 phone: string
 role: string
 address?: {
 street: string
 city: string
 postalCode: string
 country: string
 }
 isVerified: boolean
 createdAt: string
}

interface Order {
 id: string
 orderNumber: string
 status: string
 totals: {
 total: number
 }
 createdAt: string
}

export default function ProfilePage() {
 const router = useRouter()
 const { user, isAuthenticated, loading: authLoading } = useAuth()
 
 const [profile, setProfile] = useState<UserProfile | null>(null)
 const [orders, setOrders] = useState<Order[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [isEditing, setIsEditing] = useState(false)
 const [editForm, setEditForm] = useState({
 firstName: '',
 lastName: '',
 phone: '',
 street: '',
 city: '',
 postalCode: '',
 country: 'France'
 })

 useEffect(() => {
 if (authLoading) return
 
 if (!isAuthenticated) {
 router.push('/auth/login?redirect=/profile')
 return
 }

 // Charger le profil et les commandes
 fetchProfile()
 fetchUserOrders()
 }, [isAuthenticated, authLoading])

 const fetchProfile = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) {
 throw new Error('Token d\'authentification manquant')
 }

 // Utiliser les données de useAuth pour le profil
 if (user) {
 setProfile(user)
 setEditForm({
 firstName: user.name.first,
 lastName: user.name.last,
 phone: user.phone,
 street: user.address?.street || '',
 city: user.address?.city || '',
 postalCode: user.address?.postalCode || '',
 country: user.address?.country || 'France'
 })
 }
 } catch (error: unknown) {
 setError(error.message || 'Erreur lors du chargement du profil')
 } finally {
 setLoading(false)
 }
 }

 const fetchUserOrders = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) return

 const response = await fetch('/api/orders', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const result = await response.json()
 setOrders(result.orders || [])
 }
 } catch (error) {
 console.error('Erreur lors du chargement des commandes:', error)
 }
 }

 const handleEdit = () => {
 setIsEditing(true)
 }

 const handleCancel = () => {
 setIsEditing(false)
 // Restaurer les valeurs originales
 if (profile) {
 setEditForm({
 firstName: profile.name.first,
 lastName: profile.name.last,
 phone: profile.phone,
 street: profile.address?.street || '',
 city: profile.address?.city || '',
 postalCode: profile.address?.postalCode || '',
 country: profile.address?.country || 'France'
 })
 }
 }

 const handleSave = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) {
 throw new Error('Token d\'authentification manquant')
 }

 const response = await fetch(`/api/users/profile`, {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 name: {
 first: editForm.firstName,
 last: editForm.lastName
 },
 phone: editForm.phone,
 address: {
 street: editForm.street,
 city: editForm.city,
 postalCode: editForm.postalCode,
 country: editForm.country
 }
 })
 })

 if (response.ok) {
 const result = await response.json()
 setProfile(result.user)
 setIsEditing(false)
 toast.success('Profil mis à jour avec succès !')
 
 // Mettre à jour le localStorage
 localStorage.setItem('user', JSON.stringify(result.user))
 } else {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Erreur lors de la mise à jour')
 }
 } catch (error: unknown) {
 toast.error(error.message || 'Erreur lors de la mise à jour du profil')
 }
 }

 const getStatusLabel = (status: string) => {
 switch (status) {
 case 'pending':
 return 'En attente'
 case 'confirmed':
 return 'Confirmée'
 case 'preparing':
 return 'En préparation'
 case 'out_for_delivery':
 return 'En livraison'
 case 'delivered':
 return 'Livrée'
 case 'cancelled':
 return 'Annulée'
 default:
 return 'Inconnu'
 }
 }

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'pending':
 return 'bg-yellow-100 text-yellow-800'
 case 'confirmed':
 case 'preparing':
 return 'bg-blue-100 text-blue-800'
 case 'out_for_delivery':
 return 'bg-orange-100 text-orange-800'
 case 'delivered':
 return 'bg-green-100 text-green-800'
 case 'cancelled':
 return 'bg-red-100 text-red-800'
 default:
 return 'bg-gray-100 text-gray-800'
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Chargement de votre profil...</p>
 </div>
 </div>
 )
 }

 if (error || !profile) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <div className="text-red-500 text-6xl mb-4"></div>
 <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
 <p className="text-gray-600 mb-6">{error || 'Profil non trouvé'}</p>
 <Link
 href="/"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
 >
 Retour à l'accueil
 </Link>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-green-50">
 <Navigation showSearch={false} />
 
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="mb-8">
 <Link
 href="/"
 className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
 >
 <FiUser className="w-4 h-4 mr-2" />
 Retour à l'accueil
 </Link>
 <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
 <p className="text-gray-600 mt-2">
 Gérez vos informations personnelles et suivez vos commandes
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Informations du profil */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-gray-900 flex items-center">
 <FiUser className="w-5 h-5 mr-2 text-green-600" />
 Informations personnelles
 </h2>
 {!isEditing ? (
 <button
 onClick={handleEdit}
 className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
 >
 <FiEdit className="w-4 h-4 mr-2" />
 Modifier
 </button>
 ) : (
 <div className="flex items-center space-x-2">
 <button
 onClick={handleSave}
 className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
 >
 <FiSave className="w-4 h-4 mr-2" />
 Sauvegarder
 </button>
 <button
 onClick={handleCancel}
 className="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium"
 >
 <FiX className="w-4 h-4 mr-2" />
 Annuler
 </button>
 </div>
 )}
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Prénom */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Prénom
 </label>
 {isEditing ? (
 <input
 type="text"
 value={editForm.firstName}
 onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 ) : (
 <p className="text-gray-900">{profile.name.first}</p>
 )}
 </div>

 {/* Nom */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Nom
 </label>
 {isEditing ? (
 <input
 type="text"
 value={editForm.lastName}
 onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 ) : (
 <p className="text-gray-900">{profile.name.last}</p>
 )}
 </div>

 {/* Email */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
 <FiMail className="w-4 h-4 mr-2" />
 Email
 </label>
 <p className="text-gray-900">{profile.email}</p>
 {profile.isVerified && (
 <span className="inline-flex items-center text-xs text-green-600 mt-1">
 <FiShield className="w-3 h-3 mr-1" />
 Vérifié
 </span>
 )}
 </div>

 {/* Téléphone */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
 <FiPhone className="w-4 h-4 mr-2" />
 Téléphone
 </label>
 {isEditing ? (
 <input
 type="tel"
 value={editForm.phone}
 onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 ) : (
 <p className="text-gray-900">{profile.phone}</p>
 )}
 </div>
 </div>

 {/* Adresse */}
 <div className="mt-6">
 <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
 <FiMapPin className="w-5 h-5 mr-2 text-green-600" />
 Adresse de livraison
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Rue
 </label>
 {isEditing ? (
 <input
 type="text"
 value={editForm.street}
 onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 ) : (
 <p className="text-gray-900">{profile.address?.street || 'Non renseignée'}</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Ville
 </label>
 {isEditing ? (
 <input
 type="text"
 value={editForm.city}
 onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 ) : (
 <p className="text-gray-900">{profile.address?.city || 'Non renseignée'}</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Code postal
 </label>
 {isEditing ? (
 <input
 type="text"
 value={editForm.postalCode}
 onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 ) : (
 <p className="text-gray-900">{profile.address?.postalCode || 'Non renseignée'}</p>
 )}
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Pays
 </label>
 {isEditing ? (
 <select
 value={editForm.country}
 onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 >
 <option value="France">France</option>
 <option value="Belgique">Belgique</option>
 <option value="Suisse">Suisse</option>
 <option value="Canada">Canada</option>
 </select>
 ) : (
 <p className="text-gray-900">{profile.address?.country || 'Non renseignée'}</p>
 )}
 </div>
 </div>
 </div>

 {/* Informations du compte */}
 <div className="mt-6 pt-6 border-t border-gray-200">
 <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du compte</h3>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Rôle
 </label>
 <p className="text-gray-900 capitalize">{profile.role}</p>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Membre depuis
 </label>
 <p className="text-gray-900">
 {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Résumé et actions */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
 <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé</h2>
 
 {/* Statistiques */}
 <div className="space-y-4 mb-6">
 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-green-800">Total commandes</span>
 <span className="text-2xl font-bold text-green-900">{orders.length}</span>
 </div>
 </div>
 
 {orders.length > 0 && (
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-blue-800">Dernière commande</span>
 <span className="text-sm font-bold text-blue-900">
 {new Date(orders[0].createdAt).toLocaleDateString('fr-FR')}
 </span>
 </div>
 </div>
 )}
 </div>

 {/* Actions rapides */}
 <div className="space-y-3">
 <Link
 href="/mes-commandes"
 className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-center block"
 >
 <FiPackage className="w-4 h-4 inline mr-2" />
 Mes commandes
 </Link>
 
 <Link
 href="/"
 className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold text-center block"
 >
 Continuer mes achats
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
