const mongoose = require('mongoose')
require('dotenv').config()

// Modèles complets
const OrderSchema = new mongoose.Schema({
 orderNumber: String,
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 delivery: {
 mode: String,
 status: String,
 assignedDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
 deliveryCode: String
 }
}, { timestamps: true, strict: false })

const Order = mongoose.model('Order', OrderSchema)

async function checkAllOrders() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // Récupérer toutes les commandes
 const orders = await Order.find({})
 
 console.log(`\n Total: ${orders.length} commandes`)
 console.log('\n Détails des modes de livraison:')
 
 const modeCounts = {}
 const problematicOrders = []
 
 orders.forEach(order => {
 const mode = order.delivery?.mode
 
 if (!mode || !['planned', 'express', 'outside_idf', 'standard'].includes(mode)) {
 problematicOrders.push({
 orderNumber: order.orderNumber,
 mode: mode || 'undefined',
 status: order.delivery?.status
 })
 }
 
 const modeKey = mode || 'undefined'
 modeCounts[modeKey] = (modeCounts[modeKey] || 0) + 1
 })
 
 console.log('\n Comptage par mode:')
 Object.entries(modeCounts).forEach(([mode, count]) => {
 console.log(` - ${mode}: ${count} commandes`)
 })
 
 if (problematicOrders.length > 0) {
 console.log(`\n️ ${problematicOrders.length} commandes problématiques:`)
 problematicOrders.forEach(order => {
 console.log(` - ${order.orderNumber}: mode="${order.mode}", status="${order.status}"`)
 })
 } else {
 console.log('\n Toutes les commandes ont un mode valide')
 }

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

checkAllOrders()
