import { useState, useEffect, useCallback, useRef } from 'react'

interface GoogleMapsAdvancedHook {
 isLoaded: boolean
 error: string | null
 map: google.maps.Map | null
 directionsService: google.maps.DirectionsService | null
 directionsRenderer: google.maps.DirectionsRenderer | null
 geocoder: google.maps.Geocoder | null
 initializeMap: (container: HTMLElement, options: google.maps.MapOptions) => google.maps.Map | null
 calculateRoute: (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, waypoints?: google.maps.DirectionsWaypoint[]) => Promise<google.maps.DirectionsResult | null>
 geocodeAddress: (address: string) => Promise<{ lat: number; lng: number; address: string } | null>
 addMarker: (position: { lat: number; lng: number }, options?: google.maps.MarkerOptions) => google.maps.Marker | null
 updateMarker: (marker: google.maps.Marker, position: { lat: number; lng: number }) => void
 addRealTimeTracking: (driverId: string, orderId: string, onLocationUpdate: (location: { lat: number; lng: number }) => void) => void
 stopRealTimeTracking: () => void
 getCurrentLocation: () => Promise<{ lat: number; lng: number } | null>
}

export function useGoogleMapsAdvanced(): GoogleMapsAdvancedHook {
 const [isLoaded, setLoaded] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [map, setMap] = useState<google.maps.Map | null>(null)
 const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
 const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
 const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)
 
 const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null)
 const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())

 useEffect(() => {
 const initializeGoogleMaps = () => {
 if (window.google && window.google.maps) {
 setLoaded(true)
 setDirectionsService(new google.maps.DirectionsService())
 setDirectionsRenderer(new google.maps.DirectionsRenderer())
 setGeocoder(new google.maps.Geocoder())
 setError(null)
 } else {
 setError('Google Maps API non chargée')
 }
 }

 // Vérifier si Google Maps est déjà chargé
 if (window.google && window.google.maps) {
 initializeGoogleMaps()
 } else {
 // Attendre que Google Maps soit chargé
 const checkInterval = setInterval(() => {
 if (window.google && window.google.maps) {
 clearInterval(checkInterval)
 initializeGoogleMaps()
 }
 }, 100)

 // Timeout après 10 secondes
 setTimeout(() => {
 clearInterval(checkInterval)
 if (!isLoaded) {
 setError('Timeout: Google Maps API non chargée')
 }
 }, 10000)
 }

 return () => {
 if (trackingIntervalRef.current) {
 clearInterval(trackingIntervalRef.current)
 }
 }
 }, [isLoaded])

 const initializeMap = useCallback((container: HTMLElement, options: google.maps.MapOptions): google.maps.Map | null => {
 if (!isLoaded || !container) return null

 try {
 const newMap = new google.maps.Map(container, {
 zoom: 15,
 center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
 mapTypeId: google.maps.MapTypeId.ROADMAP,
 styles: [
 {
 featureType: 'poi',
 elementType: 'labels',
 stylers: [{ visibility: 'off' }]
 }
 ],
 ...options
 })

 setMap(newMap)
 return newMap
 } catch (err) {
 setError('Erreur lors de l\'initialisation de la carte')
 return null
 }
 }, [isLoaded])

 const calculateRoute = useCallback(async (
 origin: { lat: number; lng: number },
 destination: { lat: number; lng: number },
 waypoints?: google.maps.DirectionsWaypoint[]
 ): Promise<google.maps.DirectionsResult | null> => {
 if (!directionsService || !directionsRenderer) return null

 try {
 const request: google.maps.DirectionsRequest = {
 origin,
 destination,
 waypoints,
 travelMode: google.maps.TravelMode.DRIVING,
 avoidHighways: false,
 avoidTolls: false,
 optimizeWaypoints: true
 }

 const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
 directionsService.route(request, (result, status) => {
 if (status === google.maps.DirectionsStatus.OK && result) {
 resolve(result)
 } else {
 reject(new Error(`Erreur de calcul d'itinéraire: ${status}`))
 }
 })
 })

 // Afficher l'itinéraire sur la carte
 if (map) {
 directionsRenderer.setMap(map)
 directionsRenderer.setDirections(result)
 }

 return result
 } catch (err) {
 console.error('Erreur lors du calcul de l\'itinéraire:', err)
 return null
 }
 }, [directionsService, directionsRenderer, map])

 const geocodeAddress = useCallback(async (address: string): Promise<{ lat: number; lng: number; address: string } | null> => {
 if (!geocoder) return null

 try {
 const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
 geocoder!.geocode({ address }, (results, status) => {
 if (status === google.maps.GeocoderStatus.OK && results) {
 resolve(results)
 } else {
 reject(new Error(`Erreur de géocodage: ${status}`))
 }
 })
 })

 if (result.length > 0) {
 const location = result[0].geometry.location
 return {
 lat: location.lat(),
 lng: location.lng(),
 address: result[0].formatted_address
 }
 }

 return null
 } catch (err) {
 console.error('Erreur lors du géocodage:', err)
 return null
 }
 }, [geocoder])

 const addMarker = useCallback((position: { lat: number; lng: number }, options?: google.maps.MarkerOptions): google.maps.Marker | null => {
 if (!isLoaded || !map) return null

 try {
 const marker = new google.maps.Marker({
 position,
 map,
 title: options?.title || 'Position',
 ...options
 })

 return marker
 } catch (err) {
 console.error('Erreur lors de l\'ajout du marqueur:', err)
 return null
 }
 }, [isLoaded, map])

 const updateMarker = useCallback((marker: google.maps.Marker, position: { lat: number; lng: number }): void => {
 try {
 marker.setPosition(position)
 } catch (err) {
 console.error('Erreur lors de la mise à jour du marqueur:', err)
 }
 }, [])

 const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
 return new Promise((resolve) => {
 if (!navigator.geolocation) {
 resolve(null)
 return
 }

 navigator.geolocation.getCurrentPosition(
 (position) => {
 resolve({
 lat: position.coords.latitude,
 lng: position.coords.longitude
 })
 },
 (error) => {
 console.error('Erreur de géolocalisation:', error)
 resolve(null)
 },
 {
 enableHighAccuracy: true,
 timeout: 10000,
 maximumAge: 60000
 }
 )
 })
 }, [])

 const addRealTimeTracking = useCallback((
 driverId: string,
 orderId: string,
 onLocationUpdate: (location: { lat: number; lng: number }) => void
 ): void => {
 // Arrêter le tracking précédent s'il existe
 stopRealTimeTracking()

 // Démarrer le tracking en temps réel
 trackingIntervalRef.current = setInterval(async () => {
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
 const currentLocation = data.tracking.currentLocation

 if (currentLocation) {
 onLocationUpdate({
 lat: currentLocation.lat,
 lng: currentLocation.lng
 })
 }
 }
 } catch (err) {
 console.error('Erreur lors du suivi en temps réel:', err)
 }
 }, 5000) // Mise à jour toutes les 5 secondes
 }, [])

 const stopRealTimeTracking = useCallback((): void => {
 if (trackingIntervalRef.current) {
 clearInterval(trackingIntervalRef.current)
 trackingIntervalRef.current = null
 }
 }, [])

 return {
 isLoaded,
 error,
 map,
 directionsService,
 directionsRenderer,
 geocoder,
 initializeMap,
 calculateRoute,
 geocodeAddress,
 addMarker,
 updateMarker,
 addRealTimeTracking,
 stopRealTimeTracking,
 getCurrentLocation
 }
}

