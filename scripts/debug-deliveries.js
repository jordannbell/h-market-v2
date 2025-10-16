const mongoose = require('mongoose')
require('dotenv').config()

// Modèles simplifiés pour le script
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
})

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
 status: String,
 orderProgress: {
 step: String,
 currentStep: Number,
 totalSteps: Number
 }
}, { timestamps: true })

const User = mongoose.model('User', UserSchema)
const Order = mongoose.model('Order', OrderSchema)

async function debugDeliveries() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // 1. Vérifier les utilisateurs livreurs
 const livreurs = await User.find({ role: 'livreur' })
 console.log(`\n Livreurs trouvés: ${livreurs.length}`)
 livreurs.forEach(livreur => {
 console.log(` - ${livreur.name?.first} ${livreur.name?.last} (${livreur.email}) - Disponible: ${livreur.isAvailable}`)
 })

 // 2. Vérifier toutes les commandes
 const allOrders = await Order.find({})
 console.log(`\n Total des commandes: ${allOrders.length}`)
 
 // 3. Vérifier les commandes avec des livreurs assignés
 const assignedOrders = await Order.find({
 'delivery.assignedDriverId': { $exists: true, $ne: null }
 })
 console.log(`\n Commandes avec livreur assigné: ${assignedOrders.length}`)
 
 assignedOrders.forEach(order => {
 console.log(` - Commande ${order.orderNumber} - Statut: ${order.delivery.status} - Livreur: ${order.delivery.assignedDriverId}`)
 })

 // 4. Vérifier les commandes par statut de livraison
 const statusCounts = await Order.aggregate([
 { $group: { _id: '$delivery.status', count: { $sum: 1 } } }
 ])
 console.log('\n Commandes par statut de livraison:')
 statusCounts.forEach(stat => {
 console.log(` - ${stat._id}: ${stat.count}`)
 })

 // 5. Créer des données de test si nécessaire
 if (assignedOrders.length === 0 && livreurs.length > 0) {
 console.log('\n Création de données de test...')
 
 // Trouver un livreur disponible
 const livreur = livreurs.find(l => l.isAvailable) || livreurs[0]
 
 // Créer une commande de test
 const testOrder = new Order({
 orderNumber: 'HM-TEST-001',
 userId: new mongoose.Types.ObjectId(), // ID fictif
 items: [{
 productId: new mongoose.Types.ObjectId(),
 title: 'Produit de test',
 slug: 'produit-test',
 image: '/placeholder-product.jpg',
 price: 25.99,
 quantity: 2,
 totalPrice: 51.98
 }],
 totals: {
 subtotal: 51.98,
 deliveryFee: 5.99,
 taxes: 11.59,
 discounts: 0,
 total: 69.56
 },
 payment: {
 method: 'stripe',
 status: 'succeeded',
 amount: 69.56,
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
 status: 'assigned',
 assignedDriverId: livreur._id,
 deliveryCode: '123456',
 estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // +2h
 },
 status: 'confirmed',
 orderProgress: {
 step: 'in_transit',
 currentStep: 2,
 totalSteps: 3
 }
 })

 await testOrder.save()
 console.log(` Commande de test créée: ${testOrder.orderNumber} assignée à ${livreur.name?.first} ${livreur.name?.last}`)
 }

 // 6. Vérifier les commandes du livreur spécifique
 if (livreurs.length > 0) {
 const livreurId = livreurs[0]._id
 const livreurOrders = await Order.find({
 'delivery.assignedDriverId': livreurId
 })
 console.log(`\n Commandes du livreur ${livreurs[0].name?.first}: ${livreurOrders.length}`)
 
 livreurOrders.forEach(order => {
 console.log(` - ${order.orderNumber} - ${order.delivery.status} - ${order.totals.total}€`)
 })
 }

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

debugDeliveries()
