'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import LiveTrackingMap from '@/components/LiveTrackingMap'
import { FiBell, FiCheck, FiClock, FiHome, FiMapPin, FiMaximize2, FiMinimize2, FiPackage, FiTruck, FiUser } from 'react-icons/fi'


interface OrderTracking {
 id: string
 orderNumber: string
 status: string
 delivery: {
 status: string
 assignedDriverId?: string
 currentLocation?: {
 lat: number
 lng: number
 address: string
 updatedAt: string
 }
 deliveryCode: string
 estimatedDeliveryTime?: string
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
 address: {
 street: string
 city: string
 postalCode: string
 country: string
 }
 payment?: {
 status: string
 }
}

function CommandeConfirmeePageContent() {
 const router = useRouter()
 const searchParams = useSearchParams()
 const { user, isAuthenticated, loading: authLoading } = useAuth()
 const { isLoaded: isGoogleMapsLoaded, error: googleMapsError } = useGoogleMaps()
 
 const [order, setOrder] = useState<OrderTracking | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null)
 const [isMapExpanded, setIsMapExpanded] = useState(false)
 const [mapLoaded, setMapLoaded] = useState(false)
 const [notifications, setNotifications] = useState<string[]>([])
 const [driverAssigned, setDriverAssigned] = useState(false)

 const orderId = searchParams.get('orderId')

 useEffect(() => {
 if (authLoading) return
 
 if (!isAuthenticated) {
 router.push('/auth/login?redirect=/commande-confirmee')
 return
 }

 if (!orderId) {
 // Si pas d'ID, afficher un message d'erreur plus clair
 setError('Aucune commande à suivre. Retournez à votre panier pour commander.')
 setLoading(false)
 return
 }

 // Charger les détails de la commande
 fetchOrderDetails()
 
 // Démarrer le suivi en temps réel
 startTracking()
 
 return () => {
 if (trackingInterval) {
 clearInterval(trackingInterval)
 }
 }
 }, [isAuthenticated, orderId, authLoading])

