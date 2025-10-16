import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import Product from '@/models/Product'
import User from '@/models/User'
import Order from '@/models/Order'

export async function GET(_request: NextRequest) {
 try {
 await connectDB()

 // Récupérer les statistiques des produits
 const totalProducts = await Product.countDocuments({})
 const pendingProducts = await Product.countDocuments({ isApproved: false })
 const approvedProducts = await Product.countDocuments({ isApproved: true })

 // Récupérer les statistiques des utilisateurs
 const totalUsers = await User.countDocuments({})
 const totalClients = await User.countDocuments({ role: 'client' })
 const totalDrivers = await User.countDocuments({ role: 'livreur' })

 // Récupérer les statistiques des commandes
 const totalOrders = await Order.countDocuments({})
 
 // Calculer le revenu total
 const revenueResult = await Order.aggregate([
 {
 $group: {
 _id: null,
 total: { $sum: '$totals.total' }
 }
 }
 ])
 const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0

 // Récupérer les statistiques par catégorie de produits
 const categoryStats = await Product.aggregate([
 {
 $group: {
 _id: '$category',
 count: { $sum: 1 }
 }
 },
 {
 $sort: { count: -1 }
 }
 ])

 // Récupérer les produits récemment ajoutés
 const recentProducts = await Product.find({})
 .sort({ createdAt: -1 })
 .limit(5)
 .select('title createdAt isApproved')

 // Récupérer les utilisateurs récemment inscrits
 const recentUsers = await User.find({})
 .sort({ createdAt: -1 })
 .limit(5)
 .select('name role createdAt')

 return NextResponse.json({
 totalProducts,
 pendingProducts,
 approvedProducts,
 totalUsers,
 totalClients,
 totalDrivers,
 totalOrders,
 totalRevenue,
 categoryStats,
 recentProducts,
 recentUsers
 })

 } catch (error) {
 console.error('Erreur lors de la récupération des statistiques:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

