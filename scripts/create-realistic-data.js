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

async function createRealisticData() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // 1. Créer des clients (avec numéros de téléphone uniques)
 const clients = [
 {
 name: { first: 'Marie', last: 'Martin' },
 email: 'marie.martin@email.com',
 phone: '0123456789',
 role: 'client'
 },
 {
 name: { first: 'Pierre', last: 'Dubois' },
 email: 'pierre.dubois@email.com',
 phone: '0987654321',
 role: 'client'
 },
 {
 name: { first: 'Sophie', last: 'Leroy' },
 email: 'sophie.leroy@email.com',
 phone: '0555666777',
 role: 'client'
 }
 ]

 const createdClients = []
 for (const client of clients) {
 let existingClient = await User.findOne({ email: client.email })
 if (!existingClient) {
 // Vérifier si le numéro de téléphone existe déjà
 existingClient = await User.findOne({ phone: client.phone })
 if (existingClient) {
 // Générer un nouveau numéro
 client.phone = `0${Math.floor(Math.random() * 900000000) + 100000000}`
 }
 const newClient = new User(client)
 await newClient.save()
 createdClients.push(newClient)
 console.log(` Client créé: ${client.name.first} ${client.name.last} (${client.phone})`)
 } else {
 createdClients.push(existingClient)
 console.log(` Client existant: ${client.name.first} ${client.name.last}`)
 }
 }

 // 2. S'assurer qu'il y a un livreur disponible
 let livreur = await User.findOne({ role: 'livreur' })
 if (!livreur) {
 livreur = new User({
 name: { first: 'Jean', last: 'Dupont' },
 email: 'livreur@h-market.com',
 phone: '0111222333',
 role: 'livreur',
 isAvailable: true,
 vehicleType: 'Vélo',
 deliveryZone: 'Paris Centre',
 rating: 4.5,
 totalDeliveries: 0,
 location: {
 lat: 48.8566,
 lng: 2.3522,
 address: 'Paris, France',
 updatedAt: new Date()
 }
 })
 await livreur.save()
 console.log(' Livreur créé: Jean Dupont')
 } else {
 // Mettre à jour le livreur existant
 livreur.isAvailable = true
 livreur.vehicleType = 'Vélo'
 livreur.deliveryZone = 'Paris Centre'
 livreur.rating = 4.5
 await livreur.save()
 console.log(' Livreur mis à jour: Jean Dupont')
 }

 // 3. Créer des commandes avec différents statuts
 const orders = [
 {
 orderNumber: 'HM-202501-001',
 userId: createdClients[0]._id,
 items: [{
 productId: new mongoose.Types.ObjectId(),
 title: 'Poulet rôti',
 slug: 'poulet-roti',
 image: '/placeholder-product.jpg',
 price: 12.99,
 quantity: 1,
 totalPrice: 12.99
 }],
 totals: {
 subtotal: 12.99,
 deliveryFee: 3.99,
 taxes: 3.40,
 discounts: 0,
 total: 20.38
 },
 payment: {
 method: 'stripe',
 status: 'succeeded',
 amount: 20.38,
 currency: 'EUR',
 paidAt: new Date()
 },
 address: {
 street: '15 Rue de Rivoli',
 city: 'Paris',
 postalCode: '75001',
 country: 'France'
 },
 delivery: {
 mode: 'express',
 status: 'assigned',
 assignedDriverId: livreur._id,
 deliveryCode: '123456',
 estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // +30min
 scheduledAt: new Date()
 },
 status: 'confirmed',
 orderProgress: {
 step: 'in_transit',
 currentStep: 2,
 totalSteps: 3,
 estimatedCompletionTime: new Date(Date.now() + 30 * 60 * 1000)
 }
 },
 {
 orderNumber: 'HM-202501-002',
 userId: createdClients[1]._id,
 items: [{
 productId: new mongoose.Types.ObjectId(),
 title: 'Salade César',
 slug: 'salade-cesar',
 image: '/placeholder-product.jpg',
 price: 8.50,
 quantity: 2,
 totalPrice: 17.00
 }],
 totals: {
 subtotal: 17.00,
 deliveryFee: 2.99,
 taxes: 4.00,
 discounts: 0,
 total: 23.99
 },
 payment: {
 method: 'stripe',
 status: 'succeeded',
 amount: 23.99,
 currency: 'EUR',
 paidAt: new Date()
 },
 address: {
 street: '42 Avenue des Champs-Élysées',
 city: 'Paris',
 postalCode: '75008',
 country: 'France'
 },
 delivery: {
 mode: 'planned',
 status: 'picked_up',
 assignedDriverId: livreur._id,
 deliveryCode: '789012',
 estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // +45min
 scheduledAt: new Date(),
 pickupTime: new Date(Date.now() - 10 * 60 * 1000) // -10min
 },
 status: 'out_for_delivery',
 orderProgress: {
 step: 'in_transit',
 currentStep: 2,
 totalSteps: 3,
 estimatedCompletionTime: new Date(Date.now() + 45 * 60 * 1000)
 }
 },
 {
 orderNumber: 'HM-202501-003',
 userId: createdClients[2]._id,
 items: [{
 productId: new mongoose.Types.ObjectId(),
 title: 'Pizza Margherita',
 slug: 'pizza-margherita',
 image: '/placeholder-product.jpg',
 price: 14.99,
 quantity: 1,
 totalPrice: 14.99
 }],
 totals: {
 subtotal: 14.99,
 deliveryFee: 4.99,
 taxes: 4.00,
 discounts: 2.00,
 total: 21.98
 },
 payment: {
 method: 'stripe',
 status: 'succeeded',
 amount: 21.98,
 currency: 'EUR',
 paidAt: new Date()
 },
 address: {
 street: '8 Rue de la Paix',
 city: 'Paris',
 postalCode: '75002',
 country: 'France'
 },
 delivery: {
 mode: 'express',
 status: 'delivered',
 assignedDriverId: livreur._id,
 deliveryCode: '345678',
 estimatedDeliveryTime: new Date(Date.now() - 30 * 60 * 1000), // -30min
 scheduledAt: new Date(Date.now() - 60 * 60 * 1000),
 pickupTime: new Date(Date.now() - 45 * 60 * 1000),
 actualDeliveryTime: new Date(Date.now() - 30 * 60 * 1000)
 },
 status: 'delivered',
 orderProgress: {
 step: 'completed',
 currentStep: 3,
 totalSteps: 3,
 estimatedCompletionTime: new Date(Date.now() - 30 * 60 * 1000)
 }
 },
 {
 orderNumber: 'HM-202501-004',
 userId: createdClients[0]._id,
 items: [{
 productId: new mongoose.Types.ObjectId(),
 title: 'Burger Deluxe',
 slug: 'burger-deluxe',
 image: '/placeholder-product.jpg',
 price: 16.99,
 quantity: 1,
 totalPrice: 16.99
 }],
 totals: {
 subtotal: 16.99,
 deliveryFee: 3.99,
 taxes: 4.20,
 discounts: 0,
 total: 25.18
 },
 payment: {
 method: 'stripe',
 status: 'succeeded',
 amount: 25.18,
 currency: 'EUR',
 paidAt: new Date()
 },
 address: {
 street: '25 Boulevard Saint-Germain',
 city: 'Paris',
 postalCode: '75005',
 country: 'France'
 },
 delivery: {
 mode: 'planned',
 status: 'pending', // Pas encore assignée
 deliveryCode: '901234',
 estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000) // +1h
 },
 status: 'confirmed',
 orderProgress: {
 step: 'preparation',
 currentStep: 1,
 totalSteps: 3,
 estimatedCompletionTime: new Date(Date.now() + 60 * 60 * 1000)
 }
 }
 ]

 // Supprimer les anciennes commandes de test
 await Order.deleteMany({ orderNumber: { $regex: /HM-TEST/ } })
 console.log('️ Anciennes commandes de test supprimées')

 // Créer les nouvelles commandes
 for (const orderData of orders) {
 const existingOrder = await Order.findOne({ orderNumber: orderData.orderNumber })
 if (!existingOrder) {
 const order = new Order(orderData)
 await order.save()
 console.log(` Commande créée: ${orderData.orderNumber} - Statut: ${orderData.delivery.status}`)
 } else {
 console.log(` Commande existante: ${orderData.orderNumber}`)
 }
 }

 // 4. Statistiques finales
 const totalOrders = await Order.countDocuments()
 const assignedOrders = await Order.countDocuments({ 'delivery.assignedDriverId': { $exists: true, $ne: null } })
 const pendingOrders = await Order.countDocuments({ 'delivery.status': 'pending' })
 const activeOrders = await Order.countDocuments({ 'delivery.status': { $in: ['assigned', 'picked_up', 'in_transit'] } })
 const deliveredOrders = await Order.countDocuments({ 'delivery.status': 'delivered' })

 console.log('\n Statistiques finales:')
 console.log(` - Total commandes: ${totalOrders}`)
 console.log(` - Commandes assignées: ${assignedOrders}`)
 console.log(` - En attente d'assignation: ${pendingOrders}`)
 console.log(` - En cours de livraison: ${activeOrders}`)
 console.log(` - Livrées: ${deliveredOrders}`)

 // 5. Commandes du livreur
 const livreurOrders = await Order.find({
 'delivery.assignedDriverId': livreur._id
 }).populate('userId', 'name email phone')

 console.log('\n Commandes du livreur Jean Dupont:')
 livreurOrders.forEach(order => {
 console.log(` - ${order.orderNumber} - ${order.delivery.status} - ${order.totals.total}€`)
 console.log(` Client: ${order.userId?.name?.first} ${order.userId?.name?.last}`)
 })

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

createRealisticData()
