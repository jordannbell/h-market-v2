const mongoose = require('mongoose')
require('dotenv').config()

// Modèles complets
const UserSchema = new mongoose.Schema({
 name: { first: String, last: String },
 email: String,
 phone: String,
 role: String,
 isAvailable: Boolean,
 vehicleType: String,
 deliveryZone: String,
 rating: Number,
 totalDeliveries: Number,
 location: {
 lat: Number,
 lng: Number,
 address: String,
 updatedAt: Date
 }
}, { timestamps: true })

const OrderSchema = new mongoose.Schema({
 orderNumber: String,
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 items: [{
 productId: mongoose.Schema.Types.ObjectId,
 title: String,
 slug: String,
 image: String,
 price: Number,
 quantity: Number,
 totalPrice: Number
 }],
 totals: {
 subtotal: Number,
 deliveryFee: Number,
 taxes: Number,
 discounts: Number,
 total: Number
 },
 payment: {
 method: String,
 status: String,
 amount: Number,
 currency: String,
 paidAt: Date
 },
 address: {
 street: String,
 city: String,
 postalCode: String,
 country: String
 },
 delivery: {
 mode: String,
 status: String,
 assignedDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 deliveryCode: String,
 estimatedDeliveryTime: Date,
 scheduledAt: Date,
 pickupTime: Date,
 actualDeliveryTime: Date
 },
 status: String,
 orderProgress: {
 step: String,
 currentStep: Number,
 totalSteps: Number,
 estimatedCompletionTime: Date
 },
 notes: String
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
const Order = mongoose.model('Order', OrderSchema)

async function checkDatabase() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // 1. Vérifier les collections
 const collections = await mongoose.connection.db.listCollections().toArray()
 console.log('\n Collections dans la base de données:')
 collections.forEach(col => {
 console.log(` - ${col.name}`)
 })

 // 2. Compter les documents
 const userCount = await User.countDocuments()
 const orderCount = await Order.countDocuments()
 
 console.log(`\n Nombre de documents:`)
 console.log(` - Utilisateurs: ${userCount}`)
 console.log(` - Commandes: ${orderCount}`)

 // 3. Vérifier les utilisateurs
 console.log('\n Utilisateurs:')
 const users = await User.find({})
 users.forEach(user => {
 console.log(` - ${user.name?.first} ${user.name?.last} (${user.role}) - Email: ${user.email}`)
 })

 // 4. Vérifier les commandes
 console.log('\n Commandes:')
 const orders = await Order.find({}).populate('userId', 'name email')
 orders.forEach(order => {
 console.log(` - ${order.orderNumber}`)
 console.log(` Statut: ${order.status}`)
 console.log(` Livraison: ${order.delivery?.status}`)
 console.log(` Client: ${order.userId?.name?.first} ${order.userId?.name?.last}`)
 console.log(` Total: ${order.totals?.total}€`)
 console.log(` Assigné à: ${order.delivery?.assignedDriverId || 'Non assigné'}`)
 console.log(' ---')
 })

 // 5. Vérifier les commandes par statut de livraison
 console.log('\n Commandes par statut de livraison:')
 const statusCounts = await Order.aggregate([
 { $group: { _id: '$delivery.status', count: { $sum: 1 } } }
 ])
 statusCounts.forEach(stat => {
 console.log(` - ${stat._id || 'null'}: ${stat.count}`)
 })

 // 6. Vérifier les commandes non livrées
 const nonDeliveredOrders = await Order.find({
 'delivery.status': { $ne: 'delivered' }
 }).populate('userId', 'name email')
 
 console.log(`\n Commandes non livrées (${nonDeliveredOrders.length}):`)
 nonDeliveredOrders.forEach(order => {
 console.log(` - ${order.orderNumber} - ${order.delivery?.status} - ${order.totals?.total}€`)
 })

 // 7. Vérifier les commandes assignées au livreur
 const livreur = await User.findOne({ role: 'livreur' })
 if (livreur) {
 const livreurOrders = await Order.find({
 'delivery.assignedDriverId': livreur._id
 }).populate('userId', 'name email')
 
 console.log(`\n Commandes du livreur ${livreur.name?.first} (${livreurOrders.length}):`)
 livreurOrders.forEach(order => {
 console.log(` - ${order.orderNumber} - ${order.delivery?.status} - ${order.totals?.total}€`)
 })
 }

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

checkDatabase()
