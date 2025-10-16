'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
 FiShoppingCart, 
 FiUsers, 
 FiPlus, 
 FiLogOut,
 FiMenu,
 FiX,
 FiTrendingUp,
 FiGrid
} from 'react-icons/fi'

export default function AdminLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const { user, isAuthenticated, isAdmin, loading, logout } = useAuth()
 const [sidebarOpen, setSidebarOpen] = useState(false)
 const router = useRouter()
 const pathname = usePathname()

 useEffect(() => {
 console.log('Layout Admin - useEffect:', {
 pathname,
 loading,
 isAuthenticated,
 isAdmin,
 user: user ? { email: user.email, role: user.role } : null
 })
 
 // Ne pas vérifier l'authentification sur la page de connexion
 if (pathname === '/admin/login') {
 console.log('Layout Admin - Page de connexion, pas de vérification')
 return
 }

 // Attendre que le chargement soit terminé avant de vérifier l'authentification
 if (loading) {
 console.log('Layout Admin - En cours de chargement, attente...')
 return
 }

 // Vérifier l'authentification et le rôle avec un délai pour la synchronisation
 if (!isAuthenticated || !isAdmin) {
 console.log('Layout Admin - Redirection vers login:', { isAuthenticated, isAdmin })
 // Petit délai pour éviter les redirections en boucle
 const timer = setTimeout(() => {
 router.push('/admin/login')
 }, 100)
 return () => clearTimeout(timer)
 } else {
 console.log('Layout Admin - Utilisateur authentifié et admin, accès autorisé')
 }
 }, [router, pathname, isAuthenticated, isAdmin, loading, user])

 const handleLogout = () => {
 // Utiliser le hook d'authentification pour la déconnexion
 // Rediriger vers la page de connexion admin
 logout('/admin/login')
 }

 const navigation = [
 { name: 'Statistiques', href: '/admin/stats', icon: FiTrendingUp },
 { name: 'Produits', href: '/admin', icon: FiGrid },
 { name: 'Commandes', href: '/admin/orders', icon: FiShoppingCart },
 { name: 'Utilisateurs', href: '/admin/users', icon: FiUsers },
 { name: 'Ajouter Produit', href: '/admin/products/new', icon: FiPlus },
 ]

 // Si on est sur la page de connexion, afficher directement le contenu
 if (pathname === '/admin/login') {
 return <>{children}</>
 }

 // Si pas d'utilisateur authentifié, afficher le loader
 if (!user) {
 return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 }

 return (
 <div className="min-h-screen bg-gray-50 flex">
 {/* Sidebar - Étendue sur toute la hauteur */}
 <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-800 to-green-900 transform transition-transform duration-300 ease-in-out ${
 sidebarOpen ? 'translate-x-0' : '-translate-x-full'
 } lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col`}>
 
 {/* Header Sidebar */}
 <div className="flex items-center justify-between h-16 px-6 border-b border-green-700">
 <div>
 <h1 className="text-white text-lg font-semibold">H-Market Admin</h1>
 <p className="text-green-200 text-xs">Panneau d'administration</p>
 </div>
 <button
 onClick={() => setSidebarOpen(false)}
 className="lg:hidden text-white hover:text-green-200"
 >
 <FiX className="w-6 h-6" />
 </button>
 </div>

 {/* Navigation */}
 <nav className="flex-1 px-4 py-6">
 <ul className="space-y-2">
 {navigation.map((item) => {
 const isActive = pathname === item.href
 return (
 <li key={item.name}>
 <Link
 href={item.href}
 className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
 isActive
 ? 'bg-green-600 text-white shadow-lg'
 : 'text-green-200 hover:bg-green-700 hover:text-white'
 }`}
 onClick={() => setSidebarOpen(false)}
 >
 <item.icon className="w-5 h-5 mr-3" />
 {item.name}
 </Link>
 </li>
 )
 })}
 </ul>
 </nav>

 {/* User Info - En bas de la sidebar */}
 <div className="p-4 border-t border-green-700 bg-green-900/50">
 <div className="text-white text-sm">
 <p className="font-medium">{user.name?.first} {user.name?.last}</p>
 <p className="text-green-200 text-xs">Administrateur</p>
 </div>
 </div>
 </div>

 {/* Main Content Area */}
 <div className="flex-1 flex flex-col lg:ml-0">
 {/* Top Header Bar */}
 <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
 <div className="flex items-center justify-between px-6 py-4">
 <div className="flex items-center space-x-4">
 {/* Mobile Menu Button */}
 <button
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden text-gray-600 hover:text-gray-900"
 >
 <FiMenu className="w-6 h-6" />
 </button>
 
 <div>
 <h1 className="text-xl font-semibold text-gray-900">Dashboard Admin</h1>
 <span className="text-sm text-gray-500">Bienvenue, {user.name?.first} {user.name?.last}</span>
 </div>
 </div>
 
 <div className="flex items-center space-x-4">
 <div className="flex items-center space-x-2 text-sm text-gray-600">
 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
 <span>En ligne</span>
 </div>
 
 <button
 onClick={handleLogout}
 className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
 title="Se déconnecter"
 >
 <FiLogOut className="w-4 h-4" />
 <span className="hidden sm:inline">Déconnexion</span>
 </button>
 </div>
 </div>
 </div>

 {/* Content */}
 <main className="flex-1 overflow-auto bg-gray-50 p-6">
 {children}
 </main>
 </div>

 {/* Mobile Overlay */}
 {sidebarOpen && (
 <div
 className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}
 </div>
 )
}
