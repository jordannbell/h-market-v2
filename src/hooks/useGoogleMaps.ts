import { useState, useEffect } from 'react'

declare global {
 interface Window {
 google: typeof google | undefined
 googleMapsLoaded: boolean
 }
}

export function useGoogleMaps() {
 const [isLoaded, setIsLoaded] = useState(false)
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 // Vérifier si Google Maps est déjà chargé
 if (window.google && window.googleMapsLoaded) {
 setIsLoaded(true)
 return
 }

 // Vérifier si le chargement est déjà en cours
 if (window.googleMapsLoaded === false) {
 return
 }

 const loadGoogleMaps = async () => {
 try {
 setIsLoading(true)
 setError(null)

 // Marquer que le chargement est en cours
 window.googleMapsLoaded = false

 const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 if (!apiKey) {
 console.warn('️ Clé API Google Maps manquante - Les cartes ne seront pas disponibles')
 setError('Clé API Google Maps manquante')
 setIsLoading(false)
 return
 }

 // Vérifier si le script est déjà présent
 const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
 if (existingScript) {
 // Attendre que le script existant se charge
 await new Promise<void>((resolve) => {
 const checkGoogle = () => {
 if (window.google && window.google.maps) {
 window.googleMapsLoaded = true
 resolve()
 } else {
 setTimeout(checkGoogle, 100)
 }
 }
 checkGoogle()
 })
 } else {
 // Créer et charger le script
 const script = document.createElement('script')
 script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
 script.async = true
 script.defer = true

 script.onload = () => {
 window.googleMapsLoaded = true
 setIsLoaded(true)
 setIsLoading(false)
 }

 script.onerror = () => {
 setError('Erreur lors du chargement de Google Maps')
 setIsLoading(false)
 window.googleMapsLoaded = false
 }

 document.head.appendChild(script)
 }
 } catch (err) {
 setError(err instanceof Error ? err.message : 'Erreur inconnue')
 setIsLoading(false)
 window.googleMapsLoaded = false
 }
 }

 loadGoogleMaps()
 }, [])

 return {
 isLoaded,
 isLoading,
 error,
 google: window.google
 }
}

