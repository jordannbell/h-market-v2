'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export default function AuthDebug() {
 const { user, token, loading, isAuthenticated, isLivreur } = useAuth()
 const [showDebug, setShowDebug] = useState(false)

 if (loading) {
 return (
 <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-3 text-sm">
 Chargement de l'authentification...
 </div>
 )
 }

 return (
 <div className="fixed top-4 right-4 z-50">
 {/* Bouton de debug */}
 <button
 onClick={() => setShowDebug(!showDebug)}
 className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700"
 >
 Debug Auth
 </button>

 {/* Panneau de debug */}
 {showDebug && (
 <div className="absolute top-12 right-0 bg-white border border-gray-300 rounded-lg p-4 shadow-lg min-w-80">
 <h3 className="font-bold text-gray-800 mb-3"> Debug Authentification</h3>
 
 <div className="space-y-2 text-sm">
 <div className="flex justify-between">
 <span className="font-medium">Token:</span>
 <span className={token ? 'text-green-600' : 'text-red-600'}>
 {token ? ' Présent' : ' Absent'}
 </span>
 </div>
 
 <div className="flex justify-between">
 <span className="font-medium">Utilisateur:</span>
 <span className={user ? 'text-green-600' : 'text-red-600'}>
 {user ? ' Présent' : ' Absent'}
 </span>
 </div>
 
 <div className="flex justify-between">
 <span className="font-medium">Authentifié:</span>
 <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
 {isAuthenticated ? ' Oui' : ' Non'}
 </span>
 </div>
 
 <div className="flex justify-between">
 <span className="font-medium">Rôle:</span>
 <span className="text-blue-600">
 {user?.role || 'Non défini'}
 </span>
 </div>
 
 <div className="flex justify-between">
 <span className="font-medium">Livreur:</span>
 <span className={isLivreur ? 'text-green-600' : 'text-red-600'}>
 {isLivreur ? ' Oui' : ' Non'}
 </span>
 </div>
 
 {user && (
 <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
 <div><strong>Email:</strong> {user.email}</div>
 <div><strong>Nom:</strong> {user.name.first} {user.name.last}</div>
 <div><strong>Vérifié:</strong> {user.isVerified ? '' : ''}</div>
 <div><strong>Actif:</strong> {user.isActive ? '' : ''}</div>
 </div>
 )}
 
 {token && (
 <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
 <div><strong>Token (début):</strong> {token.substring(0, 20)}...</div>
 <div><strong>Longueur:</strong> {token.length} caractères</div>
 </div>
 )}
 </div>
 
 <div className="mt-3 pt-3 border-t border-gray-200">
 <button
 onClick={() => {
 localStorage.clear()
 window.location.reload()
 }}
 className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
 >
 ️ Nettoyer localStorage
 </button>
 </div>
 </div>
 )}
 </div>
 )
}

