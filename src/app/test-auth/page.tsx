'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

export default function TestAuthPage() {
 const { user, isAuthenticated, loading, token } = useAuth()
 const [localStorageData, setLocalStorageData] = useState<Record<string, unknown>>({})

 useEffect(() => {
 // Récupérer les données du localStorage
 const token = localStorage.getItem('token')
 const user = localStorage.getItem('user')
 
 setLocalStorageData({
 token,
 user: user ? JSON.parse(user) : null,
 hasToken: !!token,
 hasUser: !!user
 })
 }, [])

 return (
 <div className="min-h-screen bg-gray-100 p-8">
 <div className="max-w-4xl mx-auto">
 <h1 className="text-3xl font-bold mb-8">Test d'Authentification</h1>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* État du Hook useAuth */}
 <div className="bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Hook useAuth</h2>
 <div className="space-y-2">
 <p><strong>Loading:</strong> {loading ? 'Oui' : 'Non'}</p>
 <p><strong>Authentifié:</strong> {isAuthenticated ? 'Oui' : 'Non'}</p>
 <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Aucun'}</p>
 <p><strong>Utilisateur:</strong> {user ? `${user.name.first} ${user.name.last}` : 'Aucun'}</p>
 <p><strong>Email:</strong> {user?.email || 'Aucun'}</p>
 <p><strong>Rôle:</strong> {user?.role || 'Aucun'}</p>
 </div>
 </div>

 {/* Données du localStorage */}
 <div className="bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">localStorage</h2>
 <div className="space-y-2">
 <p><strong>Token présent:</strong> {localStorageData.hasToken ? 'Oui' : 'Non'}</p>
 <p><strong>Utilisateur présent:</strong> {localStorageData.hasUser ? 'Oui' : 'Non'}</p>
 <p><strong>Token:</strong> {localStorageData.token ? `${localStorageData.token.substring(0, 20)}...` : 'Aucun'}</p>
 <p><strong>Utilisateur:</strong> {localStorageData.user ? `${localStorageData.user.name?.first} ${localStorageData.user.name?.last}` : 'Aucun'}</p>
 </div>
 </div>
 </div>

 {/* Actions de test */}
 <div className="mt-8 bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Actions de Test</h2>
 <div className="space-x-4">
 <button
 onClick={() => {
 localStorage.removeItem('token')
 localStorage.removeItem('user')
 window.location.reload()
 }}
 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
 >
 Vider localStorage
 </button>
 <button
 onClick={() => window.location.reload()}
 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
 >
 Recharger la page
 </button>
 </div>
 </div>

 {/* Logs de la console */}
 <div className="mt-8 bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Instructions de Test</h2>
 <ol className="list-decimal list-inside space-y-2">
 <li>Ouvrez la console du navigateur (F12 → Console)</li>
 <li>Regardez les logs d'authentification</li>
 <li>Vérifiez s'il y a des erreurs</li>
 <li>Testez la connexion depuis la page de login</li>
 <li>Vérifiez que le token est bien stocké</li>
 </ol>
 </div>
 </div>
 </div>
 )
}
