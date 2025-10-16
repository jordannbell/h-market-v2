'use client'

import { useState, useEffect } from 'react'
import { FiDollarSign, FiPackage, FiShoppingCart, FiUsers } from 'react-icons/fi'


interface Stats {
 totalProducts: number
 pendingProducts: number
 approvedProducts: number
 totalUsers: number
 totalClients: number
 totalDrivers: number
 totalOrders: number
 totalRevenue: number
 categoryStats: Array<{
 _id: string
 count: number
 }>
 recentProducts: Array<{
 _id: string
 title: string
 createdAt: string
 isApproved: boolean
 }>
 recentUsers: Array<{
 _id: string
 name: {
 first: string
 last: string
 }
 role: string
 createdAt: string
 }>
}

export default function AdminStats() {
 const [stats, setStats] = useState<Stats>({
 totalProducts: 0,
 pendingProducts: 0,
 approvedProducts: 0,
 totalUsers: 0,
 totalClients: 0,
 totalDrivers: 0,
 totalOrders: 0,
 totalRevenue: 0,
 categoryStats: [],
 recentProducts: [],
 recentUsers: []
 })
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 fetchStats()
 }, [])

 const fetchStats = async () => {
 try {
 const token = localStorage.getItem('token')
 const response = await fetch('/api/admin/stats', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 setStats(data)
 }
 } catch (error) {
 console.error('Erreur lors du chargement des statistiques:', error)
 } finally {
 setLoading(false)
 }
 }

 if (loading) {
 return (
 <div className="p-6">
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 </div>
 )
 }

 return (
 <div className="p-6">
 <h1 className="text-2xl font-bold text-gray-900 mb-6">Statistiques</h1>

 {/* Stats Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
 {/* Total Products */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-blue-100 text-blue-600">
 <FiPackage className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Total Produits</p>
 <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
 </div>
 </div>
 </div>

 {/* Pending Products */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
 <FiPackage className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">En Attente</p>
 <p className="text-2xl font-bold text-gray-900">{stats.pendingProducts}</p>
 </div>
 </div>
 </div>

 {/* Approved Products */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-green-100 text-green-600">
 <FiPackage className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Approuvés</p>
 <p className="text-2xl font-bold text-gray-900">{stats.approvedProducts}</p>
 </div>
 </div>
 </div>

 {/* Total Users */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-purple-100 text-purple-600">
 <FiUsers className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
 <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
 </div>
 </div>
 </div>

 {/* Total Orders */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
 <FiShoppingCart className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Commandes</p>
 <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
 </div>
 </div>
 </div>

 {/* Total Revenue */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-green-100 text-green-600">
 <FiDollarSign className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Revenus</p>
 <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} €</p>
 </div>
 </div>
 </div>
 </div>

 {/* Charts Section */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Products by Category */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Produits par Catégorie</h3>
 <div className="space-y-3">
 {stats.categoryStats.length > 0 ? (
 stats.categoryStats.map((category, index) => {
 const percentage = stats.totalProducts > 0 ? Math.round((category.count / stats.totalProducts) * 100) : 0
 const colors = ['bg-green-600', 'bg-blue-600', 'bg-yellow-600', 'bg-purple-600', 'bg-red-600']
 const colorClass = colors[index % colors.length]
 
 return (
 <div key={category._id}>
 <div className="flex items-center justify-between">
 <span className="text-sm text-gray-600">{category._id}</span>
 <span className="text-sm font-medium text-gray-900">{percentage}%</span>
 </div>
 <div className="w-full bg-gray-200 rounded-full h-2">
 <div className={`${colorClass} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
 </div>
 </div>
 )
 })
 ) : (
 <div className="text-center py-4">
 <p className="text-sm text-gray-500">Aucune catégorie trouvée</p>
 </div>
 )}
 </div>
 </div>

 {/* Recent Activity */}
 <div className="bg-white rounded-lg shadow-md p-6">
 <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
 <div className="space-y-4">
 {stats.recentProducts.length > 0 ? (
 stats.recentProducts.slice(0, 3).map((product, index) => {
 const timeAgo = new Date(product.createdAt).toLocaleDateString('fr-FR')
 return (
 <div key={product._id} className="flex items-center space-x-3">
 <div className={`w-2 h-2 rounded-full ${product.isApproved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-900">
 {product.isApproved ? 'Produit approuvé' : 'Nouveau produit ajouté'}
 </p>
 <p className="text-xs text-gray-500">{product.title}</p>
 </div>
 <span className="text-xs text-gray-500">{timeAgo}</span>
 </div>
 )
 })
 ) : (
 <div className="text-center py-4">
 <p className="text-sm text-gray-500">Aucune activité récente</p>
 </div>
 )}
 
 {stats.recentUsers.length > 0 && (
 stats.recentUsers.slice(0, 2).map((user) => {
 const timeAgo = new Date(user.createdAt).toLocaleDateString('fr-FR')
 return (
 <div key={user._id} className="flex items-center space-x-3">
 <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-900">Nouvel utilisateur</p>
 <p className="text-xs text-gray-500">
 {user.name?.first} {user.name?.last} ({user.role})
 </p>
 </div>
 <span className="text-xs text-gray-500">{timeAgo}</span>
 </div>
 )
 })
 )}
 </div>
 </div>
 </div>
 </div>
 )
}

