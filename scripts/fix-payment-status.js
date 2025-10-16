const mongoose = require('mongoose')
require('dotenv').config()

// Modèles complets
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

const Order = mongoose.model('Order', OrderSchema)

async function fixPaymentStatus() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // Mettre à jour le statut de paiement pour toutes les commandes
 const result = await Order.updateMany(
 { 'payment.status': { $exists: false } },
 { 
 $set: { 
 'payment.status': 'succeeded',
 'payment.paidAt': new Date()
 }
 }
 )

 console.log(` ${result.modifiedCount} commandes mises à jour avec le statut de paiement`)

 // Vérifier les commandes
 const orders = await Order.find({})
 console.log('\n Commandes après correction:')
 orders.forEach(order => {
 console.log(` - ${order.orderNumber}`)
 console.log(` Statut: ${order.status}`)
 console.log(` Livraison: ${order.delivery?.status}`)
 console.log(` Paiement: ${order.payment?.status}`)
 console.log(' ---')
 })

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

fixPaymentStatus()
