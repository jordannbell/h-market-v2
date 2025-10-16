'use client'

import { useState, useEffect } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { FiCreditCard, FiLock } from 'react-icons/fi'


interface CheckoutFormProps {
 amount: number
 orderId: string
 onSuccess: () => void
}

const cardElementOptions = {
 style: {
 base: {
 fontSize: '16px',
 color: '#1F2937',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 fontSmoothing: 'antialiased',
 lineHeight: '1.5',
 '::placeholder': {
 color: '#9CA3AF',
 },
 padding: '12px',
 },
 invalid: {
 color: '#EF4444',
 iconColor: '#EF4444',
 },
 complete: {
 color: '#059669',
 iconColor: '#059669',
 },
 },
 hidePostalCode: false,
 disabled: false,
}

export default function CheckoutForm({ amount, orderId, onSuccess }: CheckoutFormProps) {
 const stripe = useStripe()
 const elements = useElements()
 const { user } = useAuth()
 
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState('')

 // Debug: Vérifier que Stripe est bien chargé
 useEffect(() => {
   console.log('Stripe loaded:', !!stripe)
   console.log('Elements loaded:', !!elements)
   console.log('Stripe publishable key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Present' : 'Missing')
 }, [stripe, elements])

 const handleSubmit = async (event: React.FormEvent) => {
 event.preventDefault()

 if (!stripe || !elements) {
   console.error('Stripe ou Elements non chargés')
   setError('Stripe non initialisé. Veuillez recharger la page.')
   return
 }

 setIsLoading(true)
 setError('')

 try {
 // Créer le PaymentIntent
 const response = await fetch('/api/payments/stripe/create-payment-intent', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 amount,
 currency: 'eur',
 orderId,
 metadata: {
 userId: user?._id
 }
 })
 })

 const result = await response.json()

 if (!response.ok) {
 throw new Error(result.error || 'Erreur lors de la création du paiement')
 }

 // Confirmer le paiement avec Stripe
 const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
 result.clientSecret,
 {
 payment_method: {
 card: elements.getElement(CardElement)!,
 billing_details: {
 name: `${user?.name.first} ${user?.name.last}`,
 email: user?.email
 }
 }
 }
 )

 if (stripeError) {
 throw new Error(stripeError.message || 'Erreur lors du paiement')
 }

 if (paymentIntent.status === 'succeeded') {
 toast.success('Paiement réussi ! Votre commande a été confirmée.')
 onSuccess()
 } else {
 throw new Error('Le paiement n\'a pas été confirmé')
 }

 } catch (error: unknown) {
 setError(error.message || 'Erreur lors du paiement')
 toast.error(error.message || 'Erreur lors du paiement')
 } finally {
 setIsLoading(false)
 }
 }

 const formatAmount = (amount: number) => {
 return new Intl.NumberFormat('fr-FR', {
 style: 'currency',
 currency: 'EUR'
 }).format(amount)
 }



 return (
 <div>
 {/* Informations de sécurité */}
 <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
 <div className="flex items-center space-x-2 text-green-800">
 <FiLock className="w-4 h-4" />
 <span className="text-sm font-medium">Paiement sécurisé par Stripe</span>
 </div>
 <p className="text-xs text-green-700 mt-1">
 Vos informations de paiement sont cryptées et sécurisées
 </p>
 </div>

 {/* Montant total */}
 <div className="bg-gray-50 rounded-lg p-4 mb-6">
 <div className="flex justify-between items-center">
 <span className="text-gray-600">Montant total :</span>
 <span className="text-xl font-bold text-gray-900">{formatAmount(amount)}</span>
 </div>
 </div>

 {/* Formulaire de paiement */}
 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Informations de la carte */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
 <FiCreditCard className="w-4 h-4 text-green-600" />
 Informations de la carte bancaire
 </label>
 <div className="border-2 border-gray-300 rounded-xl p-4 bg-white focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all" id="stripe-card-element">
 <CardElement 
   options={cardElementOptions}
   className="w-full"
 />
 </div>
 <p className="text-xs text-gray-500 mt-2">
 💳 Carte de test : 4242 4242 4242 4242 | Exp : 12/34 | CVC : 123
 </p>
 </div>

 {/* Message d'erreur */}
 {error && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
 <p className="text-sm text-red-800">{error}</p>
 </div>
 )}

 {/* Bouton de paiement */}
 <button
 type="submit"
 disabled={!stripe || isLoading}
 className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
 >
 {isLoading ? (
 <>
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 <span>Traitement du paiement...</span>
 </>
 ) : (
 <>
 <FiCreditCard className="w-5 h-5" />
 <span>Payer {formatAmount(amount)}</span>
 </>
 )}
 </button>

 {/* Informations supplémentaires */}
 <div className="text-center">
 <p className="text-xs text-gray-500">
 En cliquant sur "Payer", vous acceptez nos conditions générales de vente
 </p>
 </div>
 </form>
 </div>
 )
}
