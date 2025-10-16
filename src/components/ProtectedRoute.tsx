'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
 children: React.ReactNode
 requireAuth?: boolean
 requireRole?: 'admin' | 'client' | 'livreur'
 redirectTo?: string
}

export default function ProtectedRoute({ 
 children, 
 requireAuth = true, 
 requireRole,
 redirectTo = '/auth/login'
}: ProtectedRouteProps) {
 const { isAuthenticated, isAdmin, isClient, isLivreur, loading } = useAuth()
 const router = useRouter()

 useEffect(() => {
 if (loading) return // Attendre que l'authentification soit vérifiée

 // Vérifier si l'authentification est requise
 if (requireAuth && !isAuthenticated) {
 router.push(redirectTo)
 return
 }

 // Vérifier le rôle si spécifié
 if (requireRole) {
 let hasRole = false
 switch (requireRole) {
 case 'admin':
 hasRole = isAdmin
 break
 case 'client':
 hasRole = isClient
 break
 case 'livreur':
 hasRole = isLivreur
 break
 }

 if (!hasRole) {
 router.push('/')
 return
 }
 }
 }, [isAuthenticated, isAdmin, isClient, isLivreur, loading, requireAuth, requireRole, redirectTo, router])

 // Afficher un loader pendant la vérification
 if (loading) {
 return (
 <div className="min-h-screen bg-gray-100 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 )
 }

 // Si l'authentification est requise mais pas présente, ne rien afficher
 if (requireAuth && !isAuthenticated) {
 return null
 }

 // Si un rôle spécifique est requis mais pas présent, ne rien afficher
 if (requireRole) {
 let hasRole = false
 switch (requireRole) {
 case 'admin':
 hasRole = isAdmin
 break
 case 'client':
 hasRole = isClient
 break
 case 'livreur':
 hasRole = isLivreur
 break
 }

 if (!hasRole) {
 return null
 }
 }

 return <>{children}</>
}

