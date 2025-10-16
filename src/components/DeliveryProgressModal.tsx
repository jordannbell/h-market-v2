'use client'

import { useState, useEffect } from 'react'
import { FiCheck, FiMapPin, FiPackage, FiPhone, FiTruck, FiUser, FiX } from 'react-icons/fi'


interface DeliveryProgressModalProps {
 isOpen: boolean
 onClose: () => void
 order: {
 _id: string
 orderNumber: string
 customer?: {
  name?: string
  phone?: string
 }
 address?: {
  street?: string
  city?: string
  postalCode?: string
 }
 items?: Array<{
  title?: string
  quantity?: number
  totalPrice?: number
 }>
 totals?: {
  total?: number
 }
 delivery?: {
 status: string
 }
 }
 onAccept: (orderId: string) => Promise<void>
 onUpdateStatus: (orderId: string, status: string) => Promise<void>
 isUpdating: boolean
}

const DELIVERY_STEPS = [
 { id: 'pending', label: 'En attente', action: 'accept' },
 { id: 'assigned', label: 'Acceptée', action: 'picked_up' },
 { id: 'picked_up', label: 'Récupérée', action: 'in_transit' },
 { id: 'in_transit', label: 'En route', action: 'delivered' },
 { id: 'delivered', label: 'Livrée', action: null }
]

export default function DeliveryProgressModal({
 isOpen,
 onClose,
 order,
 onAccept,
 onUpdateStatus,
 isUpdating
}: DeliveryProgressModalProps) {
 const [currentStatus, setCurrentStatus] = useState('pending')

 useEffect(() => {
 if (order?.delivery?.status) {
 setCurrentStatus(order.delivery.status)
 console.log(' Modal - Statut actuel:', order.delivery.status)
 }
 }, [order])

 if (!isOpen || !order) return null

 const currentStepIndex = DELIVERY_STEPS.findIndex(step => step.id === currentStatus)
 const currentStep = DELIVERY_STEPS[currentStepIndex] || DELIVERY_STEPS[0]
 const progress = ((currentStepIndex) / (DELIVERY_STEPS.length - 1)) * 100

 const handleNextStep = async () => {
 console.log(' Action déclenchée - Statut actuel:', currentStatus, 'Action:', currentStep.action)
 
 if (!order._id) {
 console.error('❌ Erreur: ID de commande manquant', order)
 return
 }
 
 if (currentStatus === 'pending') {
 await onAccept(order._id)
 } else if (currentStep.action) {
 await onUpdateStatus(order._id, currentStep.action)
 }
 }

 const isCompleted = currentStatus === 'delivered'
 const canProceed = !isCompleted && !isUpdating

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop avec effet blur */}
 <div 
 className="absolute inset-0 bg-black/40 backdrop-blur-sm"
 onClick={isCompleted ? onClose : undefined}
 />
 
 {/* Modal */}
 <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
 {/* Header minimaliste */}
 <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 text-white">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-2xl font-bold">Livraison #{order.orderNumber}</h2>
 <p className="text-slate-300 mt-1">Suivi en temps réel</p>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-white/10 rounded-lg transition-colors"
 title={isCompleted ? "Fermer" : "Le modal reste ouvert pendant la livraison"}
 >
 <FiX className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Barre de progression minimaliste */}
 <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Progression</span>
 <span className="text-sm font-bold text-slate-900">{Math.round(progress)}%</span>
 </div>
 <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
 <div 
 className="h-full bg-slate-800 rounded-full transition-all duration-700 ease-out"
 style={{ width: `${progress}%` }}
 />
 </div>
 </div>

 {/* Content */}
 <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-250px)]">
 {/* Informations client - Design minimaliste */}
 <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
 <div className="flex items-start space-x-4">
 <div className="p-3 bg-slate-200 rounded-lg">
 <FiUser className="w-5 h-5 text-slate-700" />
 </div>
 <div className="flex-1">
 <h3 className="font-semibold text-slate-900 mb-1">{order.customer?.name || 'Client'}</h3>
 <div className="flex items-center text-sm text-slate-600 mb-2">
 <FiPhone className="w-4 h-4 mr-2" />
 {order.customer?.phone || 'Non renseigné'}
 </div>
 <div className="flex items-center text-sm text-slate-600">
 <FiMapPin className="w-4 h-4 mr-2" />
 {order.address?.street || 'Adresse'}, {order.address?.city || 'Ville'} {order.address?.postalCode || 'Code postal'}
 </div>
 </div>
 </div>
 </div>

 {/* Total de la commande */}
 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
 <span className="text-slate-600 font-medium">Montant total</span>
 <span className="text-2xl font-bold text-slate-900">{order.totals?.total?.toFixed(2) || '0.00'}€</span>
 </div>

 {/* Étapes de livraison - Design épuré */}
 <div className="space-y-3">
 {DELIVERY_STEPS.map((step, index) => {
 const isActive = step.id === currentStatus
 const isPast = index < currentStepIndex
 const isFuture = index > currentStepIndex

 return (
 <div
 key={step.id}
 className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
 isActive
 ? 'bg-slate-800 border-slate-800 text-white shadow-lg'
 : isPast
 ? 'bg-green-50 border-green-200 text-green-800'
 : 'bg-white border-slate-200 text-slate-400'
 }`}
 >
 <div className="flex items-center">
 <div
 className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
 isActive
 ? 'bg-white/20 text-white'
 : isPast
 ? 'bg-green-500 text-white'
 : 'bg-slate-100 text-slate-400'
 }`}
 >
 {isPast ? (
 <FiCheck className="w-5 h-5" />
 ) : (
 <span>{index + 1}</span>
 )}
 </div>
 <div className="ml-4 flex-1">
 <h4 className="font-semibold text-base">{step.label}</h4>
 </div>
 {isActive && (
 <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
 )}
 </div>
 </div>
 )
 })}
 </div>
 </div>

 {/* Footer avec action */}
 <div className="p-6 bg-slate-50 border-t border-slate-200">
 {!isCompleted ? (
 <button
 onClick={handleNextStep}
 disabled={!canProceed}
 className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
 >
 {isUpdating ? (
 <>
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 <span>Mise à jour...</span>
 </>
 ) : (
 <>
 {currentStatus === 'pending' && <FiCheck className="w-5 h-5" />}
 {currentStatus === 'assigned' && <FiPackage className="w-5 h-5" />}
 {currentStatus === 'picked_up' && <FiTruck className="w-5 h-5" />}
 {currentStatus === 'in_transit' && <FiMapPin className="w-5 h-5" />}
 <span>
 {currentStatus === 'pending' && 'Accepter la commande'}
 {currentStatus === 'assigned' && 'Marquer comme récupérée'}
 {currentStatus === 'picked_up' && 'Démarrer la livraison'}
 {currentStatus === 'in_transit' && 'Confirmer la livraison'}
 </span>
 </>
 )}
 </button>
 ) : (
 <div className="text-center">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
 <FiCheck className="w-8 h-8 text-white" />
 </div>
 <h3 className="text-xl font-bold text-slate-900 mb-2">Livraison terminée !</h3>
 <p className="text-slate-600 mb-4">La commande a été livrée avec succès</p>
 <button
 onClick={onClose}
 className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
 >
 Fermer
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 )
}

