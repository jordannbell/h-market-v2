'use client'

import { useState, useEffect } from 'react'
import { useGoogleMapsAdvanced } from '@/hooks/useGoogleMapsAdvanced'
import toast from 'react-hot-toast'
import { FiCheck, FiClock, FiDollarSign, FiMapPin, FiPackage, FiUser } from 'react-icons/fi'


interface AvailableOrder {
 _id: string
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
 country: string
 }
 items: Array<{
 title: string
 quantity: number
 totalPrice: number
 image: string
 }>
 totals: {
 total: number
 }
 status: string
 deliveryStatus: string
 estimatedDeliveryTime?: string
 createdAt: string
 estimatedDistance: number | null
 estimatedDuration: number | null
}

interface AvailableOrdersListProps {
 onOrderAccepted?: (orderId: string) => void
 className?: string
}

export default function AvailableOrdersList({ 
 onOrderAccepted,
 className = '' 
}: AvailableOrdersListProps) {
 const [orders, setOrders] = useState<AvailableOrder[]>([])
 const [loading, setLoading] = useState(true)
 const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null)
 const { isLoaded, geocodeAddress, getCurrentLocation } = useGoogleMapsAdvanced()

 // Charger les commandes disponibles
 useEffect(() => {
 fetchAvailableOrders()
 }, [])

 const fetchAvailableOrders = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) return

 const response = await fetch('/api/delivery/available-orders', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 setOrders(data.orders || [])
 
 // Calculer les distances si Google Maps est disponible
 if (isLoaded) {
 calculateDistances(data.orders || [])
 }
 } else {
 const errorData = await response.json()
 toast.error(errorData.error || 'Erreur lors du chargement des commandes')
 }
 } catch (error) {
 console.error('Erreur lors du chargement des commandes:', error)
 toast.error('Erreur lors du chargement des commandes')
 } finally {
 setLoading(false)
 }
 }

 const calculateDistances = async (ordersList: AvailableOrder[]) => {
 try {
 const currentLocation = await getCurrentLocation()
 if (!currentLocation) return

 const updatedOrders = await Promise.all(
 ordersList.map(async (order) => {
 try {
 const destinationAddress = `${order.address.street}, ${order.address.city} ${order.address.postalCode}`
 const destinationCoords = await geocodeAddress(destinationAddress)
 
 if (destinationCoords) {
 // Calculer la distance en ligne droite (approximation)
 const distance = calculateDistance(
 currentLocation.lat,
 currentLocation.lng,
 destinationCoords.lat,
 destinationCoords.lng
 )
 
 return {
 ...order,
 estimatedDistance: Math.round(distance * 10) / 10,
 estimatedDuration: Math.round((distance / 30) * 60) // Estimation à 30 km/h en ville
 }
 }
 } catch (error) {
 console.error('Erreur lors du calcul de distance:', error)
 }
 
 return order
 })
 )

 setOrders(updatedOrders)
 } catch (error) {
 console.error('Erreur lors du calcul des distances:', error)
 }
 }

 // Fonction pour calculer la distance entre deux points
 const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
 const R = 6371 // Rayon de la Terre en km
 const dLat = (lat2 - lat1) * Math.PI / 180
 const dLon = (lon2 - lon1) * Math.PI / 180
 const a = 
 Math.sin(dLat/2) * Math.sin(dLat/2) +
 Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
 Math.sin(dLon/2) * Math.sin(dLon/2)
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
 return R * c
 }

 const acceptOrder = async (orderId: string) => {
 setAcceptingOrder(orderId)
 
 try {
 const token = localStorage.getItem('token')
 if (!token) {
 toast.error('Token d\'authentification manquant')
 return
 }

 const response = await fetch('/api/delivery/accept', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({ orderId })
 })

 const data = await response.json()

 if (response.ok) {
 toast.success('Commande acceptée avec succès!')
 onOrderAccepted?.(orderId)
 
 // Retirer la commande de la liste
 setOrders(prev => prev.filter(order => order._id !== orderId))
 } else {
 toast.error(data.error || 'Erreur lors de l\'acceptation de la commande')
 }
 } catch (error) {
 console.error('Erreur lors de l\'acceptation de la commande:', error)
 toast.error('Erreur lors de l\'acceptation de la commande')
 } finally {
 setAcceptingOrder(null)
 }
 }

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'confirmed':
 return 'bg-blue-100 text-blue-800'
 case 'ready_for_pickup':
 return 'bg-orange-100 text-orange-800'
 default:
 return 'bg-gray-100 text-gray-800'
 }
 }

 const getStatusText = (status: string) => {
 switch (status) {
 case 'confirmed':
 return 'Confirmée'
 case 'ready_for_pickup':
 return 'Prête pour récupération'
 default:
 return status
 }
 }

 if (loading) {
 return (
 <div className={`space-y-4 ${className}`}>
 {[1, 2, 3].map((i) => (
 <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
 <div className="flex items-center justify-between">
 <div className="space-y-2">
 <div className="h-4 bg-gray-200 rounded w-32"></div>
 <div className="h-3 bg-gray-200 rounded w-24"></div>
 </div>
 <div className="h-8 bg-gray-200 rounded w-20"></div>
 </div>
 </div>
 ))}
 </div>
 )
 }

 if (orders.length === 0) {
 return (
 <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
 <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande disponible</h3>
 <p className="text-gray-600">
 Il n'y a actuellement aucune commande disponible pour la livraison.
 </p>
 <button
 onClick={fetchAvailableOrders}
 className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
 >
 Actualiser
 </button>
 </div>
 )
 }

 return (
 <div className={`space-y-4 ${className}`}>
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-semibold text-gray-900">
 Commandes disponibles ({orders.length})
 </h2>
 <button
 onClick={fetchAvailableOrders}
 className="text-green-600 hover:text-green-700 text-sm font-medium"
 >
 Actualiser
 </button>
 </div>

 {orders.map((order) => (
 <div key={order._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
 {/* Header */}
 <div className="p-4 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
 <FiPackage className="w-5 h-5 text-green-600" />
 </div>
 <div>
 <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
 <p className="text-sm text-gray-600">
 {new Date(order.createdAt).toLocaleString('fr-FR')}
 </p>
 </div>
 </div>
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
 {getStatusText(order.status)}
 </span>
 </div>
 </div>

 {/* Contenu */}
 <div className="p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 {/* Informations client */}
 <div className="space-y-3">
 <div className="flex items-center space-x-2">
 <FiUser className="w-4 h-4 text-gray-500" />
 <span className="text-sm font-medium text-gray-900">{order.customer.name}</span>
 </div>
 
 <div className="flex items-center space-x-2">
 <FiMapPin className="w-4 h-4 text-gray-500" />
 <span className="text-sm text-gray-600">
 {order.address.street}, {order.address.city}
 </span>
 </div>
 
 <div className="flex items-center space-x-2">
 <FiDollarSign className="w-4 h-4 text-gray-500" />
 <span className="text-sm font-medium text-gray-900">
 {order.totals.total.toFixed(2)} €
 </span>
 </div>
 </div>

 {/* Informations de distance */}
 <div className="space-y-3">
 {order.estimatedDistance && (
 <div className="flex items-center space-x-2">
 <FiMapPin className="w-4 h-4 text-green-500" />
 <span className="text-sm text-gray-600">
 {order.estimatedDistance} km
 </span>
 </div>
 )}
 
 {order.estimatedDuration && (
 <div className="flex items-center space-x-2">
 <FiClock className="w-4 h-4 text-orange-500" />
 <span className="text-sm text-gray-600">
 ~{order.estimatedDuration} min
 </span>
 </div>
 )}
 
 {order.estimatedDeliveryTime && (
 <div className="flex items-center space-x-2">
 <FiClock className="w-4 h-4 text-blue-500" />
 <span className="text-sm text-gray-600">
 Livraison prévue: {new Date(order.estimatedDeliveryTime).toLocaleTimeString('fr-FR')}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Articles */}
 <div className="mb-4">
 <h4 className="text-sm font-medium text-gray-900 mb-2">Articles commandés:</h4>
 <div className="space-y-1">
 {order.items.slice(0, 3).map((item, index) => (
 <div key={index} className="flex items-center justify-between text-sm">
 <span className="text-gray-600">{item.title} x{item.quantity}</span>
 <span className="text-gray-900 font-medium">{item.totalPrice.toFixed(2)} €</span>
 </div>
 ))}
 {order.items.length > 3 && (
 <p className="text-xs text-gray-500">+{order.items.length - 3} autres articles</p>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center space-x-3">
 <button
 onClick={() => acceptOrder(order._id)}
 disabled={acceptingOrder === order._id}
 className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
 >
 {acceptingOrder === order._id ? (
 <>
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 <span>Acceptation...</span>
 </>
 ) : (
 <>
 <FiCheck className="w-4 h-4" />
 <span>Accepter la commande</span>
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 )
}
