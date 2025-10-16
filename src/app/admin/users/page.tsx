'use client'

import { useState, useEffect } from 'react'
import { FiCheck, FiFilter, FiMail, FiPhone, FiSearch, FiShield, FiUsers, FiX } from 'react-icons/fi'


interface User {
 _id: string
 name: string
 email: string
 phone: string
 role: string
 roleLabel: string
 isVerified: boolean
 isActive: boolean
 createdAt: string
 lastLoginAt: string | null
 status: string
}

interface UserStats {
 total: number
 active: number
 inactive: number
 byRole: Record<string, number>
}

export default function AdminUsers() {
 const [users, setUsers] = useState<User[]>([])
 const [stats, setStats] = useState<UserStats>({
 total: 0,
 active: 0,
 inactive: 0,
 byRole: {}
 })
 const [loading, setLoading] = useState(true)
 const [searchTerm, setSearchTerm] = useState('')
 const [filterRole, setFilterRole] = useState('all')
 const [filterStatus, setFilterStatus] = useState('all')

 useEffect(() => {
 fetchUsers()
 }, [])

 const fetchUsers = async () => {
 try {
 const token = localStorage.getItem('token')
 const response = await fetch('/api/admin/users', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })

 if (response.ok) {
 const data = await response.json()
 setUsers(data.users)
 setStats(data.stats)
 }
 } catch (error) {
 console.error('Erreur lors du chargement des utilisateurs:', error)
 } finally {
 setLoading(false)
 }
 }

 const filteredUsers = users.filter(user => {
 const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 user.email.toLowerCase().includes(searchTerm.toLowerCase())
 const matchesRole = filterRole === 'all' || user.role === filterRole
 const matchesStatus = filterStatus === 'all' || user.status === filterStatus
 
 return matchesSearch && matchesRole && matchesStatus
 })

 const getRoleColor = (role: string) => {
 switch (role) {
 case 'admin':
 return 'bg-red-100 text-red-800'
 case 'client':
 return 'bg-blue-100 text-blue-800'
 case 'livreur':
 return 'bg-green-100 text-green-800'
 default:
 return 'bg-gray-100 text-gray-800'
 }
 }

 const getStatusColor = (status: string) => {
 return status === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
 }

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString('fr-FR', {
 year: 'numeric',
 month: 'short',
 day: 'numeric',
 hour: '2-digit',
 minute: '2-digit'
 })
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
 <div className="flex items-center justify-between mb-6">
 <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
 <div className="flex items-center space-x-2 text-sm text-gray-500">
 <FiUsers className="w-4 h-4" />
 <span>{filteredUsers.length} utilisateur(s) trouvé(s)</span>
 </div>
 </div>

 {/* Statistiques */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-blue-100 text-blue-600">
 <FiUsers className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
 <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-green-100 text-green-600">
 <FiCheck className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
 <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-red-100 text-red-600">
 <FiX className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Utilisateurs Inactifs</p>
 <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
 </div>
 </div>
 </div>

 <div className="bg-white rounded-lg shadow-md p-6">
 <div className="flex items-center">
 <div className="p-3 rounded-full bg-purple-100 text-purple-600">
 <FiShield className="w-6 h-6" />
 </div>
 <div className="ml-4">
 <p className="text-sm font-medium text-gray-600">Administrateurs</p>
 <p className="text-2xl font-bold text-gray-900">{stats.byRole.admin || 0}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Filtres */}
 <div className="bg-white rounded-lg shadow-md p-6 mb-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {/* Recherche */}
 <div className="relative">
 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
 <input
 type="text"
 placeholder="Rechercher par nom ou email..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 />
 </div>

 {/* Filtre par rôle */}
 <div className="relative">
 <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
 <select
 value={filterRole}
 onChange={(e) => setFilterRole(e.target.value)}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
 >
 <option value="all">Tous les rôles</option>
 <option value="admin">Administrateur</option>
 <option value="client">Client</option>
 <option value="livreur">Livreur</option>
 </select>
 </div>

 {/* Filtre par statut */}
 <div className="relative">
 <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
 <select
 value={filterStatus}
 onChange={(e) => setFilterStatus(e.target.value)}
 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
 >
 <option value="all">Tous les statuts</option>
 <option value="Actif">Actif</option>
 <option value="Inactif">Inactif</option>
 </select>
 </div>
 </div>
 </div>

 {/* Liste des utilisateurs */}
 <div className="bg-white rounded-lg shadow-md overflow-hidden">
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Utilisateur
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Contact
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Rôle
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Statut
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Inscription
 </th>
 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Dernière connexion
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {filteredUsers.map((user) => (
 <tr key={user._id} className="hover:bg-gray-50">
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="flex items-center">
 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
 {user.name.charAt(0).toUpperCase()}
 </div>
 <div className="ml-4">
 <div className="text-sm font-medium text-gray-900">{user.name}</div>
 <div className="text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <div className="text-sm text-gray-900 flex items-center">
 <FiMail className="w-4 h-4 mr-2 text-gray-400" />
 {user.email}
 </div>
 <div className="text-sm text-gray-500 flex items-center">
 <FiPhone className="w-4 h-4 mr-2 text-gray-400" />
 {user.phone}
 </div>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
 {user.roleLabel}
 </span>
 </td>
 <td className="px-6 py-4 whitespace-nowrap">
 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
 {user.status}
 </span>
 {user.isVerified && (
 <div className="flex items-center mt-1">
 <FiCheck className="w-3 h-3 text-green-500 mr-1" />
 <span className="text-xs text-green-600">Vérifié</span>
 </div>
 )}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
 {formatDate(user.createdAt)}
 </td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
 {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Jamais connecté'}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {filteredUsers.length === 0 && (
 <div className="text-center py-12">
 <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
 <p className="text-gray-500">Essayez de modifier vos critères de recherche.</p>
 </div>
 )}
 </div>
 </div>
 )
}

