'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/hooks/useAuth'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CheckoutForm from '@/components/CheckoutForm'
import toast from 'react-hot-toast'
import { FiAlertCircle, FiArrowLeft, FiCreditCard } from 'react-icons/fi'


// Charger Stripe (clé publique)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PaiementPage() {
 const router = useRouter()
 const params = useParams()
 const orderId = params.orderId as string
 const { user, isAuthenticated, loading: authLoading } = useAuth()
 
 const [order, setOrder] = useState<Record<string, unknown>>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')

 useEffect(() => {
 // Attendre que useAuth ait fini de vérifier l'authentification
 if (authLoading) {
 console.log(' Paiement - En attente du chargement de useAuth...')
 return
 }
 
 if (!isAuthenticated) {
 console.log(' Paiement - Utilisateur non connecté, redirection vers login')
 router.push('/auth/login?redirect=/checkout')
 return
 }
 
 console.log(' Paiement - Utilisateur authentifié, accès autorisé')

 if (!orderId) {
 setError('ID de commande manquant')
 setLoading(false)
 return
 }

 // Charger les détails de la commande
 fetchOrderDetails()
 }, [isAuthenticated, orderId, router, authLoading])

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
 setOrder(result.order)
 } else {
 throw new Error('Commande non trouvée')
 }
 } catch (error: unknown) {
 setError(error.message || 'Erreur lors du chargement de la commande')
 } finally {
 setLoading(false)
 }
 }

 const handlePaymentSuccess = () => {
 toast.success('Paiement réussi ! Votre commande a été confirmée.')
 // Rediriger vers la page de confirmation avec l'ID de commande
 router.push(`/commande-confirmee?orderId=${orderId}`)
 }

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
 <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
 <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
 <p className="text-gray-600 mb-6">{error || 'Commande non trouvée'}</p>
 <Link
 href="/checkout"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
 >
 Retour au checkout
 </Link>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
 <Navigation showSearch={false} />
 
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
 {/* Header */}
 <div className="mb-6 sm:mb-8 lg:mb-10">
 <Link
 href="/checkout"
 className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mb-4 transition-colors"
 >
 <FiArrowLeft className="w-4 h-4 mr-2" />
 <span className="hidden sm:inline">Retour au checkout</span>
 <span className="sm:hidden">Retour</span>
 </Link>
 <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
 <FiCreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
 Paiement sécurisé
 </h1>
 <p className="text-sm sm:text-base text-gray-600 mt-2">
 Finalisez votre commande <span className="font-semibold text-green-700">#{order.orderNumber}</span>
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
 {/* Formulaire de paiement */}
 <div className="lg:col-span-3">
 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
 <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
 <FiCreditCard className="w-5 h-5 text-green-600" />
 </div>
 <span>Informations de paiement</span>
 </h2>
 
 <Elements stripe={stripePromise}>
 <CheckoutForm
 amount={order.totals.total}
 orderId={order._id}
 onSuccess={handlePaymentSuccess}
 />
 </Elements>
 </div>
 </div>

 {/* Résumé de la commande */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-8">
 <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
 
 {/* Numéro de commande */}
 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-green-800">Numéro de commande</span>
 <span className="text-lg font-bold text-green-900">{order.orderNumber}</span>
 </div>
 </div>
 
 {/* Articles */}
 <div className="space-y-3 mb-6">
 {order.items.map((item: any, index: number) => (
 <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
 <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
 <img
 src={item.image}
 alt={item.title}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
 {item.title}
 </h3>
 <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
 <span className="font-medium">{item.quantity}</span>
 <span>×</span>
 <span>{item.price.toFixed(2)} €</span>
 </p>
 </div>
 <div className="text-sm sm:text-base font-semibold text-green-700">
 {item.totalPrice.toFixed(2)} €
 </div>
 </div>
 ))}
 </div>

 {/* Totaux */}
 <div className="border-t-2 border-gray-200 pt-4 space-y-3">
 <div className="flex justify-between text-sm sm:text-base text-gray-600">
 <span>Sous-total</span>
 <span className="font-medium">{order.totals.subtotal.toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-sm sm:text-base text-gray-600">
 <span>Livraison</span>
 <span className="font-medium text-green-600">{order.totals.deliveryFee.toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-sm sm:text-base text-gray-600">
 <span>TVA (5,5%)</span>
 <span className="font-medium">{order.totals.taxes.toFixed(2)} €</span>
 </div>
 <div className="border-t-2 border-gray-300 pt-4 mt-4">
 <div className="flex justify-between items-center">
 <span className="text-base sm:text-lg font-bold text-gray-900">Total</span>
 <span className="text-xl sm:text-2xl font-bold text-green-700">{order.totals.total.toFixed(2)} €</span>
 </div>
 </div>
 </div>

 {/* Adresse de livraison */}
 <div className="mt-6 pt-6 border-t border-gray-200">
 <h3 className="text-sm font-medium text-gray-900 mb-3">Adresse de livraison</h3>
 <div className="text-sm text-gray-600 space-y-1">
 <p>{order.address.street}</p>
 <p>{order.address.postalCode} {order.address.city}</p>
 <p>{order.address.country}</p>
 </div>
 </div>

 {/* Informations de livraison */}
 <div className="mt-4">
 <h3 className="text-sm font-medium text-gray-900 mb-3">Livraison</h3>
 <div className="text-sm text-gray-600 space-y-1">
 <p>Mode: {order.delivery.mode === 'express' ? 'Express' : 'Standard'}</p>
 <p>Créneau: {order.delivery.slot === 'morning' ? 'Matin (9h-11h)' : 
 order.delivery.slot === 'noon' ? 'Midi (12h-14h)' : 'Soir (18h-20h)'}</p>
 <p>Date: {new Date(order.delivery.scheduledAt).toLocaleDateString('fr-FR')}</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
