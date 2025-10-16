'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { FiHeart, FiLogOut, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi'


interface NavigationProps {
 showSearch?: boolean
 className?: string
}

export default function Navigation({ showSearch = true, className = '' }: NavigationProps) {
 const { user, isAuthenticated, isLivreur, logout } = useAuth()
 const { getCartCount } = useCart()
 const [searchQuery, setSearchQuery] = useState('')

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault()
 if (searchQuery.trim()) {
 // Rediriger vers la page des produits avec la recherche
 window.location.href = `/produits?search=${encodeURIComponent(searchQuery.trim())}`
 }
 }

 const handleLogout = () => {
 logout()
 }

 return (
 <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {/* Logo */}
 <div className="flex items-center space-x-3">
 {isLivreur ? (
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
 <span className="text-white font-bold text-lg">H</span>
 </div>
 <div>
 <h1 className="text-xl font-bold text-gray-900">H-Market</h1>
 <p className="text-xs text-gray-500 -mt-1">Espace Livreur</p>
 </div>
 </div>
 ) : (
 <Link href="/" className="flex items-center space-x-3">
 <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
 <span className="text-white font-bold text-lg">H</span>
 </div>
 <div>
 <h1 className="text-xl font-bold text-gray-900">H-Market</h1>
 <p className="text-xs text-gray-500 -mt-1">Saveurs d'Afrique</p>
 </div>
 </Link>
 )}
 </div>

 {/* Navigation - Masquée pour les livreurs */}
 {!isLivreur && (
 <nav className="hidden md:flex items-center space-x-8">
 <Link href="/" className="text-gray-900 hover:text-green-600 font-medium">
 Accueil
 </Link>
 <Link href="/produits" className="text-gray-900 hover:text-green-600 font-medium">
 Produits
 </Link>
 <Link href="/about" className="text-gray-900 hover:text-green-600 font-medium">
 À propos
 </Link>
 <Link href="/contact" className="text-gray-900 hover:text-green-600 font-medium">
 Contact
 </Link>
 </nav>
 )}

 {/* Search Bar - Masquée pour les livreurs */}
 {showSearch && !isLivreur && (
 <div className="flex-1 max-w-md mx-8">
 <form onSubmit={handleSearch} className="relative">
 <input
 type="text"
 placeholder="Rechercher un produit..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
 />
 <button
 type="submit"
 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
 >
 <FiSearch className="w-5 h-5" />
 </button>
 </form>
 </div>
 )}

 {/* User Actions */}
 <div className="flex items-center space-x-4">
 {/* Panier - Masqué pour les livreurs */}
 {!isLivreur && (
 <>
 <Link href="/panier" className="text-gray-600 hover:text-green-600 relative">
 <FiShoppingCart className="w-6 h-6" />
 <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
 {getCartCount()}
 </span>
 </Link>

 {/* Favoris */}
 <button className="text-gray-600 hover:text-green-600">
 <FiHeart className="w-6 h-6" />
 </button>
 </>
 )}

 {/* État de connexion */}
 {isAuthenticated ? (
 <div className="flex items-center space-x-3">
 {/* Menu utilisateur */}
 <div className="relative group">
 <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors">
 <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
 <FiUser className="w-4 h-4 text-green-600" />
 </div>
 <span className="hidden sm:block text-sm font-medium">
 {user?.name.first}
 </span>
 </button>
 
 {/* Dropdown menu */}
 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
 <div className="py-2">
 <div className="px-4 py-2 border-b border-gray-100">
 <p className="text-sm font-medium text-gray-900">
 {user?.name.first} {user?.name.last}
 </p>
 <p className="text-xs text-gray-500">{user?.email}</p>
 <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full capitalize">
 {user?.role}
 </span>
 </div>
 
 {!isLivreur && (
 <Link
 href="/profile"
 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
 >
 Mon profil
 </Link>
 )}
 
 {isLivreur && (
 <Link
 href="/livreur/dashboard"
 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
 >
 Dashboard Livreur
 </Link>
 )}
 
 <button
 onClick={handleLogout}
 className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
 >
 <FiLogOut className="w-4 h-4" />
 <span>Déconnexion</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 ) : (
 <div className="flex items-center space-x-3">
 <Link
 href="/auth/login"
 className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-medium transition-colors"
 >
 Connexion
 </Link>
 <Link
 href="/auth/register"
 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
 >
 Inscription
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 </header>
 )
}
