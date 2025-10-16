'use client'

import { useState, useEffect } from 'react'
import { FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiPackage, FiTruck } from 'react-icons/fi'


interface OrderItem {
 _id: string
 productId: string
 title: string
 slug: string
 image: string
 price: number
 quantity: number
 totalPrice: number
}

interface Order {
 _id: string
 orderNumber: string
 userId: string
 items: OrderItem[]
 totals: {
 subtotal: number
 deliveryFee: number
 taxes: number
 discounts: number
 total: number
 }
 payment: {
 method: 'stripe' | 'paypal'
 status: 'pending' | 'succeeded' | 'failed' | 'refunded'
 amount: number
 currency: string
 }
 address: {
 street: string
 city: string
 postalCode: string
 country: string
 }
 delivery: {
 mode: 'planned' | 'express' | 'outside_idf'
 status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
 estimatedDeliveryTime?: string
 actualDeliveryTime?: string
 assignedDriverId?: string
 }
 status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
 orderProgress: {
 step: 'preparation' | 'in_transit' | 'delivery' | 'completed'
 currentStep: number
 totalSteps: number
 }
 notes?: string
 createdAt: string
 updatedAt: string
}

export default function AdminOrdersPage() {
 const [orders, setOrders] = useState<Order[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [selectedStatus, setSelectedStatus] = useState<string>('tous')

 useEffect(() => {
 fetchOrders()
 }, [])

 const fetchOrders = async () => {
 try {
 setLoading(true)
 const response = await fetch('/api/admin/orders')
 
 if (response.ok) {
 const data = await response.json()
 setOrders(data.orders)
 } else {
 setError('Erreur lors du chargement des commandes')
 }
 } catch (error) {
 console.error('Erreur:', error)
 setError('Erreur de connexion au serveur')
 } finally {
 setLoading(false)
 }
 }

 const updateOrderStatus = async (orderId: string, newStatus: string) => {
 try {
 const response = await fetch(`/api/admin/orders/${orderId}/status`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ status: newStatus })
 })

 if (response.ok) {
 // Mettre à jour l'état local
 setOrders(prevOrders => 
 prevOrders.map(order => 
 order._id === orderId 
 ? { ...order, status: newStatus as Order['status'] }
 : order
 )
 )
 } else {
 setError('Erreur lors de la mise à jour du statut')
 }
 } catch (error) {
 console.error('Erreur:', error)
 setError('Erreur de connexion au serveur')
 }
 }

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'pending': return 'bg-yellow-100 text-yellow-800'
 case 'confirmed': return 'bg-blue-100 text-blue-800'
 case 'preparing': return 'bg-purple-100 text-purple-800'
 case 'out_for_delivery': return 'bg-orange-100 text-orange-800'
 case 'delivered': return 'bg-green-100 text-green-800'
 case 'cancelled': return 'bg-red-100 text-red-800'
 default: return 'bg-gray-100 text-gray-800'
 }
 }

 const getStatusLabel = (status: string) => {
 switch (status) {
 case 'pending': return 'En attente'
 case 'confirmed': return 'Confirmée'
 case 'preparing': return 'En préparation'
 case 'out_for_delivery': return 'En livraison'
 case 'delivered': return 'Livrée'
 case 'cancelled': return 'Annulée'
 default: return status
 }
 }

 const getPaymentStatusColor = (status: string) => {
 switch (status) {
 case 'succeeded': return 'bg-green-100 text-green-800'
 case 'pending': return 'bg-yellow-100 text-yellow-800'
 case 'failed': return 'bg-red-100 text-red-800'
 case 'refunded': return 'bg-gray-100 text-gray-800'
 default: return 'bg-gray-100 text-gray-800'
 }
 }

 const getPaymentStatusLabel = (status: string) => {
 switch (status) {
 case 'succeeded': return 'Payé'
 case 'pending': return 'En attente'
 case 'failed': return 'Échoué'
 case 'refunded': return 'Remboursé'
 default: return status
 }
 }

 const getDeliveryModeLabel = (mode: string) => {
 switch (mode) {
 case 'planned': return 'Planifiée'
 case 'express': return 'Express'
 case 'outside_idf': return 'Hors IDF'
 default: return mode
 }
 }

 const filteredOrders = selectedStatus === 'tous' 
 ? orders 
 : orders.filter(order => order.status === selectedStatus)

 if (loading) {
 return (
 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 )
 }

 return (
 <div className="p-6">
 <div className="mb-6">
 <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Commandes</h1>
 <p className="text-gray-600">Suivez et gérez toutes les commandes de vos clients</p>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
 {error}
 </div>
 )}

 {/* Filtres */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
 <div className="flex items-center space-x-4">
 <label className="text-sm font-medium text-gray-700">Filtrer par statut:</label>
 <select
 value={selectedStatus}
 onChange={(e) => setSelectedStatus(e.target.value)}
 className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
 >
 <option value="tous">Tous les statuts</option>
 <option value="pending">En attente</option>
 <option value="confirmed">Confirmée</option>
 <option value="preparing">En préparation</option>
 <option value="out_for_delivery">En livraison</option>
 <option value="delivered">Livrée</option>
 <option value="cancelled">Annulée</option>
 </select>
 
 <button
 onClick={fetchOrders}
 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
 >
 Actualiser
 </button>
 </div>
 </div>

 {/* Statistiques */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
 <div className="flex items-center">
 <div className="p-2 bg-blue-100 rounded-lg">
 <FiPackage className="w-6 h-6 text-blue-600" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Total Commandes</p>
 <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
 </div>
 </div>
 </div>
 
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
 <div className="flex items-center">
 <div className="p-2 bg-yellow-100 rounded-lg">
 <FiClock className="w-6 h-6 text-yellow-600" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">En attente</p>
 <p className="text-2xl font-bold text-gray-900">
 {orders.filter(o => o.status === 'pending').length}
 </p>
 </div>
 </div>
 </div>
 
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
 <div className="flex items-center">
 <div className="p-2 bg-orange-100 rounded-lg">
 <FiTruck className="w-6 h-6 text-orange-600" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">En livraison</p>
 <p className="text-2xl font-bold text-gray-900">
 {orders.filter(o => o.status === 'out_for_delivery').length}
 </p>
 </div>
 </div>
 </div>
 
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
 <div className="flex items-center">
 <div className="p-2 bg-green-100 rounded-lg">
 <FiCheckCircle className="w-6 h-6 text-green-600" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Livrées</p>
 <p className="text-2xl font-bold text-gray-900">
 {orders.filter(o => o.status === 'delivered').length}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Liste des commandes */}
 <div className="bg-white rounded-lg shadow-sm border border-gray-200">
 <div className="px-6 py-4 border-b border-gray-200">
 <h2 className="text-lg font-medium text-gray-900">
 Commandes ({filteredOrders.length})
 </h2>
 </div>
 
 {filteredOrders.length === 0 ? (
 <div className="px-6 py-12 text-center">
 <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500">Aucune commande trouvée</p>
 </div>
 ) : (
 <div className="divide-y divide-gray-200">
 {filteredOrders.map((order) => (
 <div key={order._id} className="p-6">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h3 className="text-lg font-medium text-gray-900">
 Commande #{order.orderNumber}
 </h3>
 <p className="text-sm text-gray-500">
 <FiCalendar className="inline w-4 h-4 mr-1" />
 {new Date(order.createdAt).toLocaleDateString('fr-FR', {
 day: '2-digit',
 month: '2-digit',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })}
 </p>
 </div>
 
 <div className="flex items-center space-x-3">
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
 {getStatusLabel(order.status)}
 </span>
 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment.status)}`}>
 {getPaymentStatusLabel(order.payment.status)}
 </span>
 </div>
 </div>

 {/* Informations de livraison */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
 <div className="bg-gray-50 rounded-lg p-4">
 <h4 className="font-medium text-gray-900 mb-3 flex items-center">
 <FiMapPin className="w-4 h-4 mr-2" />
 Adresse de livraison
 </h4>
 <div className="space-y-1 text-sm">
 <p>{order.address.street}</p>
 <p>{order.address.postalCode} {order.address.city}</p>
 <p>{order.address.country}</p>
 <p className="text-gray-600">Mode: {getDeliveryModeLabel(order.delivery.mode)}</p>
 </div>
 </div>
 
 <div className="bg-gray-50 rounded-lg p-4">
 <h4 className="font-medium text-gray-900 mb-3 flex items-center">
 <FiTruck className="w-4 h-4 mr-2" />
 Statut de livraison
 </h4>
 <div className="space-y-2 text-sm">
 <p><span className="font-medium">Statut:</span> {order.delivery.status}</p>
 {order.orderProgress && (
 <p><span className="font-medium">Étape:</span> {order.orderProgress.step} ({order.orderProgress.currentStep}/{order.orderProgress.totalSteps})</p>
 )}
 {order.delivery.estimatedDeliveryTime && (
 <p><span className="font-medium">Livraison estimée:</span> {new Date(order.delivery.estimatedDeliveryTime).toLocaleDateString('fr-FR')}</p>
 )}
 </div>
 </div>
 </div>

 {/* Produits commandés */}
 <div className="mb-4">
 <h4 className="font-medium text-gray-900 mb-3">Produits commandés</h4>
 <div className="space-y-2">
 {order.items.map((item) => (
 <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
 <div className="flex items-center space-x-3">
 <img 
 src={item.image} 
 alt={item.title}
 className="w-12 h-12 object-cover rounded-lg"
 />
 <div>
 <p className="font-medium text-gray-900">{item.title}</p>
 <p className="text-sm text-gray-500">Quantité: {item.quantity}</p>
 </div>
 </div>
 <p className="font-medium text-gray-900">
 {item.totalPrice.toFixed(2)} €
 </p>
 </div>
 ))}
 </div>
 </div>

 {/* Total et actions */}
 <div className="flex items-center justify-between pt-4 border-t border-gray-200">
 <div className="text-right">
 <p className="text-sm text-gray-600">Total de la commande</p>
 <p className="text-2xl font-bold text-gray-900">{order.totals.total.toFixed(2)} €</p>
 <div className="text-xs text-gray-500 space-y-1">
 <p>Sous-total: {order.totals.subtotal.toFixed(2)} €</p>
 <p>Livraison: {order.totals.deliveryFee.toFixed(2)} €</p>
 <p>Taxes: {order.totals.taxes.toFixed(2)} €</p>
 {order.totals.discounts > 0 && (
 <p>Réductions: -{order.totals.discounts.toFixed(2)} €</p>
 )}
 </div>
 </div>
 
 <div className="flex items-center space-x-3">
 <select
 value={order.status}
 onChange={(e) => updateOrderStatus(order._id, e.target.value)}
 className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
 >
 <option value="pending">En attente</option>
 <option value="confirmed">Confirmée</option>
 <option value="preparing">En préparation</option>
 <option value="out_for_delivery">En livraison</option>
 <option value="delivered">Livrée</option>
 <option value="cancelled">Annulée</option>
 </select>
 
 <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
 Voir détails
 </button>
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
