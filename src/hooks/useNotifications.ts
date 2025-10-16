import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

interface Notification {
 type: string
 title: string
 message: string
 data?: Record<string, unknown>
 timestamp: string
}

interface UseNotificationsReturn {
 notifications: Notification[]
 isConnected: boolean
 connect: () => void
 disconnect: () => void
 clearNotifications: () => void
 markAsRead: (index: number) => void
}

export function useNotifications(): UseNotificationsReturn {
 const [notifications, setNotifications] = useState<Notification[]>([])
 const [isConnected, setIsConnected] = useState(false)
 const [eventSource, setEventSource] = useState<EventSource | null>(null)
 const { token, isAuthenticated } = useAuth()

 const connect = useCallback(() => {
 if (!token || !isAuthenticated || eventSource) return

 try {
 // EventSource ne supporte pas les headers personnalisés directement
 // On passe le token en paramètre d'URL
 const source = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`)

 source.onopen = () => {
 setIsConnected(true)
 console.log(' Connexion SSE établie')
 }

 source.onmessage = (event) => {
 try {
 const data = JSON.parse(event.data)
 
 if (data.type === 'connected') {
 console.log(' Connexion SSE confirmée')
 return
 }

 // Ajouter la notification à la liste
 const notification: Notification = {
 type: data.type,
 title: data.title,
 message: data.message,
 data: data.data,
 timestamp: data.timestamp
 }

 setNotifications(prev => [notification, ...prev])

 // Afficher une toast selon le type
 switch (data.type) {
 case 'new_order':
 toast.success(` ${data.title}`, {
 duration: 5000,
 icon: ''
 })
 break
 case 'order_assigned':
 toast.success(` ${data.title}`, {
 duration: 4000,
 icon: ''
 })
 break
 case 'order_status_update':
 toast.success(` ${data.title}`, {
 duration: 3000,
 icon: ''
 })
 break
 case 'delivery_update':
 toast.info(` ${data.title}`, {
 duration: 3000,
 icon: ''
 })
 break
 case 'order_delivered':
 toast.success(` ${data.title}`, {
 duration: 4000,
 icon: ''
 })
 break
 default:
 toast(data.title, {
 duration: 3000
 })
 }

 console.log(' Notification reçue:', notification)
 } catch (error) {
 console.error(' Erreur lors du parsing de la notification:', error)
 }
 }

 source.onerror = (error) => {
 console.error(' Erreur SSE:', {
 error,
 readyState: source.readyState,
 url: source.url,
 token: token ? 'présent' : 'manquant',
 isAuthenticated
 })
 setIsConnected(false)
 
 // Nettoyer la source actuelle
 source.close()
 setEventSource(null)
 
 // Tentative de reconnexion après 5 secondes
 setTimeout(() => {
 if (isAuthenticated && token) {
 console.log(' Tentative de reconnexion SSE...')
 // Éviter la référence circulaire en appelant directement la logique
 const newSource = new EventSource(`/api/notifications/stream?token=${encodeURIComponent(token)}`)
 setEventSource(newSource)
 }
 }, 5000)
 }

 setEventSource(source)
 } catch (error) {
 console.error(' Erreur lors de la connexion SSE:', error)
 }
 }, [token, isAuthenticated, eventSource])

 const disconnect = useCallback(() => {
 if (eventSource) {
 eventSource.close()
 setEventSource(null)
 setIsConnected(false)
 console.log(' Connexion SSE fermée')
 }
 }, [eventSource])

 const clearNotifications = useCallback(() => {
 setNotifications([])
 }, [])

 const markAsRead = useCallback((index: number) => {
 setNotifications(prev => prev.filter((_, i) => i !== index))
 }, [])

 // Connexion automatique quand l'utilisateur est authentifié
 useEffect(() => {
 if (isAuthenticated && token) {
 connect()
 } else {
 disconnect()
 }

 return () => {
 disconnect()
 }
 }, [isAuthenticated, token, connect, disconnect])

 // Nettoyage à la déconnexion
 useEffect(() => {
 return () => {
 disconnect()
 }
 }, [disconnect])

 return {
 notifications,
 isConnected,
 connect,
 disconnect,
 clearNotifications,
 markAsRead
 }
}

