'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { FiCheck, FiClock, FiEye, FiMapPin, FiPackage, FiTruck } from 'react-icons/fi'


interface Order {
 _id: string
 orderNumber: string
 status: string
 payment?: {
 status: string
 }
 delivery?: {
 status: string
 deliveryCode?: string
 estimatedDeliveryTime?: string
 actualDeliveryTime?: string
 }
 orderProgress?: {
 step: string
 currentStep: number
 totalSteps: number
 }
 items: Array<{
 title: string
 quantity: number
 totalPrice: number
 }>
 totals: {
 total: number
 }
 address?: {
 street: string
 city: string
 postalCode: string
 }
 createdAt: string
}

export default function MesCommandesPage() {
 const router = useRouter()
 const { user, isAuthenticated, loading: authLoading } = useAuth()
 
 const [orders, setOrders] = useState<Order[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 useEffect(() => {
 if (authLoading) return
 
 if (!isAuthenticated) {
 router.push('/auth/login?redirect=/mes-commandes')
 return
 }

 // Charger les commandes de l'utilisateur
 fetchUserOrders()
 }, [isAuthenticated, authLoading])

 const fetchUserOrders = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) {
 throw new Error('Token d\'authentification manquant')
 }

 const response = await fetch('/api/orders', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const result = await response.json()
 console.log(' Commandes reçues de l\'API:', result.orders?.length || 0)
 
 if (result.orders && result.orders.length > 0) {
 console.log('Première commande reçue:', {
 id: result.orders[0]._id,
 status: result.orders[0].status,
 paymentStatus: result.orders[0].payment?.status,
 createdAt: result.orders[0].createdAt
 })
 }
 
 // Afficher toutes les commandes (pas de filtrage strict)
 setOrders(result.orders || [])
 } else {
 const errorData = await response.json()
 throw new Error(errorData.error || 'Erreur lors du chargement des commandes')
 }
 } catch (error: unknown) {
 console.error(' Erreur fetchUserOrders:', error)
 setError(error.message || 'Erreur lors du chargement des commandes')
 } finally {
 setLoading(false)
 }
 }

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'pending':
 return <FiClock className="w-5 h-5 text-yellow-600" />
 case 'confirmed':
 case 'preparing':
 return <FiPackage className="w-5 h-5 text-blue-600" />
 case 'out_for_delivery':
 return <FiTruck className="w-5 h-5 text-orange-600" />
 case 'delivered':
 return <FiCheck className="w-5 h-5 text-green-600" />
 case 'cancelled':
 return <FiClock className="w-5 h-5 text-red-600" />
 default:
 return <FiClock className="w-5 h-5 text-gray-600" />
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
 case 'failed':
 return 'Échouée'
 case 'refunded':
 return 'Remboursée'
 default:
 return status || 'Inconnu'
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
 case 'failed':
 return 'bg-red-100 text-red-800'
 case 'refunded':
 return 'bg-purple-100 text-purple-800'
 default:
 return 'bg-gray-100 text-gray-800'
 }
 }

 const getProgressPercentage = (order: Order) => {
 // Vérifier si orderProgress existe, sinon calculer basé sur le statut
 if (order.orderProgress && order.orderProgress.totalSteps > 0) {
 return Math.round((order.orderProgress.currentStep / order.orderProgress.totalSteps) * 100)
 }
 
 // Calcul basé sur le statut pour les anciennes commandes
 switch (order.status) {
 case 'pending':
 return 0
 case 'confirmed':
 case 'preparing':
 return 33
 case 'out_for_delivery':
 return 66
 case 'delivered':
 return 100
 default:
 return 0
 }
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Chargement de vos commandes...</p>
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <div className="text-red-500 text-6xl mb-4"></div>
 <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
 <p className="text-gray-600 mb-6">{error}</p>
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
 <FiMapPin className="w-4 h-4 mr-2" />
 Retour à l'accueil
 </Link>
 <h1 className="text-3xl font-bold text-gray-900">Mes commandes</h1>
 <p className="text-gray-600 mt-2">
 Suivez l'état de toutes vos commandes
 </p>
 </div>

 {orders.length === 0 ? (
 <div className="text-center py-12">
 <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h2>
 <p className="text-gray-600 mb-6">
 Vous n'avez pas encore passé de commande. 
 Commencez par découvrir nos produits !
 </p>
 <Link
 href="/"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
 >
 Découvrir nos produits
 </Link>
 </div>
 ) : (
 <div className="space-y-6">
 {orders.map((order) => (
 <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
 {/* En-tête de la commande */}
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center space-x-4">
 <div className="flex items-center space-x-2">
 {getStatusIcon(order.status)}
 <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
 {getStatusLabel(order.status)}
 </span>
 {/* Indicateur de paiement */}
 {order.payment?.status === 'succeeded' && (
 <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
 Payé
 </span>
 )}
 {order.payment?.status === 'pending' && (
 <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
 Paiement en attente
 </span>
 )}
 {order.payment?.status === 'failed' && (
 <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
 Paiement échoué
 </span>
 )}
 </div>
 <span className="text-sm text-gray-500">
 #{order.orderNumber}
 </span>
 </div>
 <div className="text-right">
 <p className="text-lg font-bold text-gray-900">
 {order.totals.total.toFixed(2)} €
 </p>
 <p className="text-sm text-gray-500">
 {new Date(order.createdAt).toLocaleDateString('fr-FR')}
 </p>
 </div>
 </div>

 {/* Barre de progression */}
 <div className="mb-4">
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-gray-700">
 Progression : {getProgressPercentage(order)}%
 </span>
 <span className="text-sm text-gray-500">
 {order.orderProgress ? 
 `Étape ${order.orderProgress.currentStep} sur ${order.orderProgress.totalSteps}` :
 `Statut: ${getStatusLabel(order.status)}`
 }
 </span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2">
 <div 
 className="bg-green-600 h-2 rounded-full transition-all duration-500"
 style={{ width: `${getProgressPercentage(order)}%` }}
 ></div>
 </div>
 </div>

 {/* Articles */}
 <div className="mb-4">
 <h3 className="text-sm font-medium text-gray-900 mb-2">Articles commandés :</h3>
 <div className="space-y-2">
 {order.items.slice(0, 3).map((item, index) => (
 <div key={index} className="flex items-center justify-between text-sm">
 <span className="text-gray-600">
 {item.title} × {item.quantity}
 </span>
 <span className="text-gray-900 font-medium">
 {item.totalPrice.toFixed(2)} €
 </span>
 </div>
 ))}
 {order.items.length > 3 && (
 <p className="text-xs text-gray-500 text-center">
 +{order.items.length - 3} autres articles
 </p>
 )}
 </div>
 </div>

 {/* Adresse de livraison */}
 {order.address && (
 <div className="mb-4">
 <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
 <FiMapPin className="w-4 h-4 mr-2 text-green-600" />
 Adresse de livraison :
 </h3>
 <p className="text-sm text-gray-600">
 {order.address.street}, {order.address.postalCode} {order.address.city}
 </p>
 </div>
 )}

 {/* Actions */}
 <div className="flex items-center justify-between pt-4 border-t border-gray-200">
 <div className="flex items-center space-x-4">
 <Link
 href={`/commande-confirmee?orderId=${order._id}`}
 className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
 >
 <FiEye className="w-4 h-4 mr-2" />
 Suivre la commande
 </Link>
 {order.delivery?.status === 'in_transit' && order.delivery?.deliveryCode && (
 <span className="text-sm text-blue-600 font-medium">
 Code de livraison : {order.delivery.deliveryCode}
 </span>
 )}
 {order.delivery?.status === 'assigned' && (
 <span className="text-sm text-green-600 font-medium">
 Livreur assigné
 </span>
 )}
 </div>
 
 <div className="text-right">
 {order.delivery?.estimatedDeliveryTime && (
 <>
 <p className="text-sm text-gray-500">Livraison estimée :</p>
 <p className="text-sm font-medium text-gray-900">
 {new Date(order.delivery.estimatedDeliveryTime).toLocaleDateString('fr-FR')}
 </p>
 </>
 )}
 {order.delivery?.status === 'delivered' && order.delivery?.actualDeliveryTime && (
 <>
 <p className="text-sm text-gray-500">Livrée le :</p>
 <p className="text-sm font-medium text-green-600">
 {new Date(order.delivery.actualDeliveryTime).toLocaleDateString('fr-FR')}
 </p>
 </>
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 )
}
