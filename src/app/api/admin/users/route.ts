import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import User from '@/models/User'

export async function GET(_request: NextRequest) {
 try {
 await connectDB()
 console.log(' Connexion à MongoDB réussie pour récupérer les utilisateurs')

 // Récupérer tous les utilisateurs avec leurs informations de base
 const users = await User.find({}, {
 name: 1,
 email: 1,
 phone: 1,
 role: 1,
 isVerified: 1,
 isActive: 1,
 createdAt: 1,
 lastLoginAt: 1
 }).sort({ createdAt: -1 })

 // Compter les utilisateurs par rôle
 const stats = await User.aggregate([
 {
 $group: {
 _id: '$role',
 count: { $sum: 1 }
 }
 }
 ])

 // Compter les utilisateurs actifs
 const activeUsers = await User.countDocuments({ isActive: true })
 const totalUsers = users.length

 // Formater les données
 const formattedUsers = users.map(user => ({
 _id: user._id,
 name: `${user.name.first} ${user.name.last}`,
 email: user.email,
 phone: user.phone,
 role: user.role,
 isVerified: user.isVerified,
 isActive: user.isActive,
 createdAt: user.createdAt,
 lastLoginAt: user.lastLoginAt,
 status: user.isActive ? 'Actif' : 'Inactif',
 roleLabel: getRoleLabel(user.role)
 }))

 // Formater les statistiques
 const roleStats = stats.reduce((acc, stat) => {
 acc[stat._id] = stat.count
 return acc
 }, {} as Record<string, number>)

 return NextResponse.json({
 success: true,
 users: formattedUsers,
 stats: {
 total: totalUsers,
 active: activeUsers,
 inactive: totalUsers - activeUsers,
 byRole: roleStats
 }
 })

 } catch (error) {
 console.error(' Erreur lors de la récupération des utilisateurs:', error)
 return NextResponse.json(
 { error: 'Erreur lors de la récupération des utilisateurs' },
 { status: 500 }
 )
 }
}

function getRoleLabel(role: string): string {
 switch (role) {
 case 'admin':
 return 'Administrateur'
 case 'client':
 return 'Client'
 case 'livreur':
 return 'Livreur'
 default:
 return 'Utilisateur'
 }
}

