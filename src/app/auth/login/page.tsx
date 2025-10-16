'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'


export default function LoginPage() {
 const router = useRouter()
 const { login } = useAuth()
 const [formData, setFormData] = useState({
 email: '',
 password: ''
 })
 const [showPassword, setShowPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 setError('')

 try {
 const response = await fetch('/api/auth/login', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify(formData)
 })

 const data = await response.json()

 if (response.ok) {
 console.log(' Connexion réussie, données reçues:', data.user)
 
 // Utiliser le hook d'authentification
 login(data.user, data.token)
 
 // Vérifier s'il y a une redirection demandée
 const urlParams = new URLSearchParams(window.location.search)
 const redirectTo = urlParams.get('redirect')
 
 console.log(' Redirection - redirectTo:', redirectTo, 'role:', data.user.role)
 
 if (redirectTo) {
 console.log(' Redirection vers:', redirectTo)
 router.push(redirectTo)
 } else {
 // Rediriger selon le rôle
 if (data.user.role === 'admin') {
 console.log(' Redirection admin vers /admin')
 router.push('/admin')
 } else if (data.user.role === 'livreur') {
 console.log(' Redirection livreur vers /livreur/dashboard')
 router.push('/livreur/dashboard')
 } else {
 console.log(' Redirection utilisateur vers /')
 router.push('/')
 }
 }
 } else {
 setError(data.error || 'Erreur lors de la connexion')
 }
 } catch (error) {
 setError('Erreur de connexion au serveur')
 } finally {
 setLoading(false)
 }
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const { name, value } = e.target
 setFormData({
 ...formData,
 [name]: value
 })
 }

 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
 {/* Background Image */}
 <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
 style={{
 backgroundImage: 'url("https://i.ibb.co/PsQP5Qc9/femme-vivant-un-mode-de-vie-durable-1.jpg")'
 }}>
 </div>

 <div className="max-w-md w-full space-y-8 relative z-10">
 {/* Header */}
 <div className="text-center">
 <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
 <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
 <span className="text-white font-bold text-xl">H</span>
 </div>
 <div>
 <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">H-Market</span>
 <p className="text-xs text-gray-500 -mt-1">Saveurs d'Afrique</p>
 </div>
 </Link>
 
 <h2 className="text-3xl font-bold text-gray-900">Connexion</h2>
 <p className="mt-2 text-gray-600">
 Connectez-vous à votre compte
 </p>
 </div>

 {/* Form */}
 <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
 {error}
 </div>
 )}

 <div className="space-y-4">
 {/* Email */}
 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
 Adresse email
 </label>
 <div className="relative">
 <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input
 id="email"
 name="email"
 type="email"
 required
 value={formData.email}
 onChange={handleChange}
 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
 placeholder="votre@email.com"
 />
 </div>
 </div>

 {/* Password */}
 <div>
 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
 Mot de passe
 </label>
 <div className="relative">
 <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input
 id="password"
 name="password"
 type={showPassword ? 'text' : 'password'}
 required
 value={formData.password}
 onChange={handleChange}
 className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 placeholder="Votre mot de passe"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
 >
 {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
 </button>
 </div>
 </div>
 </div>

 {/* Submit Button */}
 <button
 type="submit"
 disabled={loading}
 className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
 >
 {loading ? (
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 ) : (
 'Se connecter'
 )}
 </button>

 {/* Links */}
 <div className="text-center space-y-2">
 <div className="text-gray-600 text-sm">
 Pas encore de compte ?{' '}
 <Link
 href="/auth/register"
 className="text-green-600 hover:text-green-700 font-medium"
 >
 S'inscrire
 </Link>
 </div>
 <div className="text-gray-600 text-sm">
 <Link
 href="/auth/forgot-password"
 className="text-green-600 hover:text-green-700 font-medium"
 >
 Mot de passe oublié ?
 </Link>
 </div>
 </div>
 </form>
 </div>
 </div>
 )
}
