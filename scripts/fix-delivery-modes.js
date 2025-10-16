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
}, { timestamps: true, strict: false })

const Order = mongoose.model('Order', OrderSchema)

async function fixDeliveryModes() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // Trouver les commandes avec des modes de livraison invalides ou manquants
 const orders = await Order.find({
 $or: [
 { 'delivery.mode': { $exists: false } },
 { 'delivery.mode': null },
 { 'delivery.mode': 'standard' }
 ]
 })

 console.log(`\n ${orders.length} commandes à corriger`)

 for (const order of orders) {
 const oldMode = order.delivery?.mode
 
 // Définir le mode par défaut
 if (!order.delivery) {
 order.delivery = {}
 }
 
 order.delivery.mode = 'express'
 order.delivery.status = order.delivery.status || 'pending'
 order.delivery.deliveryCode = order.delivery.deliveryCode || Math.floor(100000 + Math.random() * 900000).toString()
 
 await order.save({ validateBeforeSave: false })
 
 console.log(` ${order.orderNumber}: "${oldMode}" → "express"`)
 }

 // Vérifier les commandes après correction
 const allOrders = await Order.find({})
 console.log(`\n Résumé après correction:`)
 
 const modeCounts = {}
 allOrders.forEach(order => {
 const mode = order.delivery?.mode || 'undefined'
 modeCounts[mode] = (modeCounts[mode] || 0) + 1
 })
 
 Object.entries(modeCounts).forEach(([mode, count]) => {
 console.log(` - ${mode}: ${count} commandes`)
 })

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

fixDeliveryModes()
