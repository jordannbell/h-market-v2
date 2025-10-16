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
 <div className="min-h-screen bg-green-50">
 <Navigation showSearch={false} />
 
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="mb-8">
 <Link
 href="/checkout"
 className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
 >
 <FiArrowLeft className="w-4 h-4 mr-2" />
 Retour au checkout
 </Link>
 <h1 className="text-3xl font-bold text-gray-900">Paiement sécurisé</h1>
 <p className="text-gray-600 mt-2">
 Finalisez votre commande #{order.orderNumber}
 </p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Formulaire de paiement */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
 <FiCreditCard className="w-5 h-5 mr-2 text-green-600" />
 Informations de paiement
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
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
 <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
 
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
 <div key={index} className="flex items-center space-x-3">
 <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
 <img
 src={item.image}
 alt={item.title}
 className="w-full h-full object-cover"
 />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-medium text-gray-900 truncate">
 {item.title}
 </h3>
 <p className="text-sm text-gray-500">
 {item.quantity} × {item.price.toFixed(2)} €
 </p>
 </div>
 <div className="text-sm font-medium text-gray-900">
 {item.totalPrice.toFixed(2)} €
 </div>
 </div>
 ))}
 </div>

 {/* Totaux */}
 <div className="border-t border-gray-200 pt-4 space-y-3">
 <div className="flex justify-between text-gray-600">
 <span>Sous-total</span>
 <span>{order.totals.subtotal.toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-gray-600">
 <span>Livraison</span>
 <span>{order.totals.deliveryFee.toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-gray-600">
 <span>TVA (20%)</span>
 <span>{order.totals.taxes.toFixed(2)} €</span>
 </div>
 <div className="border-t border-gray-200 pt-3">
 <div className="flex justify-between text-lg font-bold text-gray-900">
 <span>Total</span>
 <span>{order.totals.total.toFixed(2)} €</span>
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
