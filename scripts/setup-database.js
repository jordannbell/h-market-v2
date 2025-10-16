const { MongoClient } = require('mongodb');

// Configuration MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://jordanbe37x21:password123@cluster0.mongodb.net/h-market?retryWrites=true&w=majority';
const DB_NAME = 'h-market';

async function setupDatabase() {
 const client = new MongoClient(MONGODB_URI);
 
 try {
 console.log(' Connexion à MongoDB Atlas...');
 await client.connect();
 console.log(' Connecté à MongoDB Atlas');
 
 const db = client.db(DB_NAME);
 
 // 1. Créer les collections avec validation
 console.log('\n Création des collections...');
 
 // Collection users
 try {
 await db.createCollection('users', {
 validator: {
 $jsonSchema: {
 bsonType: 'object',
 required: ['name', 'email', 'password', 'role'],
 properties: {
 email: { bsonType: 'string', pattern: '^[^@]+@[^@]+\\.[^@]+$' },
 role: { enum: ['client', 'livreur', 'admin'] }
 }
 }
 }
 });
 console.log(' Collection users créée');
 } catch (error) {
 if (error.code === 48) {
 console.log('ℹ️ Collection users existe déjà');
 } else {
 console.log(' Erreur création users:', error.message);
 }
 }
 
 // Collection products
 try {
 await db.createCollection('products', {
 validator: {
 $jsonSchema: {
 bsonType: 'object',
 required: ['name', 'price', 'category'],
 properties: {
 price: { bsonType: 'double', minimum: 0 }
 }
 }
 }
 });
 console.log(' Collection products créée');
 } catch (error) {
 if (error.code === 48) {
 console.log('ℹ️ Collection products existe déjà');
 } else {
 console.log(' Erreur création products:', error.message);
 }
 }
 
 // Collection orders
 try {
 await db.createCollection('orders', {
 validator: {
 $jsonSchema: {
 bsonType: 'object',
 required: ['orderNumber', 'customer', 'items', 'total', 'status'],
 properties: {
 status: { enum: ['pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'] },
 priority: { enum: ['low', 'medium', 'high'] }
 }
 }
 }
 });
 console.log(' Collection orders créée');
 } catch (error) {
 if (error.code === 48) {
 console.log('ℹ️ Collection orders existe déjà');
 } else {
 console.log(' Erreur création orders:', error.message);
 }
 }
 
 // Collection deliveries - Table complète des livraisons
 try {
 await db.createCollection('deliveries', {
 validator: {
 $jsonSchema: {
 bsonType: 'object',
 required: ['orderId', 'customerId', 'driverId', 'status', 'createdAt'],
 properties: {
 orderId: { bsonType: 'objectId' },
 customerId: { bsonType: 'objectId' },
 driverId: { bsonType: 'objectId' },
 status: { 
 enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'] 
 },
 pickupLocation: {
 bsonType: 'object',
 properties: {
 type: { enum: ['Point'] },
 coordinates: { 
 bsonType: 'array',
 items: { bsonType: 'double' },
 minItems: 2,
 maxItems: 2
 },
 address: { bsonType: 'string' }
 }
 },
 deliveryLocation: {
 bsonType: 'object',
 properties: {
 type: { enum: ['Point'] },
 coordinates: { 
 bsonType: 'array',
 items: { bsonType: 'double' },
 minItems: 2,
 maxItems: 2
 },
 address: { bsonType: 'string' }
 }
 },
 estimatedPickupTime: { bsonType: 'date' },
 estimatedDeliveryTime: { bsonType: 'date' },
 actualPickupTime: { bsonType: 'date' },
 actualDeliveryTime: { bsonType: 'date' },
 distance: { bsonType: 'double' },
 duration: { bsonType: 'int' },
 deliveryFee: { bsonType: 'double' },
 notes: { bsonType: 'string' },
 createdAt: { bsonType: 'date' },
 updatedAt: { bsonType: 'date' }
 }
 }
 }
 });
 console.log(' Collection deliveries créée avec structure complète');
 } catch (error) {
 if (error.code === 48) {
 console.log('ℹ️ Collection deliveries existe déjà');
 } else {
 console.log(' Erreur création deliveries:', error.message);
 }
 }
 
 // Collection notifications
 try {
 await db.createCollection('notifications');
 console.log(' Collection notifications créée');
 } catch (error) {
 if (error.code === 48) {
 console.log('ℹ️ Collection notifications existe déjà');
 } else {
 console.log(' Erreur création notifications:', error.message);
 }
 }
 
 // Collection tracking_history
 try {
 await db.createCollection('tracking_history');
 console.log(' Collection tracking_history créée');
 } catch (error) {
 if (error.code === 48) {
 console.log('ℹ️ Collection tracking_history existe déjà');
 } else {
 console.log(' Erreur création tracking_history:', error.message);
 }
 }
 
 // 2. Créer les index
 console.log('\n Création des index...');
 
 try {
 await db.collection('users').createIndex({ 'email': 1 }, { unique: true });
 await db.collection('users').createIndex({ 'role': 1 });
 await db.collection('users').createIndex({ 'location': '2dsphere' });
 console.log(' Index users créés');
 } catch (error) {
 console.log(' Erreur index users:', error.message);
 }
 
 try {
 await db.collection('orders').createIndex({ 'orderNumber': 1 }, { unique: true });
 await db.collection('orders').createIndex({ 'status': 1 });
 await db.collection('orders').createIndex({ 'customer.email': 1 });
 await db.collection('orders').createIndex({ 'createdAt': -1 });
 console.log(' Index orders créés');
 } catch (error) {
 console.log(' Erreur index orders:', error.message);
 }
 
 try {
 await db.collection('products').createIndex({ 'name': 'text', 'description': 'text' });
 await db.collection('products').createIndex({ 'category': 1 });
 console.log(' Index products créés');
 } catch (error) {
 console.log(' Erreur index products:', error.message);
 }
 
 try {
 await db.collection('deliveries').createIndex({ 'orderId': 1 }, { unique: true });
 await db.collection('deliveries').createIndex({ 'customerId': 1 });
 await db.collection('deliveries').createIndex({ 'driverId': 1 });
 await db.collection('deliveries').createIndex({ 'status': 1 });
 await db.collection('deliveries').createIndex({ 'createdAt': -1 });
 await db.collection('deliveries').createIndex({ 'pickupLocation': '2dsphere' });
 await db.collection('deliveries').createIndex({ 'deliveryLocation': '2dsphere' });
 console.log(' Index deliveries créés avec géolocalisation');
 } catch (error) {
 console.log(' Erreur index deliveries:', error.message);
 }
 
 try {
 await db.collection('notifications').createIndex({ 'userId': 1, 'isRead': 1 });
 await db.collection('notifications').createIndex({ 'createdAt': -1 });
 console.log(' Index notifications créés');
 } catch (error) {
 console.log(' Erreur index notifications:', error.message);
 }
 
 try {
 await db.collection('tracking_history').createIndex({ 'orderId': 1, 'timestamp': -1 });
 console.log(' Index tracking_history créés');
 } catch (error) {
 console.log(' Erreur index tracking_history:', error.message);
 }
 
 // 3. Insérer des données de test
 console.log('\n Insertion des données de test...');
 
 // Vérifier si le livreur existe déjà
 const existingDriver = await db.collection('users').findOne({ email: 'jordanbe37x21@gmail.com' });
 
 if (!existingDriver) {
 const driver = await db.collection('users').insertOne({
 name: 'Jordan BELL',
 email: 'jordanbe37x21@gmail.com',
 phone: '+33 6 12 34 56 78',
 password: '$2b$10$test.hash.for.jordan.bell.livreur', // Hash bcrypt
 role: 'livreur',
 isVerified: true,
 isActive: true,
 vehicleType: 'Moto',
 licensePlate: 'AB-123-CD',
 deliveryZone: 'Paris Centre',
 isAvailable: true,
 rating: 4.8,
 totalDeliveries: 156,
 location: {
 type: 'Point',
 coordinates: [2.3522, 48.8566], // [longitude, latitude]
 address: '123 Rue de la Paix, Paris',
 updatedAt: new Date()
 },
 createdAt: new Date(),
 updatedAt: new Date()
 });
 console.log(' Livreur Jordan BELL créé avec ID:', driver.insertedId);
 } else {
 console.log('ℹ️ Livreur Jordan BELL existe déjà');
 }
 
 // Vérifier si la commande de test existe déjà
 const existingOrder = await db.collection('orders').findOne({ orderNumber: 'HM-TEST-001' });
 
 if (!existingOrder) {
 const order = await db.collection('orders').insertOne({
 orderNumber: 'HM-TEST-001',
 customer: {
 name: 'Client Test',
 phone: '+33 6 00 00 00 00',
 email: 'test@example.com'
 },
 address: {
 street: '1 Rue de Test',
 city: 'Paris',
 postalCode: '75001',
 country: 'France',
 coordinates: {
 type: 'Point',
 coordinates: [2.3522, 48.8566]
 }
 },
 items: [
 {
 product: {
 name: 'Huile d\'Argan',
 price: 25.99
 },
 quantity: 1,
 totalPrice: 25.99
 }
 ],
 subtotal: 25.99,
 deliveryFee: 5.99,
 total: 31.98,
 status: 'pending',
 priority: 'high',
 paymentStatus: 'paid',
 delivery: {
 status: 'pending',
 driverId: null,
 estimatedDeliveryTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4h
 deliveryCode: 'TEST123'
 },
 createdAt: new Date(),
 updatedAt: new Date()
 });
 console.log(' Commande de test HM-TEST-001 créée avec ID:', order.insertedId);
 
 // Créer une livraison de test pour cette commande
 const delivery = await db.collection('deliveries').insertOne({
 orderId: order.insertedId,
 customerId: null, // Sera mis à jour quand on aura un client
 driverId: null, // Sera assigné quand un livreur acceptera
 status: 'pending',
 pickupLocation: {
 type: 'Point',
 coordinates: [2.3522, 48.8566], // Paris centre
 address: '123 Rue de la Paix, Paris'
 },
 deliveryLocation: {
 type: 'Point',
 coordinates: [2.3522, 48.8566], // Même adresse pour le test
 address: '1 Rue de Test, Paris'
 },
 estimatedPickupTime: new Date(Date.now() + 30 * 60 * 1000), // +30min
 estimatedDeliveryTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4h
 actualPickupTime: null,
 actualDeliveryTime: null,
 distance: 2.5, // km
 duration: 15, // minutes
 deliveryFee: 5.99,
 notes: 'Livraison de test - Huile d\'Argan',
 createdAt: new Date(),
 updatedAt: new Date()
 });
 console.log(' Livraison de test créée avec ID:', delivery.insertedId);
 } else {
 console.log('ℹ️ Commande de test HM-TEST-001 existe déjà');
 }
 
 // Insérer quelques produits de test
 const existingProducts = await db.collection('products').countDocuments();
 
 if (existingProducts === 0) {
 const products = await db.collection('products').insertMany([
 {
 name: 'Huile d\'Argan',
 description: 'Huile d\'argan pure et naturelle du Maroc',
 price: 25.99,
 category: 'Beauté',
 image: 'argan1.jpg',
 stock: 50,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 },
 {
 name: 'Beurre de Karité',
 description: 'Beurre de karité bio et naturel',
 price: 19.99,
 category: 'Beauté',
 image: 'karite1.jpg',
 stock: 75,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 },
 {
 name: 'Mangues Séchées',
 description: 'Mangues séchées naturelles d\'Afrique',
 price: 12.99,
 category: 'Alimentation',
 image: 'mangues1.jpg',
 stock: 100,
 isActive: true,
 createdAt: new Date(),
 updatedAt: new Date()
 }
 ]);
 console.log('', products.insertedCount, 'produits de test créés');
 } else {
 console.log('ℹ️', existingProducts, 'produits existent déjà');
 }
 
 console.log('\n Configuration de la base de données terminée !');
 console.log('\n Résumé :');
 console.log('- Collections créées avec validation');
 console.log('- Index optimisés pour les performances');
 console.log('- Livreur Jordan BELL configuré');
 console.log('- Commande de test HM-TEST-001 créée');
 console.log('- Produits de test disponibles');
 
 } catch (error) {
 console.error(' Erreur lors de la configuration:', error);
 } finally {
 await client.close();
 console.log('\n Connexion fermée');
 }
}

// Exécuter si appelé directement
if (require.main === module) {
 setupDatabase();
}

module.exports = { setupDatabase };
