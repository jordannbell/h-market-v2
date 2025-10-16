'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useCart } from '@/hooks/useCart'
import { FiArrowLeft, FiCheck, FiMinus, FiPlus, FiShoppingCart, FiTrash2 } from 'react-icons/fi'


export default function CartPage() {
 const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
 const [isCheckingOut, setIsCheckingOut] = useState(false)

 const handleCheckout = () => {
 setIsCheckingOut(true)
 // TODO: Implémenter le processus de commande
 setTimeout(() => {
 setIsCheckingOut(false)
 clearCart()
 }, 2000)
 }

 if (cart.length === 0) {
 return (
 <div className="min-h-screen bg-green-50">
 <Navigation showSearch={false} />
 
 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
 <div className="text-center">
 <div className="mb-6">
 <FiShoppingCart className="w-24 h-24 text-gray-400 mx-auto" />
 </div>
 <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
 <p className="text-lg text-gray-600 mb-8">
 Découvrez nos produits et commencez vos achats
 </p>
 <Link
 href="/produits"
 className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
 >
 <FiArrowLeft className="w-5 h-5" />
 <span>Voir nos produits</span>
 </Link>
 </div>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-green-50">
 <Navigation showSearch={false} />
 
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
 {/* Header */}
 <div className="flex items-center justify-between mb-8">
 <div>
 <h1 className="text-3xl font-bold text-gray-900">Votre Panier</h1>
 <p className="text-gray-600 mt-2">
 {cart.length} article{cart.length !== 1 ? 's' : ''} dans votre panier
 </p>
 </div>
 <button
 onClick={clearCart}
 className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
 >
 <FiTrash2 className="w-4 h-4" />
 <span>Vider le panier</span>
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Liste des articles */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-lg shadow-sm">
 {cart.map((item) => (
 <div key={item._id} className="flex items-center space-x-4 p-6 border-b border-gray-200 last:border-b-0">
 {/* Image */}
 <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
 <img
 src={item.image}
 alt={item.title}
 className="w-full h-full object-cover"
 />
 </div>

 {/* Informations */}
 <div className="flex-1 min-w-0">
 <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
 {item.title}
 </h3>
 <p className="text-lg font-bold text-green-600">
 {item.price.toFixed(2)} €
 </p>
 </div>

 {/* Quantité */}
 <div className="flex items-center space-x-2">
 <button
 onClick={() => updateQuantity(item._id, item.quantity - 1)}
 className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
 >
 <FiMinus className="w-4 h-4 text-gray-600" />
 </button>
 <span className="w-12 text-center font-medium">{item.quantity}</span>
 <button
 onClick={() => updateQuantity(item._id, item.quantity + 1)}
 className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
 >
 <FiPlus className="w-4 h-4 text-gray-600" />
 </button>
 </div>

 {/* Total et suppression */}
 <div className="text-right">
 <p className="text-lg font-bold text-gray-900 mb-2">
 {(item.price * item.quantity).toFixed(2)} €
 </p>
 <button
 onClick={() => removeFromCart(item._id)}
 className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
 >
 <FiTrash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Résumé de la commande */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
 <h2 className="text-xl font-semibold text-gray-900 mb-6">Résumé de la commande</h2>
 
 <div className="space-y-4 mb-6">
 <div className="flex justify-between text-gray-600">
 <span>Sous-total</span>
 <span>{getCartTotal().toFixed(2)} €</span>
 </div>
 <div className="flex justify-between text-gray-600">
 <span>Livraison</span>
 <span>Gratuite</span>
 </div>
 <div className="border-t border-gray-200 pt-4">
 <div className="flex justify-between text-lg font-bold text-gray-900">
 <span>Total</span>
 <span>{getCartTotal().toFixed(2)} €</span>
 </div>
 </div>
 </div>

 <Link
 href="/checkout"
 className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
 >
 <FiCheck className="w-5 h-5" />
 <span>Passer la commande</span>
 </Link>

 <div className="mt-4 text-center">
 <Link
 href="/produits"
 className="text-green-600 hover:text-green-700 font-medium text-sm"
 >
 Continuer mes achats
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 )
}

