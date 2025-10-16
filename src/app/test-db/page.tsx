'use client'

import { useState } from 'react'

export default function TestDBPage() {
 const [testResult, setTestResult] = useState<Record<string, unknown>>(null)
 const [loading, setLoading] = useState(false)

 const testDatabaseConnection = async () => {
 setLoading(true)
 try {
 const response = await fetch('/api/test-db')
 const result = await response.json()
 setTestResult(result)
 } catch (error) {
 setTestResult({ error: error.message })
 } finally {
 setLoading(false)
 }
 }

 const testAuthAPI = async () => {
 setLoading(true)
 try {
 const response = await fetch('/api/auth/login', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 email: 'test@test.com',
 password: 'test123'
 })
 })
 const result = await response.json()
 setTestResult({ status: response.status, data: result })
 } catch (error) {
 setTestResult({ error: error.message })
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="min-h-screen bg-gray-100 p-8">
 <div className="max-w-4xl mx-auto">
 <h1 className="text-3xl font-bold mb-8">Test de Diagnostic</h1>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Test de connexion DB */}
 <div className="bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Test Base de Données</h2>
 <button
 onClick={testDatabaseConnection}
 disabled={loading}
 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
 >
 {loading ? 'Test en cours...' : 'Tester la connexion DB'}
 </button>
 </div>

 {/* Test de l'API Auth */}
 <div className="bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Test API Auth</h2>
 <button
 onClick={testAuthAPI}
 disabled={loading}
 className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
 >
 {loading ? 'Test en cours...' : 'Tester l\'API Auth'}
 </button>
 </div>
 </div>

 {/* Résultats */}
 {testResult && (
 <div className="mt-8 bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Résultats des Tests</h2>
 <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded">
 {JSON.stringify(testResult, null, 2)}
 </pre>
 </div>
 )}

 {/* Instructions */}
 <div className="mt-8 bg-white p-6 rounded-lg shadow">
 <h2 className="text-xl font-semibold mb-4">Instructions de Diagnostic</h2>
 <ol className="list-decimal list-inside space-y-2">
 <li>Cliquez sur "Tester la connexion DB" pour vérifier MongoDB</li>
 <li>Cliquez sur "Tester l'API Auth" pour vérifier l'API de login</li>
 <li>Regardez les résultats ci-dessus</li>
 <li>Vérifiez aussi les logs du serveur dans le terminal</li>
 </ol>
 </div>
 </div>
 </div>
 )
}
