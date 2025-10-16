'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LivreurHomePage() {
 const router = useRouter()
 const { isAuthenticated, isLivreur, loading } = useAuth()

 useEffect(() => {
 if (!loading) {
 if (!isAuthenticated) {
 router.push('/auth/login')
 } else if (isLivreur) {
 router.push('/livreur/dashboard')
 } else {
 // Si ce n'est pas un livreur, rediriger vers le dashboard livreur
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

 return (
 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
 <div className="text-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
 <p className="text-gray-600">Redirection vers votre dashboard...</p>
 </div>
 </div>
 )
}

