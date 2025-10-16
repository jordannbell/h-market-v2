'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function TestOrderPage() {
 const { user, isAuthenticated, token } = useAuth()
 const [result, setResult] = useState<Record<string, unknown>>(null)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)

 const testCreateOrder = async () => {
 if (!isAuthenticated || !token) {
 setError('Vous devez être connecté')
 return
 }

 setLoading(true)
 setError(null)
 setResult(null)

 try {
 const testData = {
 items: [
 {
 _id: 'test-product-id',
 title: 'Produit de test',
 slug: 'produit-test',
 image: 'https://via.placeholder.com/150',
 price: 10.99,
 quantity: 2,
 totalPrice: 21.98
 }
 ],
 address: {
 street: '123 Rue de Test',
 city: 'Paris',
 postalCode: '75001',
 country: 'France'
 },
 delivery: {
 mode: 'standard',
 slot: 'morning',
 scheduledAt: new Date().toISOString()
 },
 paymentMethod: 'stripe'
 }

 console.log('Envoi de la requête de test...')
 const response = await fetch('/api/test-order', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify(testData)
 })

 const data = await response.json()
 console.log('Réponse reçue:', { status: response.status, data })

 if (response.ok) {
 setResult({ success: true, data })
 } else {
 setError(`Erreur ${response.status}: ${data.error || 'Erreur inconnue'}`)
 setResult({ success: false, data })
 }
 } catch (err: any) {
 console.error('Erreur lors du test:', err)
 setError(`Erreur de connexion: ${err.message}`)
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen bg-gray-100 p-8">
 <div className="max-w-4xl mx-auto">
 <h1 className="text-3xl font-bold mb-8">Test de l'API des Commandes</h1>
 
 {/* État de l'authentification */}
 <div className="bg-white p-6 rounded-lg shadow mb-6">
 <h2 className="text-xl font-semibold mb-4">État de l'Authentification</h2>
 <div className="space-y-2">
 <p><strong>Connecté:</strong> {isAuthenticated ? 'Oui' : 'Non'}</p>
 <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'Aucun'}</p>
 <p><strong>Utilisateur:</strong> {user ? `${user.name.first} ${user.name.last}` : 'Aucun'}</p>
 <p><strong>Email:</strong> {user?.email || 'Aucun'}</p>
 </div>
 </div>

 {/* Test de création de commande */}
 <div className="bg-white p-6 rounded-lg shadow mb-6">
 <h2 className="text-xl font-semibold mb-4">Test de Création de Commande</h2>
 
 <button
 onClick={testCreateOrder}
 disabled={!isAuthenticated || loading}
 className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-gray-400"
 >
 {loading ? 'Test en cours...' : 'Tester la création de commande'}
 </button>

 {error && (
 <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
 <p className="text-red-800 font-medium">Erreur:</p>
 <p className="text-red-700">{error}</p>
 </div>
 )}

 {result && (
 <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
 <p className="font-medium mb-2">Résultat:</p>
 <pre className="text-sm overflow-auto">
 {JSON.stringify(result, null, 2)}
 </pre>
 </div>
 )}
 </div>

 {/* Instructions */}
 <div className="bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Instructions</h2>
 <ol className="list-decimal list-inside space-y-2">
 <li>Assurez-vous d'être connecté (voir l'état ci-dessus)</li>
 <li>Cliquez sur "Tester la création de commande"</li>
 <li>Regardez la console du navigateur (F12) pour les logs détaillés</li>
 <li>Vérifiez les logs du serveur pour identifier l'erreur</li>
 </ol>
 </div>
 </div>
 </div>
 )
}
