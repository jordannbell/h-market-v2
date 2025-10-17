'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/hooks/useCart'
import { FiHeart, FiLogOut, FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHome, FiPackage, FiInfo, FiMail } from 'react-icons/fi'


interface NavigationProps {
 showSearch?: boolean
 className?: string
}

export default function Navigation({ showSearch = true, className = '' }: NavigationProps) {
 const { user, isAuthenticated, isLivreur, logout } = useAuth()
 const { getCartCount } = useCart()
 const [searchQuery, setSearchQuery] = useState('')
 const [isMenuOpen, setIsMenuOpen] = useState(false)
 const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
 const userMenuRef = useRef<HTMLDivElement>(null)

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault()
 if (searchQuery.trim()) {
 // Rediriger vers la page des produits avec la recherche
 window.location.href = `/produits?search=${encodeURIComponent(searchQuery.trim())}`
 }
 }

 const handleLogout = () => {
 logout()
 setIsUserMenuOpen(false)
 setIsMenuOpen(false)
 }

 // Fermer le menu utilisateur quand on clique en dehors
 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
 setIsUserMenuOpen(false)
 }
 }

 document.addEventListener('mousedown', handleClickOutside)
 return () => document.removeEventListener('mousedown', handleClickOutside)
 }, [])

 return (
 <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between h-16">
 {/* Logo */}
 <div className="flex items-center space-x-3 flex-shrink-0">
 {isLivreur ? (
 <div className="flex items-center space-x-2">
 <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
 <span className="text-white font-bold text-lg">H</span>
 </div>
 <div className="hidden sm:block">
 <h1 className="text-xl font-bold text-gray-900">H-Market</h1>
 <p className="text-xs text-gray-500 -mt-1">Espace Livreur</p>
 </div>
 </div>
 ) : (
 <Link href="/" className="flex items-center space-x-2">
 <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-sm">
 <span className="text-white font-bold text-lg">H</span>
 </div>
 <div className="hidden sm:block">
 <h1 className="text-xl font-bold text-gray-900">H-Market</h1>
 <p className="text-xs text-gray-500 -mt-1">Saveurs d'Afrique</p>
 </div>
 </Link>
 )}
 </div>

 {/* Navigation Desktop - Masquée pour les livreurs */}
 {!isLivreur && (
 <nav className="hidden lg:flex items-center space-x-8">
 <Link href="/" className="text-gray-900 hover:text-green-600 font-medium transition-colors">
 Accueil
 </Link>
 <Link href="/produits" className="text-gray-900 hover:text-green-600 font-medium transition-colors">
 Produits
 </Link>
 <Link href="/about" className="text-gray-900 hover:text-green-600 font-medium transition-colors">
 À propos
 </Link>
 <Link href="/contact" className="text-gray-900 hover:text-green-600 font-medium transition-colors">
 Contact
 </Link>
 </nav>
 )}

 {/* Search Bar Desktop - Masquée pour les livreurs et mobile */}
 {showSearch && !isLivreur && (
 <div className="hidden md:flex flex-1 max-w-md mx-8">
 <form onSubmit={handleSearch} className="relative w-full">
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
 <div className="flex items-center space-x-2 sm:space-x-4">
 {/* Panier - Masqué pour les livreurs */}
 {!isLivreur && (
 <>
 <Link href="/panier" className="text-gray-600 hover:text-green-600 relative p-2">
 <FiShoppingCart className="w-6 h-6" />
 {getCartCount() > 0 && (
 <span className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
 {getCartCount()}
 </span>
 )}
 </Link>

 {/* Favoris - Masqué sur mobile */}
 <button className="hidden sm:block text-gray-600 hover:text-green-600 p-2">
 <FiHeart className="w-6 h-6" />
 </button>
 </>
 )}

 {/* État de connexion */}
 {isAuthenticated ? (
 <div className="flex items-center space-x-3">
 {/* Menu utilisateur - Version cliquable */}
 <div className="relative" ref={userMenuRef}>
 <button 
 onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
 className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors p-2"
 >
 <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
 <FiUser className="w-4 h-4 text-green-600" />
 </div>
 <span className="hidden sm:block text-sm font-medium">
 {user?.name.first}
 </span>
 </button>
 
 {/* Dropdown menu */}
 {isUserMenuOpen && (
 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in">
 <div className="py-2">
 <div className="px-4 py-3 border-b border-gray-100">
 <p className="text-sm font-medium text-gray-900">
 {user?.name.first} {user?.name.last}
 </p>
 <p className="text-xs text-gray-500 truncate">{user?.email}</p>
 <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full capitalize">
 {user?.role}
 </span>
 </div>
 
 {!isLivreur && (
 <Link
 href="/profile"
 onClick={() => setIsUserMenuOpen(false)}
 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
 >
 Mon profil
 </Link>
 )}

 {!isLivreur && (
 <Link
 href="/mes-commandes"
 onClick={() => setIsUserMenuOpen(false)}
 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
 >
 Mes commandes
 </Link>
 )}
 
 {isLivreur && (
 <Link
 href="/livreur/dashboard"
 onClick={() => setIsUserMenuOpen(false)}
 className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
 >
 Dashboard Livreur
 </Link>
 )}
 
 <button
 onClick={handleLogout}
 className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
 >
 <FiLogOut className="w-4 h-4" />
 <span>Déconnexion</span>
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="flex items-center space-x-2">
 <Link
 href="/auth/login"
 className="border border-green-600 text-green-600 hover:bg-green-50 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm"
 >
 <span className="hidden sm:inline">Connexion</span>
 <FiUser className="w-5 h-5 sm:hidden" />
 </Link>
 <Link
 href="/auth/register"
 className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm hidden sm:inline-block"
 >
 Inscription
 </Link>
 </div>
 )}

 {/* Menu hamburger - Mobile uniquement */}
 {!isLivreur && (
 <button
 onClick={() => setIsMenuOpen(!isMenuOpen)}
 className="lg:hidden text-gray-600 hover:text-green-600 p-2"
 >
 {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
 </button>
 )}
 </div>
 </div>
 </div>

 {/* Menu Mobile */}
 {!isLivreur && isMenuOpen && (
 <div className="lg:hidden border-t border-gray-200 bg-white">
 {/* Barre de recherche mobile */}
 {showSearch && (
 <div className="px-4 py-3 border-b border-gray-200">
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

 {/* Navigation Links */}
 <nav className="py-2">
 <Link
 href="/"
 onClick={() => setIsMenuOpen(false)}
 className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
 >
 <FiHome className="w-5 h-5" />
 <span className="font-medium">Accueil</span>
 </Link>
 <Link
 href="/produits"
 onClick={() => setIsMenuOpen(false)}
 className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
 >
 <FiPackage className="w-5 h-5" />
 <span className="font-medium">Produits</span>
 </Link>
 <Link
 href="/about"
 onClick={() => setIsMenuOpen(false)}
 className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
 >
 <FiInfo className="w-5 h-5" />
 <span className="font-medium">À propos</span>
 </Link>
 <Link
 href="/contact"
 onClick={() => setIsMenuOpen(false)}
 className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors"
 >
 <FiMail className="w-5 h-5" />
 <span className="font-medium">Contact</span>
 </Link>
 </nav>
 </div>
 )}
 </header>
 )
}
