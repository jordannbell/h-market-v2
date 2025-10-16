const { MongoClient } = require('mongodb');

// Configuration MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jordanbe37x21:password123@cluster0.mongodb.net/h-market?retryWrites=true&w=majority';
const DB_NAME = 'h-market';

async function testDeliveries() {
 const client = new MongoClient(MONGODB_URI);
 
 try {
 console.log(' Connexion à MongoDB Atlas...');
 await client.connect();
 console.log(' Connecté à MongoDB Atlas');
 
 const db = client.db(DB_NAME);
 
 console.log('\n === TEST DES LIVRAISONS ===\n');
 
 // 1. Vérifier la structure de la collection deliveries
 console.log('1️⃣ Vérification de la structure deliveries...');
 const deliveriesCollection = db.collection('deliveries');
 const deliveriesCount = await deliveriesCollection.countDocuments();
 console.log(` Total livraisons: ${deliveriesCount}`);
 
 if (deliveriesCount > 0) {
 const sampleDelivery = await deliveriesCollection.findOne();
 console.log(' Structure d\'une livraison:');
 console.log(' - orderId:', sampleDelivery.orderId);
 console.log(' - customerId:', sampleDelivery.customerId);
 console.log(' - driverId:', sampleDelivery.driverId);
 console.log(' - status:', sampleDelivery.status);
 console.log(' - pickupLocation:', sampleDelivery.pickupLocation?.address);
 console.log(' - deliveryLocation:', sampleDelivery.deliveryLocation?.address);
 }
 
 // 2. Vérifier les commandes
 console.log('\n2️⃣ Vérification des commandes...');
 const ordersCollection = db.collection('orders');
 const ordersCount = await ordersCollection.countDocuments();
 console.log(` Total commandes: ${ordersCount}`);
 
 if (ordersCount > 0) {
 const orders = await ordersCollection.find({}).toArray();
 orders.forEach((order, index) => {
 console.log(` Commande ${index + 1}:`);
 console.log(` - ID: ${order._id}`);
 console.log(` - Numéro: ${order.orderNumber}`);
 console.log(` - Statut: ${order.status}`);
 console.log(` - Client: ${order.customer?.name}`);
 console.log(` - Total: ${order.total}€`);
 console.log(` - Livraison: ${order.delivery?.status}`);
 });
 }
 
 // 3. Vérifier les utilisateurs
 console.log('\n3️⃣ Vérification des utilisateurs...');
 const usersCollection = db.collection('users');
 const usersCount = await usersCollection.countDocuments();
 console.log(` Total utilisateurs: ${usersCount}`);
 
 if (usersCount > 0) {
 const users = await usersCollection.find({}).toArray();
 users.forEach((user, index) => {
 console.log(` Utilisateur ${index + 1}:`);
 console.log(` - ID: ${user._id}`);
 console.log(` - Nom: ${user.name}`);
 console.log(` - Email: ${user.email}`);
 console.log(` - Rôle: ${user.role}`);
 console.log(` - Actif: ${user.isActive ? 'Oui' : 'Non'}`);
 if (user.role === 'livreur') {
 console.log(` - Disponible: ${user.isAvailable ? 'Oui' : 'Non'}`);
 console.log(` - Véhicule: ${user.vehicleType}`);
 }
 });
 }
 
 // 4. Vérifier les liens entre livraisons et commandes
 console.log('\n4️⃣ Vérification des liens livraisons-commandes...');
 const deliveries = await deliveriesCollection.find({}).toArray();
 
 if (deliveries.length > 0) {
 for (const delivery of deliveries) {
 console.log(`\n Livraison ID: ${delivery._id}`);
 
 // Trouver la commande associée
 const order = await ordersCollection.findOne({ _id: delivery.orderId });
 if (order) {
 console.log(` Commande trouvée: ${order.orderNumber} (${order.status})`);
 console.log(` - Client: ${order.customer?.name}`);
 console.log(` - Total: ${order.total}€`);
 } else {
 console.log(` Commande non trouvée pour orderId: ${delivery.orderId}`);
 }
 
 // Trouver le livreur si assigné
 if (delivery.driverId) {
 const driver = await usersCollection.findOne({ _id: delivery.driverId });
 if (driver) {
 console.log(` Livreur trouvé: ${driver.name} (${driver.vehicleType})`);
 } else {
 console.log(` Livreur non trouvé pour driverId: ${delivery.driverId}`);
 }
 } else {
 console.log(` Aucun livreur assigné`);
 }
 
 // Trouver le client
 if (delivery.customerId) {
 const customer = await usersCollection.findOne({ _id: delivery.customerId });
 if (customer) {
 console.log(` Client trouvé: ${customer.name}`);
 } else {
 console.log(` Client non trouvé pour customerId: ${delivery.customerId}`);
 }
 } else {
 console.log(` Aucun client assigné`);
 }
 
 console.log(` Statut: ${delivery.status}`);
 console.log(` Point de ramassage: ${delivery.pickupLocation?.address}`);
 console.log(` Point de livraison: ${delivery.deliveryLocation?.address}`);
 }
 }
 
 // 5. Créer des liens manquants
 console.log('\n5️⃣ Création des liens manquants...');
 
 // Mettre à jour les livraisons avec les IDs des clients
 for (const delivery of deliveries) {
 if (!delivery.customerId) {
 const order = await ordersCollection.findOne({ _id: delivery.orderId });
 if (order) {
 // Chercher le client par email
 const customer = await usersCollection.findOne({ 
 email: order.customer?.email,
 role: 'client'
 });
 
 if (customer) {
 await deliveriesCollection.updateOne(
 { _id: delivery._id },
 { $set: { customerId: customer._id } }
 );
 console.log(` Client ${customer.name} lié à la livraison ${delivery._id}`);
 } else {
 console.log(` ️ Client non trouvé pour ${order.customer?.email}`);
 }
 }
 }
 }
 
 // 6. Statistiques finales
 console.log('\n6️⃣ Statistiques finales...');
 const finalDeliveries = await deliveriesCollection.find({}).toArray();
 
 const stats = {
 total: finalDeliveries.length,
 pending: finalDeliveries.filter(d => d.status === 'pending').length,
 assigned: finalDeliveries.filter(d => d.status === 'assigned').length,
 inTransit: finalDeliveries.filter(d => d.status === 'in_transit').length,
 delivered: finalDeliveries.filter(d => d.status === 'delivered').length,
 withCustomer: finalDeliveries.filter(d => d.customerId).length,
 withDriver: finalDeliveries.filter(d => d.driverId).length
 };
 
 console.log(' Résumé des livraisons:');
 console.log(` - Total: ${stats.total}`);
 console.log(` - En attente: ${stats.pending}`);
 console.log(` - Assignées: ${stats.assigned}`);
 console.log(` - En transit: ${stats.inTransit}`);
 console.log(` - Livrées: ${stats.delivered}`);
 console.log(` - Avec client: ${stats.withCustomer}`);
 console.log(` - Avec livreur: ${stats.withDriver}`);
 
 console.log('\n Test des livraisons terminé !');
 
 } catch (error) {
 console.error(' Erreur lors du test:', error);
 } finally {
 await client.close();
 console.log('\n Connexion fermée');
 }
}

// Exécuter si appelé directement
if (require.main === module) {
 testDeliveries();
}

module.exports = { testDeliveries };

