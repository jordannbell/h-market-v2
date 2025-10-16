'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { FiArrowLeft, FiCreditCard, FiMapPin, FiTruck } from 'react-icons/fi'




export default function CheckoutPage() {
 const router = useRouter()
 const { cart, getCartTotal, clearCart } = useCart()
 const { user, isAuthenticated, loading } = useAuth()
 const [deliveryMode, setDeliveryMode] = useState<'planned' | 'express' | 'outside_idf'>('planned')
 const [deliverySlot, setDeliverySlot] = useState<'morning' | 'noon' | 'evening'>('morning')
 const [deliveryDate, setDeliveryDate] = useState('')
 const [address, setAddress] = useState({
 street: '',
 city: '',
 postalCode: '',
 country: 'France'
 })
 const [isCreatingOrder, setIsCreatingOrder] = useState(false)
 const [orderError, setOrderError] = useState('')

 useEffect(() => {
 // Attendre que useAuth ait fini de vérifier l'authentification
 if (loading) {
 console.log(' Checkout - En attente du chargement de useAuth...')
 return
 }
 
 // Attendre que l'authentification soit confirmée
 if (!isAuthenticated) {
 console.log(' Checkout - Utilisateur non connecté, redirection vers login')
 router.push('/auth/login?redirect=/checkout')
 return
 }
 
 console.log(' Checkout - Utilisateur authentifié, accès autorisé')

 // Rediriger si panier vide
 if (cart.length === 0) {
 router.push('/panier')
 return
 }

 // Pré-remplir l'adresse si disponible (désactivé temporairement)
 // if (user?.address) {
 // setAddress({
 // street: user.address.street || '',
 // city: user.address.city || '',
 // postalCode: user.address.postalCode || '',
 // country: user.address.country || 'France'
 // })
 // }

 // Définir la date de livraison par défaut (demain)
 const tomorrow = new Date()
 tomorrow.setDate(tomorrow.getDate() + 1)
 setDeliveryDate(tomorrow.toISOString().split('T')[0])
 }, [isAuthenticated, cart, user, router])

 const calculateSubtotal = () => {
 return getCartTotal()
 }

 const calculateDeliveryFee = () => {
 switch (deliveryMode) {
 case 'planned':
 return 3.99
 case 'express':
 return 5.99
 case 'outside_idf':
 return 8.99
 default:
 return 3.99
 }
 }

 const calculateTaxes = () => {
 return calculateSubtotal() * 0.20 // TVA 20%
 }

 const calculateTotal = () => {
 return calculateSubtotal() + calculateDeliveryFee() + calculateTaxes()
 }

 // Créer la commande et rediriger vers Stripe
 const handleCreateOrder = async () => {
 if (!isAuthenticated || !user) {
 setOrderError('Vous devez être connecté')
 return
 }

 setIsCreatingOrder(true)
 setOrderError('')

 try {
 const token = localStorage.getItem('token')
 if (!token) {
 throw new Error('Token d\'authentification manquant')
 }

 const orderData = {
 items: cart,
 address,
 delivery: {
 mode: deliveryMode,
 slot: deliveryMode === 'planned' ? deliverySlot : undefined,
 scheduledAt: deliveryMode === 'express' ? undefined : deliveryDate
 },
 paymentMethod: 'stripe'
 }

 console.log('Création de la commande...', orderData)

 const response = await fetch('/api/orders', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(orderData)
 })

 const result = await response.json()

 if (response.ok) {
 console.log('Commande créée avec succès:', result)
 console.log('Détails de la commande:', {
 orderId: result.order?.id,
 orderNumber: result.order?.orderNumber,
 total: result.order?.total
 })
 
 if (!result.order?.id) {
 throw new Error('ID de commande manquant dans la réponse')
 }
 
 // Rediriger vers la page de paiement Stripe
 console.log(' Redirection vers:', `/paiement/${result.order.id}`)
 router.push(`/paiement/${result.order.id}`)
 } else {
 throw new Error(result.error || 'Erreur lors de la création de la commande')
 }

 } catch (error: unknown) {
 console.error('Erreur lors de la création de la commande:', error)
 setOrderError(error.message || 'Erreur lors de la création de la commande')
 } finally {
 setIsCreatingOrder(false)
 }
 }

 // Debug: Afficher l'état de l'authentification
 console.log('Checkout - État auth:', { isAuthenticated, user, cart: cart.length })

 if (!isAuthenticated || cart.length === 0) {
 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center">
 <div className="text-center">
 <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
 <p className="text-gray-600 mb-4">
 {!isAuthenticated ? 'Vous devez être connecté pour accéder à cette page' : 'Votre panier est vide'}
 </p>
 {!isAuthenticated && (
 <Link
 href="/auth/login?redirect=/checkout"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
 >
 Se connecter
 </Link>
 )}
 {cart.length === 0 && (
 <Link
 href="/panier"
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
 >
 Retour au panier
 </Link>
 )}
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-green-50">
 <Navigation showSearch={false} />
 
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="mb-8">
 <Link
 href="/panier"
 className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
 >
 <FiArrowLeft className="w-4 h-4 mr-2" />
 Retour au panier
 </Link>
 <h1 className="text-3xl font-bold text-gray-900">Finaliser votre commande</h1>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Formulaire de commande */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
 <FiMapPin className="w-5 h-5 mr-2 text-green-600" />
 Adresse de livraison
 </h2>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Rue *
 </label>
 <input
 type="text"
 value={address.street}
 onChange={(e) => setAddress({ ...address, street: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
 placeholder="123 Rue de la Paix"
 required
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Ville *
 </label>
 <input
 type="text"
 value={address.city}
 onChange={(e) => setAddress({ ...address, city: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
 placeholder="Paris"
 required
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Code postal *
 </label>
 <input
 type="text"
 value={address.postalCode}
 onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
 placeholder="75001"
 required
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Pays
 </label>
 <input
 type="text"
 value={address.country}
 onChange={(e) => setAddress({ ...address, country: e.target.value })}
 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
 placeholder="France"
 />
 </div>
 </div>
 </div>

 {/* Options de livraison */}
 <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
 <FiTruck className="w-5 h-5 mr-2 text-green-600" />
 Options de livraison
 </h2>
 
 <div className="space-y-6">
 {/* Mode de livraison */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-3">
 Type de livraison
 </label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-500">
 <input
 type="radio"
 name="deliveryMode"
 value="planned"
 checked={deliveryMode === 'planned'}
 onChange={(e) => {
 const newMode = e.target.value as 'planned' | 'express' | 'outside_idf'
 setDeliveryMode(newMode)
 // Réinitialiser le créneau si on passe en mode hors IDF
 if (newMode === 'outside_idf') {
 setDeliverySlot('morning')
 }
 }}
 className="h-4 w-4 text-green-600 focus:ring-green-500"
 />
 <div className="ml-3">
 <div className="font-medium text-gray-900">Livraison planifiée</div>
 <div className="text-sm text-gray-500">Île-de-France, 24-48h</div>
 <div className="text-sm font-medium text-green-600">3,99 €</div>
 </div>
 </label>
 
 <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-500">
 <input
 type="radio"
 name="deliveryMode"
 value="express"
 checked={deliveryMode === 'express'}
 onChange={(e) => {
 const newMode = e.target.value as 'planned' | 'express' | 'outside_idf'
 setDeliveryMode(newMode)
 // Réinitialiser le créneau si on passe en mode hors IDF
 if (newMode === 'outside_idf') {
 setDeliverySlot('morning')
 }
 }}
 className="h-4 w-4 text-green-600 focus:ring-green-500"
 />
 <div className="ml-3">
 <div className="font-medium text-gray-900">Livraison express</div>
 <div className="text-sm text-gray-500">45-90 minutes</div>
 <div className="text-sm font-medium text-green-600">5,99 €</div>
 </div>
 </label>
 
 <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-500">
 <input
 type="radio"
 name="deliveryMode"
 value="outside_idf"
 checked={deliveryMode === 'outside_idf'}
 onChange={(e) => {
 const newMode = e.target.value as 'planned' | 'express' | 'outside_idf'
 setDeliveryMode(newMode)
 // Réinitialiser le créneau si on passe en mode hors IDF
 if (newMode === 'outside_idf') {
 setDeliverySlot('morning')
 }
 }}
 className="h-4 w-4 text-green-600 focus:ring-green-500"
 />
 <div className="ml-3">
 <div className="font-medium text-gray-900">Livraison hors Île-de-France</div>
 <div className="text-sm text-gray-500">3-5 jours ouvrés</div>
 <div className="text-sm font-medium text-green-600">8,99 €</div>
 </div>
 </label>
 </div>
 </div>

 {/* Date de livraison */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 Date de livraison
 </label>
 <input
 type="date"
 value={deliveryDate}
 onChange={(e) => setDeliveryDate(e.target.value)}
 min={new Date().toISOString().split('T')[0]}
 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
 />
 </div>

 {/* Créneau horaire - Seulement pour livraison planifiée */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-3">
 Créneau horaire
 {deliveryMode !== 'planned' && (
 <span className="text-sm text-gray-500 ml-2">
 {deliveryMode === 'express' ? '(Livraison immédiate)' : '(Non disponible pour ce type de livraison)'}
 </span>
 )}
 </label>
 <div className="grid grid-cols-3 gap-4">
 {[
 { value: 'morning', label: 'Matin', time: '9h-11h' },
 { value: 'noon', label: 'Midi', time: '12h-14h' },
 { value: 'evening', label: 'Soir', time: '18h-20h' }
 ].map((slot) => (
 <label 
 key={slot.value} 
 className={`flex flex-col items-center p-3 border rounded-lg transition-all ${
 deliveryMode === 'planned' 
 ? 'border-gray-200 cursor-pointer hover:border-green-500' 
 : deliveryMode === 'express'
 ? 'border-blue-100 bg-blue-50 cursor-not-allowed'
 : 'border-gray-100 bg-gray-50 cursor-not-allowed'
 }`}
 >
 <input
 type="radio"
 name="deliverySlot"
 value={slot.value}
 checked={deliverySlot === slot.value}
 onChange={(e) => setDeliverySlot(e.target.value as 'morning' | 'noon' | 'evening')}
 disabled={deliveryMode !== 'planned'}
 className={`h-4 w-4 focus:ring-green-500 ${
 deliveryMode === 'planned' 
 ? 'text-green-600' 
 : deliveryMode === 'express'
 ? 'text-blue-400 cursor-not-allowed'
 : 'text-gray-400 cursor-not-allowed'
 }`}
 />
 <div className="mt-2 text-center">
 <div className={`font-medium ${
 deliveryMode === 'planned' ? 'text-gray-900' : deliveryMode === 'express' ? 'text-blue-400' : 'text-gray-400'
 }`}>
 {slot.label}
 </div>
 <div className={`text-sm ${
 deliveryMode === 'planned' ? 'text-gray-500' : deliveryMode === 'express' ? 'text-blue-400' : 'text-gray-400'
 }`}>
 {slot.time}
 </div>
 </div>
 </label>
 ))}
 </div>
 </div>
 </div>
 </div>

 {/* Bouton de validation */}
 <div className="bg-white rounded-lg shadow-sm p-6">
 <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
 <FiCreditCard className="w-5 h-5 mr-2 text-green-600" />
 Valider la commande
 </h2>
 
 {/* Message d'erreur */}
 {orderError && (
 <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
 <p className="text-sm text-red-800">{orderError}</p>
 </div>
 )}
 
 {/* Bouton de validation */}
 <button
 onClick={handleCreateOrder}
 disabled={isCreatingOrder}
 className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
 >
 {isCreatingOrder ? (
 <>
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 <span>Création de la commande...</span>
 </>
 ) : (
 <>
 <FiCreditCard className="w-5 h-5" />
 <span>Valider la commande ({calculateTotal().toFixed(2)} €)</span>
 </>
 )}
 </button>
 
 <p className="text-sm text-gray-500 mt-3 text-center">
 Vous serez redirigé vers Stripe pour le paiement sécurisé
 </p>
 </div>
 </div>

 {/* Résumé de la commande */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
 <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
 
 {/* Articles */}
 <div className="space-y-3 mb-6">
 {cart.map((item) => (
 <div key={item._id} className="flex items-center space-x-3">
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
 {(item.price * item.quantity).toFixed(2)} €
 </div>
 </div>
 ))}
 </div>

 {/* Totaux */}
 <div className="border-t border-gray-200 pt-4 space-y-3">
 <div className="flex justify-between text-gray-600">
 <span>Sous-total</span>
 <span>{calculateSubtotal().toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-gray-600">
 <span>
 Livraison {
 deliveryMode === 'planned' ? 'planifiée' : 
 deliveryMode === 'express' ? 'express' : 
 'hors Île-de-France'
 }
 </span>
 <span>{calculateDeliveryFee().toFixed(2)} €</span>
 </div>
 
 {/* Informations de livraison */}
 <div className="bg-gray-50 rounded-lg p-3 text-sm">
 <div className="text-gray-700 font-medium mb-1">
 Détails de livraison :
 </div>
 <div className="text-gray-600 space-y-1">
 {deliveryMode !== 'express' && (
 <div> {new Date(deliveryDate).toLocaleDateString('fr-FR')}</div>
 )}
 {deliveryMode === 'planned' && (
 <div> {deliverySlot === 'morning' ? '9h-11h' : deliverySlot === 'noon' ? '12h-14h' : '18h-20h'}</div>
 )}
 <div> {
 deliveryMode === 'planned' ? 'Île-de-France (24-48h)' : 
 deliveryMode === 'express' ? 'Île-de-France (45-90 min)' : 
 'Hors Île-de-France (3-5 jours)'
 }</div>
 </div>
 </div>
 
 <div className="flex justify-between text-gray-600">
 <span>TVA (20%)</span>
 <span>{calculateTaxes().toFixed(2)} €</span>
 </div>
 <div className="border-t border-gray-200 pt-3">
 <div className="flex justify-between text-lg font-bold text-gray-900">
 <span>Total</span>
 <span>{calculateTotal().toFixed(2)} €</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}
