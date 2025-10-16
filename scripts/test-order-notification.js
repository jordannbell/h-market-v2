const mongoose = require('mongoose')
require('dotenv').config()

// Modèles simplifiés
const UserSchema = new mongoose.Schema({
 name: { first: String, last: String },
 email: String,
 phone: String,
 role: String,
 isAvailable: Boolean
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
 currency: String
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
 estimatedDeliveryTime: Date
 },
 status: String
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
const Order = mongoose.model('Order', OrderSchema)

async function testOrderNotification() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // Trouver un client
 const client = await User.findOne({ role: 'client' })
 if (!client) {
 console.log(' Aucun client trouvé')
 return
 }

 console.log(` Client trouvé: ${client.name?.first} ${client.name?.last}`)

 // Créer une commande de test
 const testOrder = new Order({
 orderNumber: `HM-TEST-${Date.now()}`,
 userId: client._id,
 items: [{
 productId: new mongoose.Types.ObjectId(),
 title: 'Test Burger',
 slug: 'test-burger',
 image: '/placeholder-product.jpg',
 price: 15.99,
 quantity: 1,
 totalPrice: 15.99
 }],
 totals: {
 subtotal: 15.99,
 deliveryFee: 3.99,
 taxes: 4.00,
 discounts: 0,
 total: 23.98
 },
 payment: {
 method: 'stripe',
 status: 'succeeded',
 amount: 23.98,
 currency: 'EUR'
 },
 address: {
 street: '123 Rue de Test',
 city: 'Paris',
 postalCode: '75001',
 country: 'France'
 },
 delivery: {
 mode: 'express',
 status: 'pending',
 deliveryCode: Math.floor(100000 + Math.random() * 900000).toString()
 },
 status: 'pending'
 })

 await testOrder.save()
 console.log(` Commande de test créée: ${testOrder.orderNumber}`)

 // Simuler l'envoi de notification
 console.log('\n Simulation de notification SSE...')
 console.log(`Type: new_order`)
 console.log(`Titre: Nouvelle commande disponible`)
 console.log(`Message: Commande ${testOrder.orderNumber} - ${testOrder.totals.total.toFixed(2)}€ - ${testOrder.address.city}`)
 console.log(`Données:`, {
 orderId: testOrder._id,
 orderNumber: testOrder.orderNumber,
 total: testOrder.totals.total,
 address: testOrder.address,
 deliveryMode: testOrder.delivery.mode,
 itemsCount: testOrder.items.length
 })

 console.log('\n Cette notification devrait apparaître dans le dashboard du livreur!')

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

testOrderNotification()
