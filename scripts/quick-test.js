const { MongoClient } = require('mongodb');

// Configuration MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jordanbe37x21:password123@cluster0.mongodb.net/h-market?retryWrites=true&w=majority';
const DB_NAME = 'h-market';

async function quickTest() {
 const client = new MongoClient(MONGODB_URI);
 
 try {
 console.log(' Connexion rapide à MongoDB Atlas...');
 await client.connect();
 console.log(' Connecté !');
 
 const db = client.db(DB_NAME);
 
 console.log('\n === TEST RAPIDE ===\n');
 
 // 1. Vérifier les collections
 const collections = await db.listCollections().toArray();
 console.log(' Collections trouvées:', collections.length);
 collections.forEach(col => console.log(` - ${col.name}`));
 
 // 2. Compter les documents
 const usersCount = await db.collection('users').countDocuments();
 const ordersCount = await db.collection('orders').countDocuments();
 const deliveriesCount = await db.collection('deliveries').countDocuments();
 const productsCount = await db.collection('products').countDocuments();
 
 console.log('\n Nombre de documents:');
 console.log(` Utilisateurs: ${usersCount}`);
 console.log(` Commandes: ${ordersCount}`);
 console.log(` Livraisons: ${deliveriesCount}`);
 console.log(` ️ Produits: ${productsCount}`);
 
 // 3. Vérifier les liens
 if (deliveriesCount > 0) {
 const delivery = await db.collection('deliveries').findOne();
 console.log('\n Exemple de livraison:');
 console.log(` - ID: ${delivery._id}`);
 console.log(` - Commande: ${delivery.orderId}`);
 console.log(` - Client: ${delivery.customerId || 'Non assigné'}`);
 console.log(` - Livreur: ${delivery.driverId || 'Non assigné'}`);
 console.log(` - Statut: ${delivery.status}`);
 console.log(` - Point de ramassage: ${delivery.pickupLocation?.address}`);
 console.log(` - Point de livraison: ${delivery.deliveryLocation?.address}`);
 }
 
 // 4. Vérifier les index
 const deliveriesIndexes = await db.collection('deliveries').indexes();
 console.log('\n Index deliveries:', deliveriesIndexes.length);
 deliveriesIndexes.forEach(idx => {
 const keys = Object.keys(idx.key).join(', ');
 console.log(` - ${keys} ${idx.unique ? '(unique)' : ''}`);
 });
 
 console.log('\n Test rapide terminé !');
 
 if (usersCount > 0 && ordersCount > 0 && deliveriesCount > 0) {
 console.log(' Structure complète détectée !');
 } else {
 console.log('️ Certains éléments manquent, exécutez setup-database.js');
 }
 
 } catch (error) {
 console.error(' Erreur:', error.message);
 } finally {
 await client.close();
 console.log('\n Connexion fermée');
 }
}

if (require.main === module) {
 quickTest();
}

module.exports = { quickTest };

