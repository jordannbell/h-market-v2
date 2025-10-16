'use client'

import { useState, useEffect } from 'react'
import AvailableOrdersList from '@/components/AvailableOrdersList'
import DeliveryProgressModal from '@/components/DeliveryProgressModal'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { FiCheck, FiClock, FiDollarSign, FiMapPin, FiNavigation, FiPackage, FiRefreshCw, FiTruck, FiUser } from 'react-icons/fi'


interface MyDelivery {
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
 deliveryCode: string
 estimatedDeliveryTime?: string
 currentLocation?: {
 lat: number
 lng: number
 address: string
 updatedAt: string
 }
 createdAt: string
}

export default function LivreurCommandesPage() {
 const { user, token } = useAuth()
 const [myDeliveries, setMyDeliveries] = useState<MyDelivery[]>([])
 const [loading, setLoading] = useState(true)
 const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
 const [activeTab, setActiveTab] = useState<'available' | 'my-deliveries'>('available')
 const [selectedOrder, setSelectedOrder] = useState<MyDelivery | null>(null)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [hasActiveDelivery, setHasActiveDelivery] = useState(false)

 useEffect(() => {
 if (token) {
 fetchMyDeliveries()
 }
 }, [token])

 // Rafraîchir les données périodiquement si le modal est ouvert (seulement pour les notifications)
 useEffect(() => {
 if (isModalOpen && selectedOrder) {
 const interval = setInterval(() => {
 // Ne rafraîchir que si le modal est ouvert et qu'il n'y a pas d'action en cours
 if (!updatingStatus) {
 fetchMyDeliveries()
 }
 }, 10000) // Rafraîchir toutes les 10 secondes seulement
 
 return () => clearInterval(interval)
 }
 }, [isModalOpen, selectedOrder, updatingStatus])

 const fetchMyDeliveries = async () => {
 try {
 // Récupérer UNIQUEMENT les livraisons assignées au livreur connecté
 const response = await fetch('/api/delivery/my-deliveries', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 // Utiliser directement les livraisons assignées (déjà filtrées par l'API)
 setMyDeliveries(data.deliveries || [])
 
 // Vérifier s'il y a une livraison active (assignée au livreur)
 const activeDelivery = (data.deliveries || []).find((order: any) => 
 order.delivery?.status && ['assigned', 'picked_up', 'in_transit'].includes(order.delivery.status)
 )
 
 if (activeDelivery) {
 setHasActiveDelivery(true)
 // Si le modal est ouvert, mettre à jour la commande sélectionnée
 if (isModalOpen && selectedOrder && selectedOrder._id === activeDelivery._id) {
 setSelectedOrder(activeDelivery)
 } else if (!isModalOpen) {
 // Ouvrir automatiquement le modal s'il y a une livraison active
 setSelectedOrder(activeDelivery)
 setIsModalOpen(true)
 }
 } else {
 setHasActiveDelivery(false)
 // Ne jamais fermer automatiquement le modal - laisser l'utilisateur le fermer manuellement
 // Le modal ne se ferme que quand l'utilisateur clique sur "Fermer" dans le modal
 }
 } else {
 const errorData = await response.json()
 toast.error(errorData.error || 'Erreur lors du chargement des livraisons')
 }
 } catch (error) {
 console.error('Erreur lors du chargement des livraisons:', error)
 toast.error('Erreur lors du chargement des livraisons')
 } finally {
 setLoading(false)
 }
 }

 const acceptOrder = async (orderId: string) => {
 if (!orderId || orderId === 'undefined') {
 console.error('❌ Erreur: ID de commande invalide', orderId)
 toast.error('Erreur: ID de commande invalide')
 return
 }
 
 setUpdatingStatus(orderId)

 try {
 const response = await fetch('/api/delivery/accept', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 orderId: orderId
 })
 })

 const data = await response.json()

 if (response.ok) {
 toast.success('Commande acceptée avec succès!')
 // Mettre à jour immédiatement la commande sélectionnée
 if (selectedOrder) {
 setSelectedOrder({
 ...selectedOrder,
 delivery: {
 ...selectedOrder.delivery,
 status: 'assigned'
 }
 })
 }
 // Ne pas rafraîchir automatiquement pour éviter de fermer le modal
 // Le modal se met à jour déjà avec setSelectedOrder
 } else {
 toast.error(data.error || 'Erreur lors de l\'acceptation de la commande')
 }
 } catch (error) {
 console.error('Erreur lors de l\'acceptation de la commande:', error)
 toast.error('Erreur lors de l\'acceptation de la commande')
 } finally {
 setUpdatingStatus(null)
 }
 }

 const updateDeliveryStatus = async (orderId: string, newStatus: string) => {
   if (!orderId || orderId === 'undefined') {
     console.error('❌ Erreur: ID de commande invalide', orderId)
     toast.error('Erreur: ID de commande invalide')
     return
   }
   
   setUpdatingStatus(orderId)

   try {
     const response = await fetch(`/api/orders/${orderId}/tracking`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       },
       body: JSON.stringify({
         status: newStatus,
         notes: `Statut mis à jour vers: ${newStatus}`
       })
     })

     const data = await response.json()

     if (response.ok) {
       if (newStatus === 'delivered') {
         toast.success('🎉 Livraison terminée ! La commande disparaîtra de votre liste.')
       } else {
         toast.success('Statut mis à jour avec succès!')
       }
       
       // Mettre à jour immédiatement la commande sélectionnée
       if (selectedOrder) {
         setSelectedOrder({
           ...selectedOrder,
           delivery: {
             ...selectedOrder.delivery,
             status: newStatus
           }
         })
       }
       
       // Si la commande est livrée, rafraîchir la liste pour la faire disparaître
       if (newStatus === 'delivered') {
         setTimeout(() => {
           fetchMyDeliveries()
         }, 3000) // Rafraîchir après 3 secondes
       }
     } else {
       toast.error(data.error || 'Erreur lors de la mise à jour du statut')
     }
   } catch (error) {
     console.error('Erreur lors de la mise à jour du statut:', error)
     toast.error('Erreur lors de la mise à jour du statut')
   } finally {
     setUpdatingStatus(null)
   }
 }

 const openModal = (order: MyDelivery) => {
 setSelectedOrder(order)
 setIsModalOpen(true)
 }

 const closeModal = () => {
 setIsModalOpen(false)
 setSelectedOrder(null)
 setHasActiveDelivery(false)
 }

 const reopenModal = () => {
 if (selectedOrder) {
 setIsModalOpen(true)
 }
 }

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'assigned':
 return 'bg-blue-100 text-blue-800'
 case 'picked_up':
 return 'bg-orange-100 text-orange-800'
 case 'in_transit':
 return 'bg-green-100 text-green-800'
 case 'arrived':
 return 'bg-purple-100 text-purple-800'
 case 'delivered':
 return 'bg-gray-100 text-gray-800'
 default:
 return 'bg-gray-100 text-gray-800'
 }
 }

 const getStatusText = (status: string) => {
 switch (status) {
 case 'assigned':
 return 'Assignée'
 case 'picked_up':
 return 'Récupérée'
 case 'in_transit':
 return 'En route'
 case 'arrived':
 return 'Arrivé'
 case 'delivered':
 return 'Livrée'
 default:
 return status
 }
 }

 const getNextAction = (status: string) => {
 switch (status) {
 case 'assigned':
 return { action: 'picked_up', text: 'Marquer comme récupérée', icon: FiPackage }
 case 'picked_up':
 return { action: 'in_transit', text: 'Commencer la livraison', icon: FiTruck }
 case 'in_transit':
 return { action: 'arrived', text: 'Marquer comme arrivé', icon: FiMapPin }
 case 'arrived':
 return { action: 'delivered', text: 'Confirmer la livraison', icon: FiCheck }
 default:
 return null
 }
 }

 const handleOrderAccepted = (orderId: string) => {
 toast.success('Commande acceptée! Elle apparaîtra dans vos livraisons.')
 setActiveTab('my-deliveries')
 }

 if (loading) {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
 <p className="text-gray-600">Gérez vos livraisons et découvrez de nouvelles commandes</p>
 {hasActiveDelivery && (
 <div className="mt-2 flex items-center justify-between">
 <div className="flex items-center space-x-2 text-green-600">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
 <span className="text-sm font-medium">Livraison en cours...</span>
 </div>
 {!isModalOpen && (
 <button
 onClick={reopenModal}
 className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg transition-colors"
 >
 Ouvrir le suivi
 </button>
 )}
 </div>
 )}
 </div>
 
 <div className="mt-4 sm:mt-0">
 <button
 onClick={() => {
 if (activeTab === 'available') {
 // Rafraîchir les commandes disponibles
 window.location.reload()
 } else {
 fetchMyDeliveries()
 }
 }}
 className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
 >
 <FiRefreshCw className="w-4 h-4" />
 <span>Actualiser</span>
 </button>
 </div>
 </div>

 {/* Tabs */}
 <div className="border-b border-gray-200">
 <nav className="-mb-px flex space-x-8">
 <button
 onClick={() => setActiveTab('available')}
 className={`py-2 px-1 border-b-2 font-medium text-sm ${
 activeTab === 'available'
 ? 'border-green-500 text-green-600'
 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
 }`}
 >
 Commandes disponibles
 </button>
 <button
 onClick={() => setActiveTab('my-deliveries')}
 className={`py-2 px-1 border-b-2 font-medium text-sm ${
 activeTab === 'my-deliveries'
 ? 'border-green-500 text-green-600'
 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
 }`}
 >
 Mes livraisons ({myDeliveries.length})
 </button>
 </nav>
 </div>

 {/* Content */}
 {activeTab === 'available' ? (
 <AvailableOrdersList 
 onOrderAccepted={handleOrderAccepted}
 className="w-full"
 />
 ) : (
 <div className="space-y-4">
 {myDeliveries.length === 0 ? (
 <div className="bg-gray-50 rounded-lg p-8 text-center">
 <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune livraison en cours</h3>
 <p className="text-gray-600 mb-4">
 Toutes les commandes sont livrées ou aucune commande n'est en attente.
 </p>
 <button
 onClick={() => setActiveTab('available')}
 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
 >
 Voir les commandes disponibles
 </button>
 </div>
 ) : (
 myDeliveries.map((delivery) => {
 const nextAction = getNextAction(delivery.deliveryStatus)
 
 return (
 <div key={delivery._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
 {/* Header */}
 <div className="p-4 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
 delivery.deliveryStatus === 'assigned' 
 ? 'bg-blue-100' 
 : delivery.deliveryStatus === 'picked_up'
 ? 'bg-orange-100'
 : delivery.deliveryStatus === 'in_transit'
 ? 'bg-green-100'
 : 'bg-gray-100'
 }`}>
 <FiPackage className={`w-5 h-5 ${
 delivery.deliveryStatus === 'assigned' 
 ? 'text-blue-600' 
 : delivery.deliveryStatus === 'picked_up'
 ? 'text-orange-600'
 : delivery.deliveryStatus === 'in_transit'
 ? 'text-green-600'
 : 'text-gray-600'
 }`} />
 </div>
 <div>
 <h3 className="font-semibold text-gray-900">#{delivery.orderNumber}</h3>
 <p className="text-sm text-gray-600">
 {new Date(delivery.createdAt).toLocaleString('fr-FR')}
 </p>
 </div>
 </div>
 <div className="flex flex-col items-end space-y-1">
 <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.deliveryStatus)}`}>
 {getStatusText(delivery.deliveryStatus)}
 </span>
 </div>
 </div>
 </div>
 
 {/* Content */}
 <div className="p-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 {/* Informations client */}
 <div className="space-y-3">
 <div className="flex items-center space-x-2">
 <FiUser className="w-4 h-4 text-gray-500" />
 <span className="text-sm font-medium text-gray-900">{delivery.customer.name}</span>
 </div>
 
 <div className="flex items-center space-x-2">
 <FiMapPin className="w-4 h-4 text-gray-500" />
 <span className="text-sm text-gray-600">
 {delivery.address.street}, {delivery.address.city}
 </span>
 </div>
 
 <div className="flex items-center space-x-2">
 <FiDollarSign className="w-4 h-4 text-gray-500" />
 <span className="text-sm font-medium text-gray-900">
 {delivery.totals.total.toFixed(2)} €
 </span>
 </div>
 </div>
 
 {/* Informations de livraison */}
 <div className="space-y-3">
 <div className="flex items-center space-x-2">
 <FiClock className="w-4 h-4 text-blue-500" />
 <span className="text-sm text-gray-600">
 Code de livraison: {delivery.deliveryCode}
 </span>
 </div>
 
 {delivery.estimatedDeliveryTime && (
 <div className="flex items-center space-x-2">
 <FiNavigation className="w-4 h-4 text-orange-500" />
 <span className="text-sm text-gray-600">
 Livraison prévue: {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString('fr-FR')}
 </span>
 </div>
 )}
 
 {delivery.currentLocation && (
 <div className="flex items-center space-x-2">
 <FiMapPin className="w-4 h-4 text-green-500" />
 <span className="text-sm text-gray-600">
 Dernière position: {delivery.currentLocation.address}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* Articles */}
 <div className="mb-4">
 <h4 className="text-sm font-medium text-gray-900 mb-2">Articles à livrer:</h4>
 <div className="space-y-1">
 {delivery.items.slice(0, 3).map((item, index) => (
 <div key={index} className="flex items-center justify-between text-sm">
 <span className="text-gray-600">{item.title} x{item.quantity}</span>
 <span className="text-gray-900 font-medium">{item.totalPrice.toFixed(2)} €</span>
 </div>
 ))}
 {delivery.items.length > 3 && (
 <p className="text-xs text-gray-500">+{delivery.items.length - 3} autres articles</p>
 )}
 </div>
 </div>
 
 {/* Actions */}
 <div className="flex items-center space-x-3">
 {delivery.deliveryStatus === 'assigned' ? (
 <button
 onClick={() => openModal(delivery)}
 className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
 >
 <FiPackage className="w-4 h-4" />
 <span>Gérer cette livraison</span>
 </button>
 ) : delivery.deliveryStatus === 'picked_up' || delivery.deliveryStatus === 'in_transit' ? (
 <button
 onClick={() => openModal(delivery)}
 className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
 >
 <FiTruck className="w-4 h-4" />
 <span>Suivre la livraison</span>
 </button>
 ) : (
 <div className="flex-1 text-center text-gray-500 text-sm">
 {delivery.deliveryStatus === 'delivered' 
 ? 'Livraison terminée' 
 : 'En cours de traitement...'
 }
 </div>
 )}
 </div>
 </div>
 </div>
 )
 })
 )}
 </div>
 )}

 {/* Modal de progression de livraison */}
 {selectedOrder && (
 <DeliveryProgressModal
 isOpen={isModalOpen}
 onClose={closeModal}
 order={selectedOrder}
 onAccept={acceptOrder}
 onUpdateStatus={updateDeliveryStatus}
 isUpdating={updatingStatus === selectedOrder._id}
 />
 )}
 </div>
 )
}