 const fetchOrderDetails = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) {
 throw new Error('Token d\'authentification manquant')
 }

 const response = await fetch(`/api/orders/${orderId}`, {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const result = await response.json()
 const newOrder = result.order
 
 // Vérifier les changements de statut pour les notifications
 checkStatusChanges(order, newOrder)
 
 setOrder(newOrder)
 } else {
 throw new Error('Commande non trouvée')
 }
 } catch (error: unknown) {
 setError(error.message || 'Erreur lors du chargement de la commande')
 } finally {
 setLoading(false)
 }
 }

 const startTracking = () => {
 // Mettre à jour la position toutes les 15 secondes pour un suivi plus réactif
 const interval = setInterval(() => {
 if (order) {
 fetchOrderDetails()
 // Rafraîchir la carte après la mise à jour si en livraison
 if (order.delivery.status === 'in_transit') {
 setTimeout(() => {
 if (mapLoaded && order?.delivery?.currentLocation) {
 renderMap('driver-map', isMapExpanded)
 renderMap('driver-map-main', isMapExpanded)
 }
 }, 500)
 }
 }
 }, 15000)
 
 setTrackingInterval(interval)
 }

 // Vérifier les changements de statut pour les notifications
 const checkStatusChanges = (oldOrder: OrderTracking | null, newOrder: OrderTracking | null) => {
 if (!oldOrder || !newOrder) return

 // Notification quand un livreur est assigné
 if (!oldOrder.delivery.assignedDriverId && newOrder.delivery.assignedDriverId) {
 const notification = ' Un livreur a été assigné à votre commande !'
 setNotifications(prev => [...prev, notification])
 setDriverAssigned(true)
 toast.success(notification)
 
 // Supprimer la notification après 5 secondes
 setTimeout(() => {
 setNotifications(prev => prev.filter(n => n !== notification))
 }, 5000)
 }

 // Notification quand la commande est récupérée
 if (oldOrder.delivery.status !== 'picked_up' && newOrder.delivery.status === 'picked_up') {
 const notification = ' Votre commande a été récupérée par le livreur !'
 setNotifications(prev => [...prev, notification])
 toast.success(notification)
 
 setTimeout(() => {
 setNotifications(prev => prev.filter(n => n !== notification))
 }, 5000)
 }

 // Notification quand la livraison commence
 if (oldOrder.delivery.status !== 'in_transit' && newOrder.delivery.status === 'in_transit') {
 const notification = ' Votre commande est en route ! Suivez en temps réel'
 setNotifications(prev => [...prev, notification])
 toast.success(notification)
 
 setTimeout(() => {
 setNotifications(prev => prev.filter(n => n !== notification))
 }, 5000)
 }

 // Notification quand la livraison est terminée
 if (oldOrder.delivery.status !== 'delivered' && newOrder.delivery.status === 'delivered') {
 const notification = ' Votre commande a été livrée !'
 setNotifications(prev => [...prev, notification])
 toast.success(notification)
 
 setTimeout(() => {
 setNotifications(prev => prev.filter(n => n !== notification))
 }, 5000)
 }
 }

 // Utiliser le hook useGoogleMaps pour charger Google Maps
 useEffect(() => {
 if (isGoogleMapsLoaded) {
 setMapLoaded(true)
 }
 }, [isGoogleMapsLoaded])

 // Rendre la carte quand elle est chargée et que la commande est mise à jour
 useEffect(() => {
 if (mapLoaded && order?.delivery?.currentLocation) {
 // Petit délai pour s'assurer que le DOM est prêt
 setTimeout(() => {
 renderMap('driver-map', isMapExpanded)
 renderMap('driver-map-main', isMapExpanded)
 }, 100)
 }
 }, [mapLoaded, order?.delivery?.currentLocation, isMapExpanded])

 // Fonction pour afficher la carte
 const renderMap = (containerId: string, isExpanded: boolean = false) => {
 if (!mapLoaded || !order?.delivery?.currentLocation) return null
 if (googleMapsError || !window.google) {
 // Afficher un message d'erreur à la place de la carte
 const mapContainer = document.getElementById(containerId)
 if (mapContainer) {
 mapContainer.innerHTML = `
 <div class="h-full flex items-center justify-center bg-gray-100">
 <div class="text-center p-4">
 <div class="text-gray-400 text-4xl mb-2">️</div>
 <p class="text-sm text-gray-500">Carte non disponible</p>
 <p class="text-xs text-gray-400 mt-1">Position: ${order.delivery.currentLocation.address}</p>
 </div>
 </div>
 `
 }
 return null
 }

 const mapContainer = document.getElementById(containerId)
 if (!mapContainer) return null

 const driverLocation = order.delivery.currentLocation
 const customerAddress = order.address

 const map = new google.maps.Map(mapContainer, {
 center: { lat: driverLocation.lat, lng: driverLocation.lng },
 zoom: isExpanded ? 14 : 12,
 styles: [
 {
 featureType: 'poi',
 elementType: 'labels',
 stylers: [{ visibility: 'off' }]
 }
 ]
 })

 // Marqueur du livreur
 new google.maps.Marker({
 position: { lat: driverLocation.lat, lng: driverLocation.lng },
 map: map,
 title: 'Position du livreur',
 icon: {
 url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
 <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
 <circle cx="16" cy="16" r="16" fill="#10B981"/>
 <path d="M16 8L20 16L16 24L12 16L16 8Z" fill="white"/>
 </svg>
 `),
 scaledSize: new google.maps.Size(32, 32)
 }
 })

 // Marqueur de l'adresse de livraison
 if (customerAddress) {
 // Géocoder l'adresse pour obtenir les coordonnées
 const geocoder = new google.maps.Geocoder()
 geocoder.geocode({ address: `${customerAddress.street}, ${customerAddress.postalCode} ${customerAddress.city}` }, (results, status) => {
 if (status === 'OK' && results && results[0]) {
 const location = results[0].geometry.location
 new google.maps.Marker({
 position: location,
 map: map,
 title: 'Adresse de livraison',
 icon: {
 url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#EF4444"/>
 </svg>
 `),
 scaledSize: new google.maps.Size(24, 24)
 }
 })

 // Ajuster la vue pour inclure les deux marqueurs
 const bounds = new google.maps.LatLngBounds()
 bounds.extend({ lat: driverLocation.lat, lng: driverLocation.lng })
 bounds.extend(location)
 map.fitBounds(bounds)
 }
 })
 }
 }

 const getStepIcon = (step: string) => {
 switch (step) {
 case 'preparation':
 return <FiPackage className="w-6 h-6" />
 case 'in_transit':
 return <FiTruck className="w-6 h-6" />
 case 'delivery':
 return <FiHome className="w-6 h-6" />
 case 'completed':
 return <FiCheck className="w-6 h-6" />
 default:
 return <FiClock className="w-6 h-6" />
 }
 }

 const getStepLabel = (step: string) => {
 switch (step) {
 case 'preparation':
 return 'Préparation de la commande'
 case 'in_transit':
 return 'En cours de livraison'
 case 'delivery':
 return 'Votre livreur arrive'
 case 'completed':
 return 'Livraison terminée'
 default:
 return 'En attente'
 }
 }

 const getStepDescription = (step: string) => {
 switch (step) {
 case 'preparation':
 return 'Votre commande est en cours de préparation dans nos cuisines'
 case 'in_transit':
 return 'Votre commande est en route vers vous. Suivez en temps réel !'
 case 'delivery':
 return 'Votre livreur est presque arrivé. Préparez le code de livraison !'
 case 'completed':
 return 'Votre commande a été livrée avec succès !'
 default:
 return 'Votre commande est en cours de traitement'
 }
 }

 // Fonctions helper pour les anciennes commandes sans orderProgress
 const getStepCompletion = (status: string, step: string) => {
 switch (status) {
 case 'pending':
 return false
 case 'confirmed':
 case 'preparing':
 return step === 'preparation'
 case 'out_for_delivery':
 return step === 'preparation' || step === 'in_transit'
 case 'delivered':
 return step === 'preparation' || step === 'in_transit' || step === 'delivery'
 default:
 return false
 }
 }

 const getStepCurrent = (status: string, step: string) => {
 switch (status) {
 case 'pending':
 return step === 'preparation'
 case 'confirmed':
 case 'preparing':
 return step === 'preparation'
 case 'out_for_delivery':
 return step === 'in_transit'
 case 'delivered':
 return step === 'delivery'
 default:
 return step === 'preparation'
 }
 }

 const getProgressPercentage = (order: any) => {
 // Vérifier si orderProgress existe, sinon calculer basé sur le statut
 if (order.orderProgress && order.orderProgress.currentStep && order.orderProgress.totalSteps) {
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

 // Note: On continue même si Google Maps n'est pas disponible
 // Les cartes seront simplement désactivées

 if (loading) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Chargement de votre commande...</p>
 </div>
 </div>
 )
 }

 if (error || !order) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <div className="text-red-500 text-6xl mb-4"></div>
 <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
 <p className="text-gray-600 mb-6">{error || 'Commande non trouvée'}</p>
 <div className="space-y-3">
 <Link
 href="/panier"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold block"
 >
 Retour au panier
 </Link>
 <Link
 href="/"
 className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold block"
 >
 Retour à l'accueil
 </Link>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-green-50">
 <Navigation showSearch={false} />
 
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header de confirmation */}
 <div className="text-center mb-8">
 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
 <FiCheck className="w-10 h-10 text-green-600" />
 </div>
 <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande confirmée !</h1>
 <p className="text-gray-600">
 Votre commande #{order.orderNumber} a été confirmée et est en cours de traitement
 </p>
 </div>

 {/* Notifications en temps réel */}
 {notifications.length > 0 && (
 <div className="mb-6">
 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
 <div className="flex items-center space-x-2 mb-2">
 <FiBell className="w-5 h-5 text-blue-600" />
 <h3 className="text-sm font-medium text-blue-800">Notifications en temps réel</h3>
 </div>
 <div className="space-y-2">
 {notifications.map((notification, index) => (
 <div key={index} className="text-sm text-blue-700 bg-blue-100 rounded-lg px-3 py-2">
 {notification}
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* Notification spéciale pour livreur assigné */}
 {driverAssigned && (
 <div className="mb-6">
 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
 <div className="flex items-center space-x-2">
 <FiTruck className="w-5 h-5 text-green-600" />
 <div>
 <h3 className="text-sm font-medium text-green-800">Livreur assigné !</h3>
 <p className="text-sm text-green-700">
 Un livreur a été assigné à votre commande. Vous recevrez des mises à jour en temps réel.
 </p>
 </div>
 </div>
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Suivi de la commande */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
 <FiTruck className="w-5 h-5 mr-2 text-green-600" />
 Suivi de votre commande
 </h2>
 
 {/* Barre de progression */}
 <div className="mb-6">
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-medium text-gray-700">
 {order.orderProgress ? 
 `Étape ${order.orderProgress.currentStep} sur ${order.orderProgress.totalSteps}` :
 `Statut: ${getStatusLabel(order.status)}`
 }
 </span>
 <span className="text-sm text-gray-500">
 {order.orderProgress ? 
 `${Math.round((order.orderProgress.currentStep / order.orderProgress.totalSteps) * 100)}%` :
 `${getProgressPercentage(order)}%`
 }
 </span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2">
 <div 
 className="bg-green-600 h-2 rounded-full transition-all duration-500"
 style={{ width: `${order.orderProgress ? 
 (order.orderProgress.currentStep / order.orderProgress.totalSteps) * 100 : 
 getProgressPercentage(order)
 }%` }}
 ></div>
 </div>
 </div>

 {/* Étapes du suivi */}
 <div className="space-y-6">
 {['preparation', 'in_transit', 'delivery'].map((step, index) => {
 // Vérifier si orderProgress existe, sinon calculer basé sur le statut
 const isActive = order.orderProgress ? order.orderProgress.step === step : false
 const isCompleted = order.orderProgress ? order.orderProgress.currentStep > index + 1 : getStepCompletion(order.status, step)
 const isCurrent = order.orderProgress ? order.orderProgress.currentStep === index + 1 : getStepCurrent(order.status, step)
 
 return (
 <div key={step} className={`flex items-start space-x-4 ${isCompleted ? 'opacity-100' : 'opacity-60'}`}>
 <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
 isCompleted ? 'bg-green-100 text-green-600' :
 isCurrent ? 'bg-blue-100 text-blue-600' :
 'bg-gray-100 text-gray-400'
 }`}>
 {getStepIcon(step)}
 </div>
 <div className="flex-1">
 <h3 className={`font-medium ${
 isCompleted ? 'text-green-900' :
 isCurrent ? 'text-blue-900' :
 'text-gray-500'
 }`}>
 {getStepLabel(step)}
 </h3>
 <p className="text-sm text-gray-600 mt-1">
 {getStepDescription(step)}
 </p>
 {isCurrent && step === 'in_transit' && order.delivery.currentLocation && (
 <div className="mt-3 p-3 bg-blue-50 rounded-lg">
 <p className="text-sm text-blue-800">
 Position actuelle : {order.delivery.currentLocation.address}
 </p>
 <p className="text-xs text-blue-600 mt-1">
 Dernière mise à jour : {new Date(order.delivery.currentLocation.updatedAt).toLocaleTimeString('fr-FR')}
 </p>
 
 {/* Suivi en temps réel avec notre nouveau composant */}
 <div className="mt-3">
 <LiveTrackingMap
 orderId={order.id}
 customerAddress={order.address}
 className="w-full"
 onRouteCalculated={(route) => {
 console.log('Itinéraire calculé:', route)
 }}
 />
 </div>
 </div>
 )}
 {isCurrent && step === 'delivery' && (
 <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
 <p className="text-sm text-yellow-800">
 Code de livraison : <span className="font-mono font-bold text-lg">{order.delivery.deliveryCode}</span>
 </p>
 <p className="text-xs text-yellow-600 mt-1">
 Remettez ce code au livreur pour confirmer la réception
 </p>
 </div>
 )}
 </div>
 </div>
 )
 })}
 </div>
 </div>

 {/* Détails de la commande */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
 <FiPackage className="w-5 h-5 mr-2 text-green-600" />
 Détails de votre commande
 </h2>
 
 <div className="space-y-4">
 {order.items.map((item, index) => (
 <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
 <div>
 <p className="font-medium text-gray-900">{item.title}</p>
 <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
 </div>
 <span className="font-medium text-gray-900">{item.totalPrice.toFixed(2)} €</span>
 </div>
 ))}
 </div>
 
 <div className="mt-4 pt-4 border-t border-gray-200">
 <div className="flex justify-between text-lg font-bold text-gray-900">
 <span>Total</span>
 <span>{order.totals.total.toFixed(2)} €</span>
 </div>
 </div>
 </div>
 </div>

 {/* Informations de livraison */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
 <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de livraison</h2>
 
 {/* Adresse */}
 <div className="mb-6">
 <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
 <FiMapPin className="w-4 h-4 mr-2 text-green-600" />
 Adresse de livraison
 </h3>
 <div className="text-sm text-gray-600 space-y-1">
 <p>{order.address.street}</p>
 <p>{order.address.postalCode} {order.address.city}</p>
 <p>{order.address.country}</p>
 </div>
 </div>

 {/* Statut */}
 <div className="mb-6">
 <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
 <FiClock className="w-4 h-4 mr-2 text-green-600" />
 Statut actuel
 </h3>
 <div className="text-sm text-gray-600">
 <p className="font-medium">
 {order.orderProgress ? 
 getStepLabel(order.orderProgress.step) : 
 getStatusLabel(order.status)
 }
 </p>
 {order.delivery.estimatedDeliveryTime && (
 <p className="text-xs text-gray-500 mt-1">
 Livraison estimée : {new Date(order.delivery.estimatedDeliveryTime).toLocaleString('fr-FR')}
 </p>
 )}
 </div>
 </div>

 {/* Code de livraison */}
 {order.delivery.status === 'in_transit' && (
 <div className="mb-6">
 <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
 <FiUser className="w-4 h-4 mr-2 text-green-600" />
 Code de livraison
 </h3>
 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
 <p className="text-center font-mono font-bold text-2xl text-yellow-800">
 {order.delivery.deliveryCode}
 </p>
 <p className="text-xs text-yellow-600 text-center mt-2">
 Remettez ce code au livreur
 </p>
 </div>
 </div>
 )}

 {/* Mini carte du livreur */}
 {order.delivery.status === 'in_transit' && order.delivery.currentLocation && (
 <div className="mb-6">
 <div className="flex items-center justify-between mb-3">
 <h3 className="text-sm font-medium text-gray-900 flex items-center">
 <FiTruck className="w-4 h-4 mr-2 text-green-600" />
 Position du livreur
 </h3>
 <button
 onClick={() => setIsMapExpanded(!isMapExpanded)}
 className="text-green-600 hover:text-green-700 p-1 rounded"
 title={isMapExpanded ? "Réduire la carte" : "Agrandir la carte"}
 >
 {isMapExpanded ? <FiMinimize2 className="w-4 h-4" /> : <FiMaximize2 className="w-4 h-4" />}
 </button>
 </div>
 
 <div 
 id="driver-map"
 className={`bg-gray-100 rounded-lg overflow-hidden transition-all duration-300 ${
 isMapExpanded ? 'h-80' : 'h-32'
 }`}
 >
 {!mapLoaded && !googleMapsError && (
 <div className="h-full flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
 <p className="text-xs text-gray-500">Chargement de la carte...</p>
 </div>
 </div>
 )}
 {googleMapsError && (
 <div className="h-full flex items-center justify-center bg-gray-100">
 <div className="text-center p-4">
 <div className="text-gray-400 text-4xl mb-2">️</div>
 <p className="text-sm text-gray-500">Carte non disponible</p>
 <p className="text-xs text-gray-400 mt-1">Position: {order.delivery.currentLocation.address}</p>
 </div>
 </div>
 )}
 </div>
 
 {order.delivery.currentLocation && (
 <div className="mt-2 text-xs text-gray-500 text-center">
 <p> {order.delivery.currentLocation.address}</p>
 <p>Dernière mise à jour : {new Date(order.delivery.currentLocation.updatedAt).toLocaleTimeString('fr-FR')}</p>
 </div>
 )}
 </div>
 )}

 {/* Actions */}
 <div className="space-y-3">
 <Link
 href="/"
 className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold text-center block"
 >
 Continuer mes achats
 </Link>
 <Link
 href={`/paiement/${order.id}`}
 className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold text-center block"
 >
 Voir les détails
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}

export default function CommandeConfirmeePage() {
 return (
 <Suspense fallback={<div>Chargement...</div>}>
 <CommandeConfirmeePageContent />
 </Suspense>
 )
}
