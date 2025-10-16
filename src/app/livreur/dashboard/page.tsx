'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiClock, FiDollarSign, FiPackage, FiStar, FiTruck } from 'react-icons/fi'


interface DeliveryStats {
 isAvailable: boolean
 todayDeliveries: number
 todayRevenue: number
 rating: number
 totalDeliveries: number
 totalRevenue: number
 vehicleType: string
 deliveryZone: string
 lastActive: string | null
}

interface ActiveDelivery {
 id: string
 orderNumber: string
 customer: {
 name: string
 email: string
 phone: string
 }
 address: {
 street: string
 city: string
 postalCode: string
 }
 status: string
 estimatedDeliveryTime?: string
 total: number
 createdAt: string
}

export default function LivreurDashboard() {
 const { user, token } = useAuth()
 const router = useRouter()
 const [stats, setStats] = useState<DeliveryStats | null>(null)
 const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 if (token) {
 fetchStats()
 }
 }, [token])

 const fetchStats = async () => {
 try {
 const response = await fetch('/api/livreur/stats', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 setStats(data.stats)
 setActiveDeliveries(data.activeDeliveries || [])
 } else {
 toast.error('Erreur lors du chargement des statistiques')
 }
 } catch (error) {
 console.error('Erreur:', error)
 toast.error('Erreur lors du chargement des statistiques')
 } finally {
 setLoading(false)
 }
 }

 const toggleAvailability = async () => {
 try {
 const newAvailability = !stats?.isAvailable
 
 const response = await fetch('/api/livreur/toggle-availability', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({ isAvailable: newAvailability })
 })

 if (response.ok) {
 const data = await response.json()
 setStats(prev => prev ? { ...prev, isAvailable: data.isAvailable } : null)
 toast.success(data.message || (newAvailability ? 'Vous êtes maintenant disponible' : 'Vous êtes maintenant indisponible'))
 } else {
 const errorData = await response.json()
 toast.error(errorData.error || 'Erreur lors de la mise à jour')
 }
 } catch (error) {
 console.error('Erreur:', error)
 toast.error('Erreur lors de la mise à jour de la disponibilité')
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-slate-50 relative overflow-hidden">
 {/* Grande icône en fond */}
 <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
 <FiTruck className="w-[600px] h-[600px] text-slate-800" strokeWidth={0.5} />
 </div>

 <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="mb-8">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
 <p className="text-slate-600 mt-1">Bienvenue, {user?.name?.first || 'Livreur'}</p>
 </div>
 
 {/* Bouton de disponibilité */}
 <button
 onClick={toggleAvailability}
 className={`px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl ${
 stats?.isAvailable
 ? 'bg-green-500 hover:bg-green-600 text-white'
 : 'bg-gray-400 hover:bg-gray-500 text-white'
 }`}
 >
 <div className={`w-3 h-3 rounded-full ${stats?.isAvailable ? 'bg-white animate-pulse' : 'bg-gray-200'}`}></div>
 <span>{stats?.isAvailable ? 'Disponible' : 'Non disponible'}</span>
 </button>
 </div>
 </div>

 {/* Statistiques principales */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {/* Livraisons aujourd'hui */}
 <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-4">
 <div className="p-3 bg-slate-100 rounded-lg">
 <FiPackage className="w-6 h-6 text-slate-800" />
 </div>
 <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aujourd'hui</span>
 </div>
 <div className="space-y-1">
 <p className="text-3xl font-bold text-slate-900">{stats?.todayDeliveries || 0}</p>
 <p className="text-sm text-slate-600">Livraisons</p>
 </div>
 </div>

 {/* Revenus aujourd'hui */}
 <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-4">
 <div className="p-3 bg-green-100 rounded-lg">
 <FiDollarSign className="w-6 h-6 text-green-700" />
 </div>
 <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Revenus</span>
 </div>
 <div className="space-y-1">
 <p className="text-3xl font-bold text-slate-900">{stats?.todayRevenue?.toFixed(2) || '0.00'}€</p>
 <p className="text-sm text-slate-600">Aujourd'hui</p>
 </div>
 </div>

 {/* Livraisons actives */}
 <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-4">
 <div className="p-3 bg-blue-100 rounded-lg">
 <FiTruck className="w-6 h-6 text-blue-700" />
 </div>
 <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">En cours</span>
 </div>
 <div className="space-y-1">
 <p className="text-3xl font-bold text-slate-900">{activeDeliveries?.length || 0}</p>
 <p className="text-sm text-slate-600">Livraisons actives</p>
 </div>
 </div>

 {/* Note moyenne */}
 <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-4">
 <div className="p-3 bg-yellow-100 rounded-lg">
 <FiStar className="w-6 h-6 text-yellow-600" />
 </div>
 <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Note</span>
 </div>
 <div className="space-y-1">
 <p className="text-3xl font-bold text-slate-900">{stats?.rating?.toFixed(1) || '0.0'}</p>
 <p className="text-sm text-slate-600">Moyenne</p>
 </div>
 </div>
 </div>

 {/* Livraisons actives */}
 {activeDeliveries && activeDeliveries.length > 0 && (
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
 <div className="px-6 py-4 border-b border-slate-200">
 <h2 className="text-lg font-semibold text-slate-900">Livraisons en cours</h2>
 </div>
 <div className="divide-y divide-slate-200">
 {activeDeliveries.map((delivery) => (
 <div key={delivery.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
 <div className="flex items-center justify-between">
 <div className="flex-1">
 <div className="flex items-center space-x-3 mb-2">
 <span className="text-sm font-mono text-slate-600">#{delivery.orderNumber}</span>
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${
 delivery.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
 delivery.status === 'picked_up' ? 'bg-yellow-100 text-yellow-700' :
 delivery.status === 'in_transit' ? 'bg-green-100 text-green-700' :
 'bg-slate-100 text-slate-700'
 }`}>
 {delivery.status === 'assigned' ? 'Acceptée' :
 delivery.status === 'picked_up' ? 'Récupérée' :
 delivery.status === 'in_transit' ? 'En route' :
 delivery.status}
 </span>
 </div>
 <p className="text-sm font-medium text-slate-900">{delivery.customer.name}</p>
 <p className="text-sm text-slate-600">{delivery.address.street}, {delivery.address.city}</p>
 </div>
 <div className="text-right">
 <p className="text-lg font-bold text-slate-900">{delivery.total.toFixed(2)}€</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Aucune livraison active */}
 {(!activeDeliveries || activeDeliveries.length === 0) && (
 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
 <FiTruck className="w-8 h-8 text-slate-400" />
 </div>
 <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune livraison en cours</h3>
 <p className="text-slate-600 mb-6">Consultez les commandes disponibles pour commencer</p>
 <button
 onClick={() => router.push('/livreur/commandes')}
 className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-6 rounded-lg transition-colors"
 >
 Voir les commandes
 </button>
 </div>
 )}

 {/* Actions rapides */}
 <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
 <button
 onClick={() => router.push('/livreur/commandes')}
 className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl p-6 text-left transition-all hover:border-slate-800"
 >
 <div className="flex items-center space-x-4">
 <div className="p-3 bg-slate-100 rounded-lg">
 <FiPackage className="w-6 h-6 text-slate-800" />
 </div>
 <div>
 <h3 className="font-semibold text-slate-900">Mes commandes</h3>
 <p className="text-sm text-slate-600">Gérer les livraisons</p>
 </div>
 </div>
 </button>

 <button
 onClick={() => router.push('/livreur/trajet')}
 className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl p-6 text-left transition-all hover:border-slate-800"
 >
 <div className="flex items-center space-x-4">
 <div className="p-3 bg-slate-100 rounded-lg">
 <FiTruck className="w-6 h-6 text-slate-800" />
 </div>
 <div>
 <h3 className="font-semibold text-slate-900">Trajet</h3>
 <p className="text-sm text-slate-600">Navigation en temps réel</p>
 </div>
 </div>
 </button>

 <button
 onClick={() => router.push('/livreur/chat')}
 className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl p-6 text-left transition-all hover:border-slate-800"
 >
 <div className="flex items-center space-x-4">
 <div className="p-3 bg-slate-100 rounded-lg">
 <FiClock className="w-6 h-6 text-slate-800" />
 </div>
 <div>
 <h3 className="font-semibold text-slate-900">Chat</h3>
 <p className="text-sm text-slate-600">Messages clients</p>
 </div>
 </div>
 </button>
 </div>
 </div>
 </div>
 )
}
