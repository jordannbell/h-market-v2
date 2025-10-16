const { MongoClient } = require('mongodb');

// Configuration MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jordanbe37x21:password123@cluster0.mongodb.net/h-market?retryWrites=true&w=majority';
const DB_NAME = 'h-market';

async function testOrders() {
 const client = new MongoClient(MONGODB_URI);
 
 try {
 console.log(' Connexion à MongoDB Atlas...');
 await client.connect();
 console.log(' Connecté à MongoDB Atlas');
 
 const db = client.db(DB_NAME);
 
 // 1. Vérifier les collections
 console.log('\n Collections disponibles :');
 const collections = await db.listCollections().toArray();
 collections.forEach(col => console.log(`- ${col.name}`));
 
 // 2. Vérifier les commandes
 console.log('\n Commandes dans la base :');
 const orders = await db.collection('orders').find({}).toArray();
 console.log(`Total: ${orders.length} commandes`);
 
 orders.forEach(order => {
 console.log(`\nCommande: ${order.orderNumber}`);
 console.log(`- Statut: ${order.status}`);
 console.log(`- Client: ${order.customer.name}`);
 console.log(`- Total: ${order.total}€`);
 console.log(`- Priorité: ${order.priority}`);
 console.log(`- Livraison: ${order.delivery?.status || 'N/A'}`);
 console.log(`- Driver ID: ${order.delivery?.driverId || 'Non assigné'}`);
 });
 
 // 3. Vérifier les commandes disponibles
 console.log('\n Commandes disponibles pour la livraison :');
 const availableOrders = await db.collection('orders').find({
 status: 'pending',
 paymentStatus: 'paid',
 'delivery.driverId': null
 }).toArray();
 
 console.log(`Disponibles: ${availableOrders.length} commandes`);
 
 // 4. Vérifier les utilisateurs
 console.log('\n Utilisateurs dans la base :');
 const users = await db.collection('users').find({}).toArray();
 console.log(`Total: ${users.length} utilisateurs`);
 
 users.forEach(user => {
 console.log(`\nUtilisateur: ${user.name}`);
 console.log(`- Email: ${user.email}`);
 console.log(`- Rôle: ${user.role}`);
 console.log(`- Actif: ${user.isActive}`);
 if (user.role === 'livreur') {
 console.log(`- Disponible: ${user.isAvailable}`);
 console.log(`- Véhicule: ${user.vehicleType}`);
 console.log(`- Zone: ${user.deliveryZone}`);
 }
 });
 
 // 5. Test de l'API available-orders
 console.log('\n Test de l\'API available-orders :');
 console.log('GET /api/delivery/available-orders');
 console.log('Headers: Authorization: Bearer <token>');
 console.log('Résultat attendu:');
 console.log(JSON.stringify({
 success: true,
 orders: availableOrders.map(order => ({
 _id: order._id,
 orderNumber: order.orderNumber,
 customer: order.customer,
 address: order.address,
 items: order.items,
 total: order.total,
 status: order.status,
 priority: order.priority,
 estimatedDeliveryTime: order.delivery?.estimatedDeliveryTime,
 createdAt: order.createdAt
 }))
 }, null, 2));
 
 } catch (error) {
 console.error(' Erreur lors du test:', error);
 } finally {
 await client.close();
 console.log('\n Connexion fermée');
 }
}

// Exécuter si appelé directement
if (require.main === module) {
 testOrders();
}

module.exports = { testOrders };
