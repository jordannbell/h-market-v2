'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useState } from 'react'
import NotificationCenter from '@/components/NotificationCenter'
import { FiBarChart, FiLogOut, FiMapPin, FiMenu, FiMessageSquare, FiTruck } from 'react-icons/fi'


export default function LivreurLayout({
 children,
}: {
 children: React.ReactNode
}) {
 const { user, isAuthenticated, isLivreur, logout, loading } = useAuth()
 const router = useRouter()
 const [sidebarOpen, setSidebarOpen] = useState(false)

 useEffect(() => {
 if (!loading) {
 if (!isAuthenticated) {
 router.push('/auth/login')
 } else if (!isLivreur) {
 // Si ce n'est pas un livreur, rediriger vers le dashboard livreur
 // pour éviter qu'ils accèdent au site principal
 router.push('/livreur/dashboard')
 }
 }
 }, [isAuthenticated, isLivreur, loading, router])

 if (loading) {
 return (
 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 )
 }

 if (!isAuthenticated || !isLivreur) {
 return null
 }

 const handleLogout = () => {
 logout('/auth/login')
 }

 return (
 <div className="min-h-screen bg-gray-50">
 {/* Header mobile */}
 <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
 <div className="flex items-center justify-between px-4 py-3">
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
 <span className="text-white font-bold text-sm">H</span>
 </div>
 <div>
 <h1 className="text-lg font-bold text-gray-900">H-Market</h1>
 <p className="text-xs text-gray-500">Espace Livreur</p>
 </div>
 </div>
 <div className="flex items-center space-x-2">
 <NotificationCenter />
 <button
 onClick={() => setSidebarOpen(!sidebarOpen)}
 className="p-2 rounded-lg hover:bg-gray-100"
 >
 <FiMenu className="w-6 h-6 text-gray-600" />
 </button>
 </div>
 </div>
 </div>

 <div className="flex">
 {/* Sidebar */}
 <div className={`
 fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
 `}>
 <div className="flex flex-col h-full">
 {/* Logo */}
 <div className="flex items-center space-x-3 p-6 border-b border-gray-200">
 <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
 <span className="text-white font-bold text-lg">H</span>
 </div>
 <div>
 <h1 className="text-xl font-bold text-gray-900">H-Market</h1>
 <p className="text-sm text-gray-500">Espace Livreur</p>
 </div>
 </div>

 {/* User info */}
 <div className="p-4 border-b border-gray-200">
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
 <span className="text-green-600 font-semibold">
 {user?.name.first?.[0]}{user?.name.last?.[0]}
 </span>
 </div>
 <div>
 <p className="font-medium text-gray-900">
 {user?.name.first} {user?.name.last}
 </p>
 <p className="text-sm text-gray-500">{user?.email}</p>
 </div>
 </div>
 </div>

 {/* Navigation */}
 <nav className="flex-1 p-4 space-y-2">
 <Link
 href="/livreur/dashboard"
 className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
 >
 <FiBarChart className="w-5 h-5" />
 <span>Dashboard</span>
 </Link>
 
 <Link
 href="/livreur/commandes"
 className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
 >
 <FiTruck className="w-5 h-5" />
 <span>Mes Commandes</span>
 </Link>
 
 <Link
 href="/livreur/trajet"
 className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
 >
 <FiMapPin className="w-5 h-5" />
 <span>Trajet</span>
 </Link>
 
 <Link
 href="/livreur/chat"
 className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
 >
 <FiMessageSquare className="w-5 h-5" />
 <span>Messages</span>
 </Link>
 </nav>

 {/* Logout */}
 <div className="p-4 border-t border-gray-200">
 <button
 onClick={handleLogout}
 className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
 >
 <FiLogOut className="w-5 h-5" />
 <span>Déconnexion</span>
 </button>
 </div>
 </div>
 </div>

 {/* Main content */}
 <div className="flex-1 lg:ml-0">
 {/* Overlay pour mobile */}
 {sidebarOpen && (
 <div
 className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
 onClick={() => setSidebarOpen(false)}
 />
 )}
 
 <main className="p-4 lg:p-6">
 {children}
 </main>
 </div>
 </div>
 </div>
 )
}
