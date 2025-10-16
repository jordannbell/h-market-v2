'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useGoogleMaps } from '@/hooks/useGoogleMaps'
import { FiAlertCircle, FiMapPin, FiNavigation, FiPhone, FiUser } from 'react-icons/fi'


interface DeliveryLocation {
 latitude: number
 longitude: number
 address: string
 customerName: string
 customerPhone: string
}

export default function LivreurTrajet() {
 const { token } = useAuth()
 const { isLoaded: isGoogleMapsLoaded, error: googleMapsError } = useGoogleMaps()
 const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
 const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([])
 const [loading, setLoading] = useState(true)
 const [watchingLocation, setWatchingLocation] = useState(false)
 const mapRef = useRef<HTMLDivElement>(null)
 const mapInstanceRef = useRef<any>(null)
 const markersRef = useRef<any[]>([])

 useEffect(() => {
 if (isGoogleMapsLoaded) {
 initializeMap()
 fetchDeliveryLocations()
 startLocationTracking()
 }
 }, [isGoogleMapsLoaded])

 const initializeMap = () => {
 if (!mapRef.current || !isGoogleMapsLoaded) return

 const defaultLocation = { lat: 48.8566, lng: 2.3522 } // Paris
 const map = new window.google.maps.Map(mapRef.current, {
 center: currentLocation || defaultLocation,
 zoom: 13,
 styles: [
 {
 featureType: 'poi',
 elementType: 'labels',
 stylers: [{ visibility: 'off' }]
 }
 ]
 })

 mapInstanceRef.current = map
 updateMapMarkers()
 }

 const updateMapMarkers = () => {
 if (!mapInstanceRef.current) return

 // Nettoyer les marqueurs existants
 markersRef.current.forEach(marker => marker.setMap(null))
 markersRef.current = []

 // Ajouter le marqueur de position actuelle
 if (currentLocation) {
 const currentMarker = new window.google.maps.Marker({
 position: currentLocation,
 map: mapInstanceRef.current,
 title: 'Votre position',
 icon: {
 url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
 <circle cx="12" cy="12" r="3" fill="white"/>
 </svg>
 `),
 scaledSize: new window.google.maps.Size(24, 24),
 anchor: new window.google.maps.Point(12, 12)
 }
 })
 markersRef.current.push(currentMarker)
 }

 // Ajouter les marqueurs de livraison
 deliveryLocations.forEach((location, index) => {
 const deliveryMarker = new window.google.maps.Marker({
 position: { lat: location.latitude, lng: location.longitude },
 map: mapInstanceRef.current,
 title: `Livraison ${index + 1}`,
 icon: {
 url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
 <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EF4444"/>
 <circle cx="12" cy="9" r="2.5" fill="white"/>
 </svg>
 `),
 scaledSize: new window.google.maps.Size(24, 24),
 anchor: new window.google.maps.Point(12, 12)
 }
 })

 // Info window pour chaque marqueur
 const infoWindow = new window.google.maps.InfoWindow({
 content: `
 <div class="p-3">
 <h3 class="font-semibold text-gray-900">Livraison ${index + 1}</h3>
 <p class="text-sm text-gray-600">${location.customerName}</p>
 <p class="text-sm text-gray-500">${location.address}</p>
 <p class="text-sm text-gray-500">${location.customerPhone}</p>
 </div>
 `
 })

 deliveryMarker.addListener('click', () => {
 infoWindow.open(mapInstanceRef.current, deliveryMarker)
 })

 markersRef.current.push(deliveryMarker)
 })

 // Ajuster la vue pour inclure tous les marqueurs
 if (markersRef.current.length > 0) {
 const bounds = new window.google.maps.LatLngBounds()
 markersRef.current.forEach(marker => {
 bounds.extend(marker.getPosition())
 })
 mapInstanceRef.current.fitBounds(bounds)
 }
 }

 const fetchDeliveryLocations = async () => {
 try {
 const response = await fetch('/api/delivery/my-deliveries', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })
 
 if (response.ok) {
 const data = await response.json()
 const locations = data.orders?.map((order: any) => ({
 latitude: order.address?.latitude || 48.8566,
 longitude: order.address?.longitude || 2.3522,
 address: `${order.address?.street}, ${order.address?.city}`,
 customerName: `${order.userId?.name?.first} ${order.userId?.name?.last}`,
 customerPhone: order.userId?.phone
 })) || []
 
 setDeliveryLocations(locations)
 }
 } catch (error) {
 console.error('Erreur lors de la récupération des adresses:', error)
 } finally {
 setLoading(false)
 }
 }

 const startLocationTracking = () => {
 if ('geolocation' in navigator) {
 setWatchingLocation(true)
 
 const watchId = navigator.geolocation.watchPosition(
 (position) => {
 const { latitude, longitude } = position.coords
 const newLocation = { lat: latitude, lng: longitude }
 
 setCurrentLocation(newLocation)
 
 // Mettre à jour la position sur le serveur
 updateLocationOnServer(latitude, longitude)
 
 // Centrer la carte sur la position actuelle
 if (mapInstanceRef.current) {
 mapInstanceRef.current.setCenter(newLocation)
 }
 
 updateMapMarkers()
 },
 (error) => {
 console.error('Erreur de géolocalisation:', error)
 setWatchingLocation(false)
 },
 {
 enableHighAccuracy: true,
 timeout: 10000,
 maximumAge: 30000
 }
 )

 return () => {
 navigator.geolocation.clearWatch(watchId)
 setWatchingLocation(false)
 }
 }
 }

 const updateLocationOnServer = async (latitude: number, longitude: number) => {
 try {
 await fetch('/api/livreur/update-location', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({ latitude, longitude })
 })
 } catch (error) {
 console.error('Erreur lors de la mise à jour de la position:', error)
 }
 }

 const getDirections = (destination: DeliveryLocation) => {
 if (!currentLocation || !window.google) return

 const directionsService = new window.google.maps.DirectionsService()
 const directionsRenderer = new window.google.maps.DirectionsRenderer({
 map: mapInstanceRef.current,
 suppressMarkers: true
 })

 directionsService.route(
 {
 origin: currentLocation,
 destination: { lat: destination.latitude, lng: destination.longitude },
 travelMode: window.google.maps.TravelMode.DRIVING
 },
 (result, status) => {
 if (status === 'OK') {
 directionsRenderer.setDirections(result)
 }
 }
 )
 }

 // Gestion des erreurs Google Maps
 if (googleMapsError) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-center">
 <div className="text-red-600 text-xl mb-2 flex items-center">
 <FiAlertCircle className="w-5 h-5 mr-2" />
 Erreur Google Maps
 </div>
 <div className="text-gray-600">{googleMapsError}</div>
 </div>
 </div>
 )
 }

 // Attendre le chargement de Google Maps
 if (!isGoogleMapsLoaded) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
 <div className="text-gray-600">Chargement de Google Maps...</div>
 </div>
 </div>
 )
 }

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Trajet</h1>
 <p className="text-gray-600">Suivi de vos livraisons en temps réel</p>
 </div>
 
 <div className="flex items-center space-x-2 mt-4 sm:mt-0">
 <div className={`w-3 h-3 rounded-full ${watchingLocation ? 'bg-green-500' : 'bg-gray-400'}`}></div>
 <span className="text-sm text-gray-600">
 {watchingLocation ? 'Suivi actif' : 'Suivi inactif'}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Carte */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
 <div className="p-4 border-b border-gray-200">
 <h2 className="text-lg font-semibold text-gray-900">Carte</h2>
 <p className="text-sm text-gray-600">Votre position et les adresses de livraison</p>
 </div>
 <div 
 ref={mapRef} 
 className="w-full h-96 lg:h-[500px]"
 />
 </div>
 </div>

 {/* Liste des livraisons */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200">
 <div className="p-4 border-b border-gray-200">
 <h2 className="text-lg font-semibold text-gray-900">Livraisons</h2>
 <p className="text-sm text-gray-600">Vos destinations</p>
 </div>
 
 <div className="p-4 space-y-4">
 {deliveryLocations.length === 0 ? (
 <div className="text-center py-8">
 <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500">Aucune livraison en cours</p>
 </div>
 ) : (
 deliveryLocations.map((location, index) => (
 <div key={index} className="border border-gray-200 rounded-lg p-4">
 <div className="flex items-center justify-between mb-3">
 <h3 className="font-medium text-gray-900">
 Livraison #{index + 1}
 </h3>
 <button
 onClick={() => getDirections(location)}
 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
 title="Obtenir l'itinéraire"
 >
 <FiNavigation className="w-4 h-4" />
 </button>
 </div>
 
 <div className="space-y-2">
 <div className="flex items-center space-x-2">
 <FiUser className="w-4 h-4 text-gray-400" />
 <span className="text-sm text-gray-900">{location.customerName}</span>
 </div>
 
 <div className="flex items-center space-x-2">
 <FiPhone className="w-4 h-4 text-gray-400" />
 <span className="text-sm text-gray-600">{location.customerPhone}</span>
 </div>
 
 <div className="flex items-start space-x-2">
 <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
 <span className="text-sm text-gray-600">{location.address}</span>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
