'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { FiAlertCircle, FiBell, FiCheck, FiInfo, FiMapPin, FiPackage, FiTruck, FiX } from 'react-icons/fi'


interface NotificationCenterProps {
 className?: string
}

export default function NotificationCenter({ className = '' }: NotificationCenterProps) {
 const { notifications, isConnected, clearNotifications, markAsRead } = useNotifications()
 const [isOpen, setIsOpen] = useState(false)

 const getNotificationIcon = (type: string) => {
 switch (type) {
 case 'new_order':
 return <FiPackage className="w-5 h-5 text-blue-500" />
 case 'order_assigned':
 return <FiTruck className="w-5 h-5 text-green-500" />
 case 'order_status_update':
 return <FiCheck className="w-5 h-5 text-orange-500" />
 case 'delivery_update':
 return <FiMapPin className="w-5 h-5 text-purple-500" />
 case 'order_delivered':
 return <FiCheck className="w-5 h-5 text-green-600" />
 case 'error':
 return <FiAlertCircle className="w-5 h-5 text-red-500" />
 default:
 return <FiInfo className="w-5 h-5 text-gray-500" />
 }
 }

 const getNotificationColor = (type: string) => {
 switch (type) {
 case 'new_order':
 return 'bg-blue-50 border-blue-200'
 case 'order_assigned':
 return 'bg-green-50 border-green-200'
 case 'order_status_update':
 return 'bg-orange-50 border-orange-200'
 case 'delivery_update':
 return 'bg-purple-50 border-purple-200'
 case 'order_delivered':
 return 'bg-green-50 border-green-200'
 case 'error':
 return 'bg-red-50 border-red-200'
 default:
 return 'bg-gray-50 border-gray-200'
 }
 }

 const formatTime = (timestamp: string) => {
 const date = new Date(timestamp)
 const now = new Date()
 const diff = now.getTime() - date.getTime()
 
 if (diff < 60000) { // Moins d'1 minute
 return 'À l\'instant'
 } else if (diff < 3600000) { // Moins d'1 heure
 const minutes = Math.floor(diff / 60000)
 return `Il y a ${minutes} min`
 } else if (diff < 86400000) { // Moins d'1 jour
 const hours = Math.floor(diff / 3600000)
 return `Il y a ${hours}h`
 } else {
 return date.toLocaleDateString('fr-FR')
 }
 }

 return (
 <div className={`relative ${className}`}>
 {/* Bouton de notification */}
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg"
 >
 <FiBell className="w-6 h-6" />
 
 {/* Indicateur de connexion */}
 <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
 isConnected ? 'bg-green-500' : 'bg-gray-400'
 }`}></div>
 
 {/* Badge de notifications */}
 {notifications.length > 0 && (
 <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
 {notifications.length > 9 ? '9+' : notifications.length}
 </span>
 )}
 </button>

 {/* Panneau de notifications */}
 {isOpen && (
 <>
 {/* Overlay */}
 <div 
 className="fixed inset-0 z-40"
 onClick={() => setIsOpen(false)}
 />
 
 {/* Panneau */}
 <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
 {/* Header */}
 <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
 <div className="flex items-center justify-between">
 <h3 className="text-sm font-semibold text-gray-900">
 Notifications ({notifications.length})
 </h3>
 <div className="flex items-center space-x-2">
 {/* Indicateur de connexion */}
 <div className={`w-2 h-2 rounded-full ${
 isConnected ? 'bg-green-500' : 'bg-gray-400'
 }`}></div>
 <span className="text-xs text-gray-500">
 {isConnected ? 'Connecté' : 'Déconnecté'}
 </span>
 {notifications.length > 0 && (
 <button
 onClick={clearNotifications}
 className="text-xs text-gray-500 hover:text-gray-700"
 >
 Tout effacer
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Liste des notifications */}
 <div className="max-h-80 overflow-y-auto">
 {notifications.length === 0 ? (
 <div className="px-4 py-8 text-center">
 <FiBell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
 <p className="text-sm text-gray-500">Aucune notification</p>
 </div>
 ) : (
 notifications.map((notification, index) => (
 <div
 key={`${notification.timestamp}-${index}`}
 className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getNotificationColor(notification.type)}`}
 >
 <div className="flex items-start space-x-3">
 <div className="flex-shrink-0 mt-0.5">
 {getNotificationIcon(notification.type)}
 </div>
 
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between">
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-900">
 {notification.title}
 </p>
 <p className="text-sm text-gray-600 mt-1">
 {notification.message}
 </p>
 <p className="text-xs text-gray-500 mt-1">
 {formatTime(notification.timestamp)}
 </p>
 </div>
 
 <button
 onClick={() => markAsRead(index)}
 className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
 >
 <FiX className="w-4 h-4" />
 </button>
 </div>
 
 {/* Données supplémentaires */}
 {notification.data && (
 <div className="mt-2 text-xs text-gray-500">
 {notification.data.orderNumber && (
 <p>Commande: {notification.data.orderNumber}</p>
 )}
 {notification.data.driverName && (
 <p>Livreur: {notification.data.driverName}</p>
 )}
 {notification.data.estimatedTime && (
 <p>Livraison prévue: {notification.data.estimatedTime}</p>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 ))
 )}
 </div>

 {/* Footer */}
 {notifications.length > 0 && (
 <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
 <button
 onClick={() => setIsOpen(false)}
 className="text-xs text-gray-500 hover:text-gray-700 w-full text-left"
 >
 Fermer
 </button>
 </div>
 )}
 </div>
 </>
 )}
 </div>
 )
}

