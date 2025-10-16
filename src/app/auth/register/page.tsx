'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { FiArrowRight, FiCheck, FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiShoppingCart, FiTruck, FiUser } from 'react-icons/fi'


type Role = 'client' | 'livreur' | null
type Step = 1 | 2 | 3

interface FormData {
 role: Role
 name: {
 first: string
 last: string
 }
 email: string
 phone: string
 password: string
 confirmPassword: string
 // Champs spécifiques au livreur
 vehicleType?: string
 licensePlate?: string
 deliveryZone?: string
}

export default function RegisterPage() {
 const router = useRouter()
 const { login } = useAuth()
 const [currentStep, setCurrentStep] = useState<Step>(1)
 const [formData, setFormData] = useState<FormData>({
 role: null,
 name: { first: '', last: '' },
 email: '',
 phone: '',
 password: '',
 confirmPassword: ''
 })
 const [showPassword, setShowPassword] = useState(false)
 const [showConfirmPassword, setShowConfirmPassword] = useState(false)
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')

 const handleRoleSelect = (role: Role) => {
 setFormData({ ...formData, role })
 setCurrentStep(2)
 }

 const handleNext = () => {
 if (currentStep === 2) {
 // Validation des informations de base
 if (!formData.name.first || !formData.name.last || !formData.email || !formData.phone) {
 setError('Veuillez remplir tous les champs obligatoires')
 return
 }
 
 // Validation des mots de passe
 if (formData.password !== formData.confirmPassword) {
 setError('Les mots de passe ne correspondent pas')
 return
 }
 if (formData.password.length < 6) {
 setError('Le mot de passe doit contenir au moins 6 caractères')
 return
 }
 
 // Validation spécifique pour les livreurs
 if (formData.role === 'livreur') {
 if (!formData.vehicleType || !formData.deliveryZone) {
 setError('Veuillez remplir tous les champs obligatoires pour les livreurs')
 return
 }
 if (formData.vehicleType !== 'velo' && !formData.licensePlate) {
 setError('La plaque d\'immatriculation est requise pour les véhicules motorisés')
 return
 }
 }
 
 setCurrentStep(3)
 }
 }

 const handleBack = () => {
 if (currentStep === 2) {
 setCurrentStep(1)
 } else if (currentStep === 3) {
 setCurrentStep(2)
 }
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 setError('')

 try {
 const response = await fetch('/api/auth/register', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 role: formData.role,
 name: formData.name,
 email: formData.email,
 phone: formData.phone,
 password: formData.password,
 // Champs spécifiques au livreur
 ...(formData.role === 'livreur' && {
 vehicleType: formData.vehicleType,
 licensePlate: formData.licensePlate,
 deliveryZone: formData.deliveryZone
 })
 })
 })

 const data = await response.json()

 if (response.ok) {
 // Utiliser le hook d'authentification
 login(data.user, data.token)
 
 // Rediriger selon le rôle
 if (data.user.role === 'admin') {
 router.push('/admin')
 } else {
 router.push('/')
 }
 } else {
 setError(data.error || 'Erreur lors de l\'inscription')
 }
 } catch (error) {
 setError('Erreur de connexion au serveur')
 } finally {
 setLoading(false)
 }
 }

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target
 
 if (name === 'firstName') {
 setFormData({
 ...formData,
 name: { ...formData.name, first: value }
 })
 } else if (name === 'lastName') {
 setFormData({
 ...formData,
 name: { ...formData.name, last: value }
 })
 } else {
 setFormData({
 ...formData,
 [name]: value
 })
 }
 }

 return (
 <div className="min-h-screen bg-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
 {/* Background Image */}
 <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
 style={{
 backgroundImage: 'url("https://i.ibb.co/PsQP5Qc9/femme-vivant-un-mode-de-vie-durable-1.jpg")'
 }}>
 </div>

 <div className="max-w-2xl w-full space-y-8 relative z-10">
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
 
 <h2 className="text-3xl font-bold text-gray-900">Inscription</h2>
 <p className="mt-2 text-gray-600">
 Créez votre compte H-Market
 </p>
 </div>

 {/* Progress Bar */}
 <div className="flex items-center justify-center space-x-8 mb-8">
 <div className="flex items-center space-x-2">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
 currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
 }`}>
 1
 </div>
 <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-green-600' : 'text-gray-500'}`}>
 Rôle
 </span>
 </div>
 
 <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
 
 <div className="flex items-center space-x-2">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
 currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
 }`}>
 2
 </div>
 <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-green-600' : 'text-gray-500'}`}>
 Informations
 </span>
 </div>
 
 <div className={`flex-1 h-1 ${currentStep >= 3 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
 
 <div className="flex items-center space-x-2">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
 currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
 }`}>
 3
 </div>
 <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
 Compte
 </span>
 </div>
 </div>

 {/* Form */}
 <div className="bg-white rounded-lg shadow-xl p-8">
 {error && (
 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
 {error}
 </div>
 )}

 {/* Step 1: Role Selection */}
 {currentStep === 1 && (
 <div className="space-y-6">
 <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
 Choisissez votre rôle
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Client Card */}
 <button
 onClick={() => handleRoleSelect('client')}
 className="border-2 border-gray-200 hover:border-green-500 rounded-lg p-6 text-left transition-all duration-200 hover:shadow-lg group"
 >
 <div className="flex items-center justify-center mb-4">
 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
 <FiShoppingCart className="w-8 h-8 text-gray-600 group-hover:text-green-600" />
 </div>
 </div>
 
 <h4 className="text-lg font-semibold text-gray-900 mb-2">Client</h4>
 <p className="text-gray-600 mb-4">Je veux acheter des produits africains</p>
 
 <ul className="space-y-2">
 <li className="flex items-center text-sm text-gray-600">
 <FiCheck className="w-4 h-4 text-green-500 mr-2" />
 Accès à tous les produits
 </li>
 <li className="flex items-center text-sm text-gray-600">
 <FiCheck className="w-4 h-4 text-green-500 mr-2" />
 Commandes et livraisons
 </li>
 <li className="flex items-center text-sm text-gray-600">
 <FiCheck className="w-4 h-4 text-green-500 mr-2" />
 Suivi des commandes
 </li>
 </ul>
 </button>

 {/* Livreur Card */}
 <button
 onClick={() => handleRoleSelect('livreur')}
 className="border-2 border-gray-200 hover:border-green-500 rounded-lg p-6 text-left transition-all duration-200 hover:shadow-lg group"
 >
 <div className="flex items-center justify-center mb-4">
 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-100 transition-colors">
 <FiTruck className="w-8 h-8 text-gray-600 group-hover:text-green-600" />
 </div>
 </div>
 
 <h4 className="text-lg font-semibold text-gray-900 mb-2">Livreur</h4>
 <p className="text-gray-600 mb-4">Je veux livrer des commandes</p>
 
 <ul className="space-y-2">
 <li className="flex items-center text-sm text-gray-600">
 <FiCheck className="w-4 h-4 text-green-500 mr-2" />
 Gestion des livraisons
 </li>
 <li className="flex items-center text-sm text-gray-600">
 <FiCheck className="w-4 h-4 text-green-500 mr-2" />
 Suivi des commandes
 </li>
 <li className="flex items-center text-sm text-gray-600">
 <FiCheck className="w-4 h-4 text-green-500 mr-2" />
 Gains par livraison
 </li>
 </ul>
 </button>
 </div>
 </div>
 )}

 {/* Step 2: Basic Information */}
 {currentStep === 2 && (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-semibold text-gray-900">
 Informations personnelles
 </h3>
 <button
 onClick={handleBack}
 className="text-green-600 hover:text-green-700 text-sm font-medium"
 >
 ← Retour
 </button>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
 Prénom *
 </label>
 <div className="relative">
 <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input
 id="firstName"
 name="firstName"
 type="text"
 required
 value={formData.name.first}
 onChange={handleChange}
 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
 placeholder="Prénom"
 />
 </div>
 </div>
 
 <div>
 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
 Nom *
 </label>
 <div className="relative">
 <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input
 id="lastName"
 name="lastName"
 type="text"
 required
 value={formData.name.last}
 onChange={handleChange}
 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
 placeholder="Nom"
 />
 </div>
 </div>
 </div>

 <div>
 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
 Adresse email *
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

 <div>
 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
 Numéro de téléphone *
 </label>
 <div className="relative">
 <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input
 id="phone"
 name="phone"
 type="tel"
 required
 value={formData.phone}
 onChange={handleChange}
 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
 placeholder="+33 6 12 34 56 78"
 />
 </div>
 </div>

 {/* Livreur specific fields */}
 {formData.role === 'livreur' && (
 <div className="space-y-4 border-t border-gray-200 pt-6">
 <h4 className="font-semibold text-gray-900">Informations de livraison</h4>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
 Type de véhicule
 </label>
 <select
 id="vehicleType"
 name="vehicleType"
 value={formData.vehicleType || ''}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
 >
 <option value="">Sélectionner</option>
 <option value="voiture">Voiture</option>
 <option value="moto">Moto</option>
 <option value="scooter">Scooter</option>
 <option value="velo">Vélo</option>
 </select>
 </div>

 <div>
 <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
 Plaque d'immatriculation
 </label>
 <input
 id="licensePlate"
 name="licensePlate"
 type="text"
 value={formData.licensePlate || ''}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
 placeholder="AB-123-CD"
 />
 </div>
 </div>

 <div>
 <label htmlFor="deliveryZone" className="block text-sm font-medium text-gray-700 mb-2">
 Zone de livraison
 </label>
 <select
 id="deliveryZone"
 name="deliveryZone"
 value={formData.deliveryZone || ''}
 onChange={handleChange}
 className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
 >
 <option value="">Sélectionner une zone</option>
 <option value="paris-centre">Paris Centre</option>
 <option value="paris-nord">Paris Nord</option>
 <option value="paris-sud">Paris Sud</option>
 <option value="paris-est">Paris Est</option>
 <option value="paris-ouest">Paris Ouest</option>
 <option value="banlieue-nord">Banlieue Nord</option>
 <option value="banlieue-sud">Banlieue Sud</option>
 </select>
 </div>
 </div>
 )}

 {/* Champs de mot de passe */}
 <div className="space-y-4 border-t border-gray-200 pt-6">
 <h4 className="font-semibold text-gray-900">Sécurité du compte</h4>
 
 <div>
 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
 Mot de passe *
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
 className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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

 <div>
 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
 Confirmer le mot de passe *
 </label>
 <div className="relative">
 <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input
 id="confirmPassword"
 name="confirmPassword"
 type={showConfirmPassword ? 'text' : 'password'}
 required
 value={formData.confirmPassword}
 onChange={handleChange}
 className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
 placeholder="Confirmez votre mot de passe"
 />
 <button
 type="button"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
 >
 {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
 </button>
 </div>
 </div>
 </div>

 <div className="flex justify-end">
 <button
 onClick={handleNext}
 className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
 >
 <span>Continuer</span>
 <FiArrowRight className="w-5 h-5" />
 </button>
 </div>
 </div>
 )}

 {/* Step 3: Account Summary and Creation */}
 {currentStep === 3 && (
 <div className="space-y-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-semibold text-gray-900">
 Résumé et création du compte
 </h3>
 <button
 type="button"
 onClick={handleBack}
 className="text-green-600 hover:text-green-700 text-sm font-medium"
 >
 ← Retour
 </button>
 </div>

 {/* Résumé des informations */}
 <div className="bg-gray-50 rounded-lg p-6 space-y-4">
 <h4 className="font-semibold text-gray-900 mb-4">Récapitulatif de vos informations</h4>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <span className="text-sm text-gray-500">Prénom:</span>
 <p className="font-medium text-gray-900">{formData.name.first}</p>
 </div>
 <div>
 <span className="text-sm text-gray-500">Nom:</span>
 <p className="font-medium text-gray-900">{formData.name.last}</p>
 </div>
 </div>
 
 <div>
 <span className="text-sm text-gray-500">Email:</span>
 <p className="font-medium text-gray-900">{formData.email}</p>
 </div>
 
 <div>
 <span className="text-sm text-gray-500">Téléphone:</span>
 <p className="font-medium text-gray-900">{formData.phone}</p>
 </div>
 
 <div>
 <span className="text-sm text-gray-500">Rôle:</span>
 <p className="font-medium text-gray-900 capitalize">{formData.role}</p>
 </div>

 {formData.role === 'livreur' && (
 <>
 <div>
 <span className="text-sm text-gray-500">Type de véhicule:</span>
 <p className="font-medium text-gray-900 capitalize">{formData.vehicleType}</p>
 </div>
 {formData.vehicleType && formData.vehicleType !== 'velo' && (
 <div>
 <span className="text-sm text-gray-500">Plaque d'immatriculation:</span>
 <p className="font-medium text-gray-900">{formData.licensePlate}</p>
 </div>
 )}
 <div>
 <span className="text-sm text-gray-500">Zone de livraison:</span>
 <p className="font-medium text-gray-900">{formData.deliveryZone}</p>
 </div>
 </>
 )}
 </div>

 {/* Bouton de création */}
 <div className="flex justify-end space-x-4">
 <button
 type="button"
 onClick={handleBack}
 className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
 >
 Retour
 </button>
 <button
 onClick={handleSubmit}
 disabled={loading}
 className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
 >
 {loading ? (
 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
 ) : (
 <>
 <span>Créer mon compte</span>
 <FiArrowRight className="w-5 h-5" />
 </>
 )}
 </button>
 </div>
 </div>
 )}
 </div>

 {/* Footer Links */}
 <div className="text-center">
 <div className="text-gray-600 text-sm">
 Déjà un compte ?{' '}
 <Link
 href="/auth/login"
 className="text-green-600 hover:text-green-700 font-medium"
 >
 Se connecter
 </Link>
 </div>
 </div>
 </div>
 </div>
 )
}
