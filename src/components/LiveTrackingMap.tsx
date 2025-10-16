'use client'

import { useEffect, useRef, useState } from 'react'
import { useGoogleMapsAdvanced } from '@/hooks/useGoogleMapsAdvanced'
import { FiClock, FiMap, FiMapPin, FiNavigation, FiPackage, FiUser } from 'react-icons/fi'


interface LiveTrackingMapProps {
 orderId: string
 customerAddress: {
 street: string
 city: string
 postalCode: string
 country: string
 }
 onRouteCalculated?: (route: google.maps.DirectionsResult) => void
 className?: string
}

interface TrackingData {
 order: {
 id: string
 orderNumber: string
 status: string
 deliveryStatus: string
 }
 driver: {
 id: string
 name: string
 phone: string
 vehicleType: string
 rating: number
 } | null
 currentLocation: {
 lat: number
 lng: number
 address: string
 updatedAt: string
 } | null
 estimatedTimeRemaining: number | null
 trackingHistory: Array<{
 status: string
 timestamp: string
 notes: string
 location?: {
 lat: number
 lng: number
 address: string
 }
 }>
}

export default function LiveTrackingMap({ 
 orderId, 
 customerAddress, 
 onRouteCalculated,
 className = '' 
}: LiveTrackingMapProps) {
 const mapContainerRef = useRef<HTMLDivElement>(null)
 const {
 isLoaded,
 error,
 map,
 initializeMap,
 calculateRoute,
 geocodeAddress,
 addMarker,
 updateMarker,
 addRealTimeTracking,
 stopRealTimeTracking,
 getCurrentLocation
 } = useGoogleMapsAdvanced()

 const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
 const [loading, setLoading] = useState(true)
 const [driverMarker, setDriverMarker] = useState<google.maps.Marker | null>(null)
 const [destinationMarker, setDestinationMarker] = useState<google.maps.Marker | null>(null)
 const [route, setRoute] = useState<google.maps.DirectionsResult | null>(null)
 const [isTracking, setIsTracking] = useState(false)

 // Charger les données de suivi
 useEffect(() => {
 if (!isLoaded) return

 const fetchTrackingData = async () => {
 try {
 const token = localStorage.getItem('token')
 if (!token) return

 const response = await fetch(`/api/orders/${orderId}/tracking`, {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 setTrackingData(data.tracking)
 
 // Initialiser la carte si on a une localisation
 if (data.tracking.currentLocation && mapContainerRef.current) {
 initializeTrackingMap(data.tracking)
 }
 }
 } catch (err) {
 console.error('Erreur lors du chargement des données de suivi:', err)
 } finally {
 setLoading(false)
 }
 }

 fetchTrackingData()
 }, [isLoaded, orderId, initializeMap])

 // Initialiser la carte de suivi
 const initializeTrackingMap = async (tracking: TrackingData) => {
 if (!mapContainerRef.current || !tracking.currentLocation) return

 // Initialiser la carte centrée sur la position du livreur
 const mapInstance = initializeMap(mapContainerRef.current, {
 center: {
 lat: tracking.currentLocation.lat,
 lng: tracking.currentLocation.lng
 },
 zoom: 15,
 mapTypeControl: false,
 streetViewControl: false,
 fullscreenControl: false
 })

 if (!mapInstance) return

 // Géocoder l'adresse de destination
 const destinationAddress = `${customerAddress.street}, ${customerAddress.city} ${customerAddress.postalCode}`
 const destinationCoords = await geocodeAddress(destinationAddress)

 if (destinationCoords) {
 // Ajouter le marqueur de destination
 const destMarker = addMarker(destinationCoords, {
 title: 'Destination',
 icon: {
 url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
 <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
 <circle cx="16" cy="16" r="12" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
 <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold"></text>
 </svg>
 `),
 scaledSize: new google.maps.Size(32, 32)
 }
 })
 setDestinationMarker(destMarker)

 // Ajouter le marqueur du livreur
 const driverMarker = addMarker({
 lat: tracking.currentLocation.lat,
 lng: tracking.currentLocation.lng
 }, {
 title: tracking.driver?.name || 'Livreur',
 icon: {
 url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
 <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
 <circle cx="16" cy="16" r="12" fill="#22c55e" stroke="#ffffff" stroke-width="3"/>
 <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold"></text>
 </svg>
 `),
 scaledSize: new google.maps.Size(32, 32)
 }
 })
 setDriverMarker(driverMarker)

 // Calculer l'itinéraire
 const routeResult = await calculateRoute(
 {
 lat: tracking.currentLocation.lat,
 lng: tracking.currentLocation.lng
 },
 destinationCoords
 )

 if (routeResult) {
 setRoute(routeResult)
 onRouteCalculated?.(routeResult)
 }

 // Démarrer le suivi en temps réel
 startRealTimeTracking()
 }
 }

 // Démarrer le suivi en temps réel
 const startRealTimeTracking = () => {
 if (isTracking) return

 setIsTracking(true)
 addRealTimeTracking(orderId, orderId, (location) => {
 // Mettre à jour la position du marqueur du livreur
 if (driverMarker) {
 updateMarker(driverMarker, location)
 }

 // Centrer la carte sur la nouvelle position
 if (map) {
 map.setCenter(location)
 }

 // Recalculer l'itinéraire si nécessaire
 if (destinationMarker) {
 const destPosition = destinationMarker.getPosition()
 if (destPosition) {
 calculateRoute(
 location,
 {
 lat: destPosition.lat(),
 lng: destPosition.lng()
 }
 )
 }
 }
 })
 }

 // Arrêter le suivi en temps réel
 useEffect(() => {
 return () => {
 stopRealTimeTracking()
 }
 }, [stopRealTimeTracking])

 if (loading) {
 return (
 <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Chargement de la carte...</p>
 </div>
 </div>
 )
 }

 if (error) {
 return (
 <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
 <div className="text-center">
 <FiMap className="w-12 h-12 text-red-500 mx-auto mb-4" />
 <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de carte</h3>
 <p className="text-red-600">{error}</p>
 </div>
 </div>
 )
 }

 if (!trackingData) {
 return (
 <div className={`bg-gray-100 rounded-lg p-6 ${className}`}>
 <div className="text-center">
 <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-600">Aucune donnée de suivi disponible</p>
 </div>
 </div>
 )
 }

 return (
 <div className={`space-y-4 ${className}`}>
 {/* Informations du livreur */}
 {trackingData.driver && (
 <div className="bg-white rounded-lg p-4 border border-gray-200">
 <div className="flex items-center space-x-3">
 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
 <FiUser className="w-6 h-6 text-green-600" />
 </div>
 <div className="flex-1">
 <h3 className="font-semibold text-gray-900">{trackingData.driver.name}</h3>
 <p className="text-sm text-gray-600">
 {trackingData.driver.vehicleType} • Note: {trackingData.driver.rating}/5
 </p>
 </div>
 <div className="text-right">
 <p className="text-sm text-gray-500">Livreur assigné</p>
 {trackingData.estimatedTimeRemaining && (
 <p className="text-lg font-semibold text-green-600">
 {trackingData.estimatedTimeRemaining} min
 </p>
 )}
 </div>
 </div>
 </div>
 )}

 {/* Carte */}
 <div className="relative">
 <div 
 ref={mapContainerRef}
 className="w-full h-96 rounded-lg border border-gray-200"
 />
 
 {/* Indicateur de statut */}
 <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
 <div className="flex items-center space-x-2">
 <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
 <span className="text-sm font-medium text-gray-700">
 {isTracking ? 'Suivi en cours' : 'Suivi arrêté'}
 </span>
 </div>
 </div>
 </div>

 {/* Informations de livraison */}
 <div className="bg-white rounded-lg p-4 border border-gray-200">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="flex items-center space-x-3">
 <FiMapPin className="w-5 h-5 text-red-500" />
 <div>
 <p className="text-sm font-medium text-gray-900">Destination</p>
 <p className="text-sm text-gray-600">
 {customerAddress.street}, {customerAddress.city}
 </p>
 </div>
 </div>
 
 <div className="flex items-center space-x-3">
 <FiNavigation className="w-5 h-5 text-blue-500" />
 <div>
 <p className="text-sm font-medium text-gray-900">Statut</p>
 <p className="text-sm text-gray-600 capitalize">
 {trackingData.order.deliveryStatus.replace('_', ' ')}
 </p>
 </div>
 </div>
 
 <div className="flex items-center space-x-3">
 <FiClock className="w-5 h-5 text-orange-500" />
 <div>
 <p className="text-sm font-medium text-gray-900">Dernière mise à jour</p>
 <p className="text-sm text-gray-600">
 {trackingData.currentLocation 
 ? new Date(trackingData.currentLocation.updatedAt).toLocaleTimeString('fr-FR')
 : 'Non disponible'
 }
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
