'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { FiArrowRight, FiAward, FiCamera, FiClock, FiHeart, FiMail, FiMapPin, FiMessageSquare, FiPackage, FiShield, FiShoppingCart, FiSmartphone, FiStar, FiTruck, FiTwitter, FiUsers } from 'react-icons/fi'


interface Product {
 _id: string
 title: string
 price: number
 images: string[]
 category: string
 originCountry: string
 slug: string
 isFeatured?: boolean
 unit?: string
 stock?: number
}

export default function HomePage() {
 const [products, setProducts] = useState<Product[]>([])
 const [loading, setLoading] = useState(true)
 const { addToCart, isInCart, cart, updateQuantity } = useCart()
 const { user, isAuthenticated, loading: authLoading, isLivreur } = useAuth()
 const router = useRouter()
 
 // Carousel state and logic
 const [currentIndex, setCurrentIndex] = useState(0)
 const [isHovered, setIsHovered] = useState(false)
 const carouselRef = useRef<HTMLDivElement>(null)
 
 // Second carousel state and logic
 const [currentIndex2, setCurrentIndex2] = useState(0)
 const [isHovered2, setIsHovered2] = useState(false)
 const carouselRef2 = useRef<HTMLDivElement>(null)
 
 // Redirection automatique pour les livreurs
 useEffect(() => {
 if (!authLoading && isAuthenticated && isLivreur) {
 console.log('Livreur connecté détecté, redirection vers le dashboard')
 router.push('/livreur/dashboard')
 }
 }, [authLoading, isAuthenticated, isLivreur, router])

 // Gérer l'hydratation côté client
 useEffect(() => {
 setIsClient(true)
 }, [])
 
 // Categories data
 const categories = [
 { 
 name: "Attieké", 
 image: "https://i.ibb.co/bRdqfwnG/2150812801.jpg",
 color: "bg-yellow-500" 
 },
 { 
 name: "Plantain", 
 image: "https://i.ibb.co/1GHWtxwV/77581.jpg",
 color: "bg-green-500" 
 },
 { 
 name: "Épices", 
 image: "https://i.ibb.co/8gDS5szB/3306.jpg",
 color: "bg-red-500" 
 },
 { 
 name: "Sauces", 
 image: "https://i.ibb.co/bRdqfwnG/2150812801.jpg",
 color: "bg-orange-500" 
 },
 { 
 name: "Légumes", 
 image: "https://i.ibb.co/1GHWtxwV/77581.jpg",
 color: "bg-green-600" 
 },
 { 
 name: "Boissons", 
 image: "https://i.ibb.co/8gDS5szB/3306.jpg",
 color: "bg-blue-500" 
 }
 ]
 
 // Second carousel categories data
 const categories2 = [
 { 
 name: 'Fruits & Légumes', 
 image: 'https://i.ibb.co/1GHWtxwV/77581.jpg',
 color: 'from-red-400 to-red-600',
 bgColor: 'bg-red-50 hover:bg-red-100',
 borderColor: 'hover:border-red-200',
 textColor: 'group-hover:text-red-600'
 },
 { 
 name: 'Épices & Condiments', 
 image: 'https://i.ibb.co/8gDS5szB/3306.jpg',
 color: 'from-orange-400 to-red-500',
 bgColor: 'bg-orange-50 hover:bg-orange-100',
 borderColor: 'hover:border-orange-200',
 textColor: 'group-hover:text-orange-600'
 },
 { 
 name: 'Céréales & Grains', 
 image: 'https://i.ibb.co/bRdqfwnG/2150812801.jpg',
 color: 'from-yellow-400 to-orange-500',
 bgColor: 'bg-yellow-50 hover:bg-yellow-100',
 borderColor: 'hover:border-yellow-200',
 textColor: 'group-hover:text-yellow-600'
 },
 { 
 name: 'Boissons', 
 image: 'https://i.ibb.co/8gDS5szB/3306.jpg',
 color: 'from-blue-400 to-blue-600',
 bgColor: 'bg-blue-50 hover:bg-blue-100',
 borderColor: 'hover:border-blue-200',
 textColor: 'group-hover:text-blue-600'
 },
 { 
 name: 'Huiles & Beurres', 
 image: 'https://i.ibb.co/1GHWtxwV/77581.jpg',
 color: 'from-green-400 to-green-600',
 bgColor: 'bg-green-50 hover:bg-green-100',
 borderColor: 'hover:border-green-200',
 textColor: 'group-hover:text-green-600'
 },
 { 
 name: 'Produits Transformés', 
 image: 'https://i.ibb.co/bRdqfwnG/2150812801.jpg',
 color: 'from-purple-400 to-purple-600',
 bgColor: 'bg-purple-50 hover:bg-purple-100',
 borderColor: 'hover:border-purple-200',
 textColor: 'group-hover:text-purple-600'
 }
 ]
 
 // Responsive items per view
 const [itemsPerView, setItemsPerView] = useState(4)
 
 // Newsletter state
 const [newsletterEmail, setNewsletterEmail] = useState('')
 const [isClient, setIsClient] = useState(false)
 
 // Auto-scroll function
 const scrollCarousel = (direction: number) => {
 const maxIndex = categories.length - itemsPerView
 if (direction === 1) {
 setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1)
 } else {
 setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1)
 }
 }
 
 // Second carousel auto-scroll function
 const scrollCarousel2 = (direction: number) => {
 const maxIndex = categories2.length - itemsPerView
 if (direction === 1) {
 setCurrentIndex2(prev => prev >= maxIndex ? 0 : prev + 1)
 } else {
 setCurrentIndex2(prev => prev <= 0 ? maxIndex : prev - 1)
 }
 }

 // Debug: Afficher l'état de l'authentification
 useEffect(() => {
 // Log simplifié pour éviter les erreurs
 if (isAuthenticated) {
 console.log('HomePage - Utilisateur connecté:', user?.email)
 }
 }, [isAuthenticated, user])

 useEffect(() => {
 fetchProducts()
 }, [])
 
 // Auto-scroll effect
 useEffect(() => {
 const interval = setInterval(() => {
 if (!isHovered) {
 scrollCarousel(1)
 }
 }, 2000) // 2 seconds per jump
 
 return () => clearInterval(interval)
 }, [isHovered])
 
 // Second carousel auto-scroll effect
 useEffect(() => {
 const interval2 = setInterval(() => {
 if (!isHovered2) {
 scrollCarousel2(1)
 }
 }, 2000) // 2 seconds per jump
 
 return () => clearInterval(interval2)
 }, [isHovered2])
 
 // Responsive effect
 useEffect(() => {
 const handleResize = () => {
 if (window.innerWidth < 768) {
 setItemsPerView(1)
 } else {
 setItemsPerView(4)
 }
 }
 
 handleResize()
 window.addEventListener('resize', handleResize)
 return () => window.removeEventListener('resize', handleResize)
 }, [])

 const fetchProducts = async () => {
 try {
 const response = await fetch('/api/products?limit=8')
 if (response.ok) {
 const data = await response.json()
 setProducts(data.products)
 }
 } catch (error) {
 console.error('Erreur lors du chargement des produits:', error)
 } finally {
 setLoading(false)
 }
 }

 const handleAddToCart = (product: Product) => {
 addToCart(product)
 }
 
 const handleNewsletterSubmit = (e: React.FormEvent) => {
 e.preventDefault()
 if (newsletterEmail) {
 // Ici vous pouvez ajouter la logique pour envoyer l'email
 console.log('Newsletter subscription:', newsletterEmail)
 setNewsletterEmail('')
 // Vous pouvez ajouter une notification de succès ici
 }
 }

 // Si un livreur est connecté, ne pas afficher le contenu de la page d'accueil
 if (!authLoading && isAuthenticated && isLivreur) {
 return (
 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Redirection vers votre dashboard...</p>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-white">
 {/* Header */}
 <Navigation />

 {/* Hero Section - Darty Style */}
 <section className="bg-white">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
 {/* Main Hero Banner - Darty Style */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
 {/* Left Column - Large Banner with Background Image */}
 <div className="lg:col-span-2">
 <div 
 className="bg-cover bg-center bg-no-repeat rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden min-h-[300px] sm:min-h-[400px] flex items-center"
 style={{
 backgroundImage: 'url("https://i.ibb.co/bRdqfwnG/2150812801.jpg")'
 }}
 >
 {/* Dark Overlay for Better Text Readability */}
 <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 rounded-2xl"></div>
 
 {/* Product Info */}
 <div className="relative z-10 w-full">
 <div className="flex items-center space-x-2 mb-3 sm:mb-4">
 <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center">
 <span className="text-green-800 font-bold"></span>
 </div>
 <span className="text-lg sm:text-2xl font-bold text-yellow-300">ATTIEKÉ PREMIUM</span>
 </div>
 <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 drop-shadow-lg">
 Semoule de manioc
 </h1>
 <p className="text-base sm:text-xl text-green-100 mb-4 sm:mb-6 drop-shadow-md">
 Disponible en livraison express
 </p>
 
 {/* CTA Button */}
 <Link
 href="/produits/attieke"
 className="inline-block bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors duration-300 shadow-lg text-sm sm:text-base"
 >
 Commander maintenant
 </Link>
 </div>
 
 {/* Decorative Elements */}
 <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-yellow-400/20 rounded-full -translate-y-16 translate-x-16"></div>
 </div>
 </div>

 {/* Right Column - Promotional Details */}
 <div className="lg:col-span-1">
 <div className="bg-white border-2 border-green-800 rounded-2xl p-4 sm:p-6 h-full">
 <div className="text-center mb-4 sm:mb-6">
 <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4">
 NOUVEAUTÉ
 </div>
 <div className="text-2xl sm:text-3xl font-bold text-green-800 mb-2">
 À PARTIR DE <span className="text-red-500">4,99€</span>
 </div>
 <div className="text-gray-500 text-xs sm:text-sm">
 au lieu de 6,99€
 </div>
 </div>
 
 <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
 <div className="flex items-start space-x-3">
 <span className="text-green-700 font-bold text-lg">✓</span>
 <span className="text-xs sm:text-sm text-gray-700">
 Livraison gratuite dès 30€ d'achat
 </span>
 </div>
 <div className="flex items-start space-x-3">
 <span className="text-green-700 font-bold text-lg">✓</span>
 <span className="text-xs sm:text-sm text-gray-700">
 Qualité garantie 100% authentique
 </span>
 </div>
 <div className="flex items-start space-x-3">
 <span className="text-green-700 font-bold text-lg">✓</span>
 <span className="text-xs sm:text-sm text-gray-700">
 Produit importé directement d'Afrique
 </span>
 </div>
 </div>
 
 <Link
 href="/produits"
 className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 sm:py-3 rounded-xl text-center transition-colors duration-300 text-sm sm:text-base"
 >
 JE COMMANDE
 </Link>
 </div>
 </div>
 </div>

 {/* Secondary Product Links - Darty Style */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-8">
 <Link
 href="/produits/plantain"
 className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 text-center group"
 >
 <div className="w-full h-28 sm:h-32 lg:h-40 mb-3 sm:mb-4 rounded-xl overflow-hidden relative">
 <img 
 src="https://i.ibb.co/1GHWtxwV/77581.jpg" 
 alt="Plantain Bio"
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
 />
 <div className="absolute inset-0 bg-green-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
 </div>
 <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Plantain Bio</h3>
 <p className="text-xs sm:text-sm text-gray-600">Banane plantain fraîche</p>
 </Link>
 
 <Link
 href="/produits/epices"
 className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 text-center group"
 >
 <div className="w-full h-28 sm:h-32 lg:h-40 mb-3 sm:mb-4 rounded-xl overflow-hidden relative">
 <img 
 src="https://i.ibb.co/8gDS5szB/3306.jpg" 
 alt="Épices du Sénégal"
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
 />
 <div className="absolute inset-0 bg-red-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
 </div>
 <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Épices du Sénégal</h3>
 <p className="text-xs sm:text-sm text-gray-600">Mélange d'épices authentiques</p>
 </Link>
 
 <Link
 href="/produits/mafe"
 className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 text-center group sm:col-span-2 md:col-span-1"
 >
 <div className="w-full h-28 sm:h-32 lg:h-40 mb-3 sm:mb-4 rounded-xl overflow-hidden relative">
 <img 
 src="https://i.ibb.co/bRdqfwnG/2150812801.jpg" 
 alt="Sauce Mafé"
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
 />
 <div className="absolute inset-0 bg-orange-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
 </div>
 <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Sauce Mafé</h3>
 <p className="text-xs sm:text-sm text-gray-600">Sauce d'arachide malienne</p>
 </Link>
 </div>

 {/* Flash Offers Section - Darty Style */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
 <div className="bg-red-700 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden min-h-[180px]">
 <div className="absolute top-2 right-2 bg-white/20 rounded-full px-2 py-1 text-xs font-bold">
 DURÉE LIMITÉE
 </div>
 <div className="relative z-10">
 <div className="text-base sm:text-lg font-bold mb-2">SUPER OFFRE FLASH</div>
 <div className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">Sur les produits frais</div>
 <div className="text-xs sm:text-sm mb-3 sm:mb-4">
 Attieké, plantain, légumes africains
 </div>
 <Link
 href="/produits/frais"
 className="inline-block bg-white text-red-700 font-bold px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 text-xs sm:text-sm"
 >
 Découvrir
 </Link>
 </div>
 <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
 </div>

 <div className="bg-red-700 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden min-h-[180px]">
 <div className="absolute top-2 right-2 bg-white/20 rounded-full px-2 py-1 text-xs font-bold">
 DURÉE LIMITÉE
 </div>
 <div className="relative z-10">
 <div className="text-base sm:text-lg font-bold mb-2">SUPER OFFRE FLASH</div>
 <div className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">sur une sélection d'épices</div>
 <div className="text-xs sm:text-sm mb-3 sm:mb-4">
 Épices, condiments, sauces africaines
 </div>
 <Link
 href="/produits/epices"
 className="inline-block bg-white text-red-700 font-bold px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-300 text-xs sm:text-sm"
 >
 Découvrir
 </Link>
 </div>
 <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
 </div>
 </div>
 </div>
 </section>

 {/* Categories Section - Carousel Style */}
 <section className="bg-gray-50 py-8 sm:py-12">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-6 sm:mb-8">
 <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Nos Catégories</h2>
 <p className="text-sm sm:text-base text-gray-600">Découvrez tous nos produits africains authentiques</p>
 </div>
 
 <div className="relative">
 {/* Navigation Arrows */}
 <button 
 onClick={() => scrollCarousel(-1)}
 className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-300 -ml-4"
 >
 <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 </button>
 
 <button 
 onClick={() => scrollCarousel(1)}
 className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-300 -mr-4"
 >
 <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>

 {/* Carousel Container */}
 <div 
 ref={carouselRef}
 className="overflow-hidden"
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}
 >
 <div 
 className="flex transition-transform duration-500 ease-in-out gap-4"
 style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
 >
 {categories.map((category, index) => (
 <Link
 key={index}
 href={`/produits?categorie=${category.name.toLowerCase()}`}
 className="bg-white rounded-xl p-4 text-center hover:shadow-lg transition-shadow duration-300 border border-gray-200 group flex-shrink-0"
 style={{ width: `${100 / itemsPerView}%` }}
 >
 <div className="w-full h-32 lg:h-40 rounded-xl mb-4 overflow-hidden relative">
 <img 
 src={category.image} 
 alt={category.name}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
 />
 <div className={`absolute inset-0 ${category.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
 </div>
 <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
 </Link>
 ))}
 </div>
 </div>

 {/* Dots Indicator */}
 <div className="flex justify-center mt-6 space-x-2">
 {Array.from({ length: Math.ceil(categories.length / itemsPerView) }).map((_, index) => (
 <button
 key={index}
 onClick={() => setCurrentIndex(index)}
 className={`w-2 h-2 rounded-full transition-colors duration-300 ${
 index === Math.floor(currentIndex / itemsPerView) ? 'bg-green-600' : 'bg-gray-300'
 }`}
 />
 ))}
 </div>
 </div>
 </div>
 </section>

 {/* Features Section - Darty Style */}
 <section className="py-8 sm:py-12 lg:py-16 bg-white">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-8 sm:mb-12">
 <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Nos Services</h2>
 <p className="text-sm sm:text-base text-gray-600">Votre satisfaction est notre priorité</p>
 </div>

 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
 <div className="text-center">
 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-700 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
 <FiTruck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
 </div>
 <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Livraison 24h</h3>
 <p className="text-xs sm:text-sm text-gray-600">En Île-de-France</p>
 </div>

 <div className="text-center">
 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
 <FiShield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
 </div>
 <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Qualité Garantie</h3>
 <p className="text-xs sm:text-sm text-gray-600">100% authentique</p>
 </div>

 <div className="text-center">
 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
 <FiUsers className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
 </div>
 <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Support Client</h3>
 <p className="text-xs sm:text-sm text-gray-600">7j/7 disponible</p>
 </div>

 <div className="text-center">
 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
 <FiHeart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
 </div>
 <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Satisfaction</h3>
 <p className="text-xs sm:text-sm text-gray-600">4.9/5 étoiles</p>
 </div>
 </div>
 </div>
 </section>

 {/* Categories Preview - Modern Grid */}
 <section className="py-8 sm:py-12 lg:py-16 xl:py-24 bg-white relative overflow-hidden">
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-5">
 <div className="absolute top-20 left-10 w-64 h-64 bg-green-500 rounded-full blur-3xl"></div>
 <div className="absolute bottom-20 right-10 w-64 h-64 bg-yellow-500 rounded-full blur-3xl"></div>
 </div>

 <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Header */}
 <div className="text-center mb-8 sm:mb-12 lg:mb-16">
 <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-yellow-100 text-green-800 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
 <span>🌍</span>
 <span>Nos catégories</span>
 </div>
 <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
 Explorez nos 
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-yellow-600"> saveurs authentiques</span>
 </h2>
 <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
 Des épices parfumées aux céréales traditionnelles, découvrez toute la richesse culinaire africaine
 </p>
 </div>

 {/* Second Carousel Container */}
 <div className="relative">
 {/* Navigation Arrows */}
 <button 
 onClick={() => scrollCarousel2(-1)}
 className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-300 -ml-4"
 >
 <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
 </svg>
 </button>
 
 <button 
 onClick={() => scrollCarousel2(1)}
 className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-300 -mr-4"
 >
 <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </button>

 {/* Carousel Container */}
 <div 
 ref={carouselRef2}
 className="overflow-hidden"
 onMouseEnter={() => setIsHovered2(true)}
 onMouseLeave={() => setIsHovered2(false)}
 >
 <div 
 className="flex transition-transform duration-500 ease-in-out gap-6 lg:gap-8"
 style={{ transform: `translateX(-${currentIndex2 * (100 / itemsPerView)}%)` }}
 >
 {categories2.map((category, index) => (
 <Link
 key={index}
 href={`/produits?category=${encodeURIComponent(category.name)}`}
 className={`group relative ${category.bgColor} rounded-3xl p-6 lg:p-8 text-center transition-all duration-500 border border-gray-100 ${category.borderColor} transform hover:-translate-y-2 hover:shadow-2xl flex-shrink-0`}
 style={{ width: `${100 / itemsPerView}%` }}
 >
 {/* Image Container */}
 <div className="w-full h-32 lg:h-40 rounded-2xl mb-4 overflow-hidden relative">
 <img 
 src={category.image} 
 alt={category.name}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
 />
 <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
 </div>
 
 {/* Category Name */}
 <h3 className={`font-bold text-lg lg:text-xl text-gray-900 mb-2 ${category.textColor} transition-colors duration-300`}>
 {category.name}
 </h3>
 
 {/* Hover Arrow */}
 <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
 <FiArrowRight className="w-5 h-5 mx-auto text-gray-600" />
 </div>

 {/* Floating Badge */}
 <div className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 <span className="text-xs font-bold text-green-600">→</span>
 </div>
 </Link>
 ))}
 </div>
 </div>

 {/* Dots Indicator */}
 <div className="flex justify-center mt-6 space-x-2">
 {Array.from({ length: Math.ceil(categories2.length / itemsPerView) }).map((_, index) => (
 <button
 key={index}
 onClick={() => setCurrentIndex2(index)}
 className={`w-2 h-2 rounded-full transition-colors duration-300 ${
 index === Math.floor(currentIndex2 / itemsPerView) ? 'bg-green-600' : 'bg-gray-300'
 }`}
 />
 ))}
 </div>
 </div>

 {/* CTA Section */}
 <div className="mt-16 text-center">
 <Link
 href="/produits"
 className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-green-500/25 transform hover:scale-105"
 >
 <span>Voir tous nos produits</span>
 <FiArrowRight className="w-5 h-5" />
 </Link>
 </div>
 </div>
 </section>

 {/* Testimonials Section - Professional */}
 <section className="py-8 sm:py-12 lg:py-16 xl:py-24 bg-gray-50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Header */}
 <div className="text-center mb-8 sm:mb-12 lg:mb-16">
 <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
 <FiMessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
 <span>Témoignages clients</span>
 </div>
 <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
 Ce que disent nos clients satisfaits
 </h2>
 <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
 Plus de 2000 clients nous font confiance pour leurs produits africains authentiques
 </p>
 </div>

 {/* Testimonials Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
 {[
 {
 name: "Marie K.",
 location: "Paris 15e",
 rating: 5,
 text: "L'attieké est absolument délicieux ! Fraîcheur garantie et livraison ultra-rapide. Je recommande vivement H-Market !",
 product: "Attieké Premium"
 },
 {
 name: "Ahmed D.",
 location: "Nanterre",
 rating: 5,
 text: "Enfin des épices africaines authentiques ! La qualité est exceptionnelle et les prix très corrects. Service client au top !",
 product: "Épices du Sénégal"
 },
 {
 name: "Sophie L.",
 location: "Boulogne",
 rating: 5,
 text: "Le plantain est parfait, exactement comme chez ma grand-mère au Cameroun. Livraison en 24h, je suis conquise !",
 product: "Plantain Bio"
 }
 ].map((testimonial, index) => (
 <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
 {/* Rating */}
 <div className="flex items-center space-x-1 mb-4">
 {[...Array(testimonial.rating)].map((_, i) => (
 <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
 ))}
 </div>
 
 {/* Testimonial Text */}
 <p className="text-gray-700 leading-relaxed mb-6">
 "{testimonial.text}"
 </p>
 
 {/* Product Badge */}
 <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
 {testimonial.product}
 </div>
 
 {/* Author */}
 <div className="flex items-center space-x-3">
 <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
 {testimonial.name.charAt(0)}
 </div>
 <div>
 <div className="font-semibold text-gray-900">{testimonial.name}</div>
 <div className="text-gray-500 text-sm">{testimonial.location}</div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Trust Badge */}
 <div className="mt-16 text-center">
 <div className="inline-flex items-center space-x-4 bg-green-600 text-white rounded-2xl px-8 py-4 shadow-lg">
 <FiAward className="w-8 h-8 text-yellow-500" />
 <div className="text-left">
 <div className="font-bold text-lg">4.9/5 sur 2000+ avis</div>
 <div className="text-green-100 text-sm">Google Reviews & Trustpilot</div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Featured Products - Modern Showcase */}
 <section className="py-8 sm:py-12 lg:py-16 xl:py-24 bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Header */}
 <div className="text-center mb-8 sm:mb-12 lg:mb-16">
 <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
 <FiStar className="w-4 h-4" />
 <span>Nos best-sellers</span>
 </div>
 <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
 Les 
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600"> coups de cœur</span> 
 <br className="hidden sm:block" />de nos clients
 </h2>
 <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
 Attieké, plantain, mafé... Découvrez les saveurs qui font le succès de H-Market
 </p>
 </div>

 {loading ? (
 <div className="text-center py-8 sm:py-12">
 <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600 mx-auto"></div>
 <p className="mt-4 text-sm sm:text-base text-gray-600">Chargement des produits...</p>
 </div>
 ) : products.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
 {products.map((product) => (
 <div
 key={product._id}
 className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100"
 >
 {/* Image du produit avec overlay */}
 <div className="relative aspect-square bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
 <img
 src={product.images[0] || '/placeholder-product.jpg'}
 alt={product.title}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 />
 
 {/* Overlay avec badges */}
 <div className="absolute top-3 left-3 flex flex-col space-y-2">
 {product.isFeatured && (
 <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
 <FiStar className="w-4 h-4 text-yellow-500 fill-current mr-1" /> Vedette
 </span>
 )}
 <span className="bg-white/90 backdrop-blur-sm text-green-800 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
 {product.category}
 </span>
 </div>
 
 {/* Badge pays d'origine */}
 <div className="absolute top-3 right-3">
 <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
 {product.originCountry}
 </span>
 </div>
 
 {/* Bouton favoris - à implémenter plus tard */}
 {/* <button className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white p-2 rounded-full shadow-sm">
 <FiHeart className="w-4 h-4 text-red-500" />
 </button> */}
 </div>

 {/* Contenu du produit */}
 <div className="p-5">
 {/* Titre et note */}
 <div className="mb-3">
 <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
 {product.title}
 </h3>
 <div className="flex items-center space-x-1">
 <div className="flex text-yellow-400">
 {[...Array(5)].map((_, i) => (
 <FiStar key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : ''}`} />
 ))}
 </div>
 <span className="text-sm text-gray-500 ml-2">4.5 (24 avis)</span>
 </div>
 </div>

 {/* Prix et unité */}
 <div className="mb-4">
 <div className="flex items-baseline space-x-2">
 <span className="text-2xl font-bold text-green-600">
 {product.price.toFixed(2)} €
 </span>
 <span className="text-sm text-gray-500">/ {product.unit}</span>
 </div>
 {product.stock && product.stock > 0 ? (
 <p className="text-sm text-green-600 font-medium mt-1">
 En stock ({product.stock} disponibles)
 </p>
 ) : (
 <p className="text-sm text-red-600 font-medium mt-1">
 Rupture de stock
 </p>
 )}
 </div>

 {/* Sélecteur de quantité */}
 <div className="space-y-3">
 <div className="flex items-center justify-center space-x-3">
 {/* Bouton moins */}
 <button
 onClick={() => {
 const currentQuantity = isInCart(product._id) ? 
 (cart.find(item => item._id === product._id)?.quantity || 0) : 0
 if (currentQuantity > 0) {
 updateQuantity(product._id, currentQuantity - 1)
 }
 }}
 className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center border border-gray-200 hover:border-gray-300"
 >
 <span className="text-lg font-bold">−</span>
 </button>

 {/* Icône panier avec compteur */}
 <div className="relative">
 <div className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center border border-green-600 hover:border-green-700">
 <FiShoppingCart className="w-6 h-6" />
 </div>
 {/* Badge avec quantité */}
 {isInCart(product._id) && (
 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
 {cart.find(item => item._id === product._id)?.quantity || 0}
 </span>
 )}
 </div>

 {/* Bouton plus */}
 <button
 onClick={() => {
 const currentQuantity = isInCart(product._id) ? 
 (cart.find(item => item._id === product._id)?.quantity || 0) : 0
 addToCart(product, 1)
 }}
 className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center border border-gray-200 hover:border-gray-300"
 >
 <span className="text-lg font-bold">+</span>
 </button>
 </div>
 
 {/* Bouton Voir détails */}
 <Link
 href={`/produits/${product.slug}`}
 className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-center text-sm font-medium border border-gray-200"
 >
 Voir les détails
 </Link>
 </div>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="text-center py-12">
 <div className="mb-4">
 <FiPackage className="w-16 h-16 text-gray-400 mx-auto" />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 mb-2">
 Aucun produit disponible
 </h3>
 <p className="text-gray-600">
 Nos produits seront bientôt disponibles
 </p>
 </div>
 )}

 <div className="text-center mt-6 sm:mt-8">
 <Link
 href="/produits"
 className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2 text-sm sm:text-base"
 >
 <span>Voir tous les produits</span>
 <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
 </Link>
 </div>
 </div>
 </section>

 {/* Modern Footer */}
 <footer className="relative bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white overflow-hidden">
 {/* Background Pattern */}
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-10 left-10 w-32 h-32 bg-green-500 rounded-full blur-3xl"></div>
 <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-500 rounded-full blur-3xl"></div>
 </div>

 <div className="relative py-8 sm:py-12 lg:py-16 xl:py-20">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Top Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-12">
 {/* Brand & Newsletter */}
 <div>
 <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
 <span className="text-white font-bold text-xl sm:text-2xl">H</span>
 </div>
 <div>
 <h3 className="text-2xl sm:text-3xl font-bold">H-Market</h3>
 <p className="text-green-300 font-medium text-sm sm:text-base">L'Afrique authentique à votre table</p>
 </div>
 </div>
 <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg">
 Votre marketplace de confiance pour découvrir les saveurs authentiques d'Afrique. 
 Attieké, plantain, épices... Tout ce dont vous avez besoin livré en 24-48h.
 </p>
 
 {/* Newsletter */}
 <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
 <h4 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-yellow-300 flex items-center">
 <FiMail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Newsletter
 </h4>
 <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">Recevez nos offres exclusives et nouveautés</p>
 <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
 {isClient && (
 <input
 type="email"
 placeholder="votre.email@exemple.com"
 value={newsletterEmail}
 onChange={(e) => setNewsletterEmail(e.target.value)}
 className="flex-1 bg-white/20 border border-white/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-300 text-sm sm:text-base"
 required
 />
 )}
 {!isClient && (
 <input
 type="email"
 placeholder="votre.email@exemple.com"
 className="flex-1 bg-white/20 border border-white/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-300 focus:outline-none focus:border-yellow-300 text-sm sm:text-base"
 required
 readOnly
 />
 )}
 <button 
 type="submit"
 className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold transition-all duration-300 shadow-xl text-sm sm:text-base"
 >
 S'abonner
 </button>
 </form>
 </div>
 </div>

 {/* Links Grid */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
 {/* Navigation */}
 <div>
 <h4 className="font-bold text-lg mb-6 text-yellow-300">Navigation</h4>
 <ul className="space-y-3">
 <li><Link href="/produits" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiArrowRight className="w-4 h-4" /><span>Tous nos produits</span></Link></li>
 <li><Link href="/produits?category=Fruits%20%26%20Légumes" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiArrowRight className="w-4 h-4" /><span>Fruits & Légumes</span></Link></li>
 <li><Link href="/produits?category=Épices%20%26%20Condiments" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiArrowRight className="w-4 h-4" /><span>Épices</span></Link></li>
 <li><Link href="/panier" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiShoppingCart className="w-4 h-4" /><span>Mon panier</span></Link></li>
 </ul>
 </div>

 {/* Support */}
 <div>
 <h4 className="font-bold text-lg mb-6 text-yellow-300">Support</h4>
 <ul className="space-y-3">
 <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiSmartphone className="w-4 h-4" /><span>Contact</span></Link></li>
 <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiHeart className="w-4 h-4" /><span>FAQ</span></Link></li>
 <li><Link href="/livraison" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiTruck className="w-4 h-4" /><span>Livraison</span></Link></li>
 <li><Link href="/retours" className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"><FiShield className="w-4 h-4" /><span>Retours</span></Link></li>
 </ul>
 </div>

 {/* Contact */}
 <div>
 <h4 className="font-bold text-lg mb-6 text-yellow-300">Contact</h4>
 <ul className="space-y-3 text-gray-300">
 <li className="flex items-center space-x-3">
 <FiMapPin className="w-5 h-5 text-green-400" />
 <span>Île-de-France, France</span>
 </li>
 <li className="flex items-center space-x-3">
 <FiSmartphone className="w-5 h-5 text-green-400" />
 <span>+33 1 23 45 67 89</span>
 </li>
 <li className="flex items-center space-x-3">
 <FiMail className="w-5 h-5" />
 <span>contact@h-market.com</span>
 </li>
 <li className="flex items-center space-x-3">
 <FiClock className="w-5 h-5 text-green-400" />
 <span>Lun-Sam: 8h-20h</span>
 </li>
 </ul>
 </div>
 </div>
 </div>

 {/* Bottom Section */}
 <div className="border-t border-white/20 pt-6 sm:pt-8">
 <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
 <div className="text-gray-400 text-center md:text-left text-xs sm:text-sm">
 <p>&copy; 2024 H-Market. Tous droits réservés. Fait avec ❤️ pour l'Afrique.</p>
 </div>
 <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6">
 <span className="text-gray-400 text-sm">Suivez-nous :</span>
 <div className="flex space-x-3 sm:space-x-4">
 <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
 <FiUsers className="w-4 h-4 sm:w-5 sm:h-5" />
 </a>
 <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
 <FiCamera className="w-4 h-4 sm:w-5 sm:h-5" />
 </a>
 <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
 <FiTwitter className="w-4 h-4 sm:w-5 sm:h-5" />
 </a>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </footer>
 </div>
 )
}
