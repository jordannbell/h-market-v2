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

async function cleanupOrders() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // Supprimer les commandes avec des données incomplètes
 const result = await Order.deleteMany({
 $or: [
 { 'delivery.status': { $exists: false } },
 { 'totals.total': { $exists: false } },
 { 'userId': { $exists: false } }
 ]
 })

 console.log(`️ ${result.deletedCount} commandes incomplètes supprimées`)

 // Vérifier les commandes restantes
 const remainingOrders = await Order.find({}).populate('userId', 'name email')
 console.log(`\n Commandes restantes (${remainingOrders.length}):`)
 
 remainingOrders.forEach(order => {
 console.log(` - ${order.orderNumber}`)
 console.log(` Statut: ${order.status}`)
 console.log(` Livraison: ${order.delivery?.status}`)
 console.log(` Client: ${order.userId?.name?.first} ${order.userId?.name?.last}`)
 console.log(` Total: ${order.totals?.total}€`)
 console.log(` Assigné à: ${order.delivery?.assignedDriverId || 'Non assigné'}`)
 console.log(' ---')
 })

 // Vérifier les commandes non livrées
 const nonDeliveredOrders = await Order.find({
 'delivery.status': { $ne: 'delivered' }
 }).populate('userId', 'name email')
 
 console.log(`\n Commandes non livrées (${nonDeliveredOrders.length}):`)
 nonDeliveredOrders.forEach(order => {
 console.log(` - ${order.orderNumber} - ${order.delivery?.status} - ${order.totals?.total}€`)
 })

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

cleanupOrders()
