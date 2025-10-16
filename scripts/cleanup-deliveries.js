const { MongoClient } = require('mongodb');

async function cleanupDeliveries() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market');
  
  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connecté à MongoDB');
    
    const db = client.db();
    const ordersCollection = db.collection('orders');
    
    // Compter les commandes avant suppression
    const totalOrders = await ordersCollection.countDocuments();
    console.log(`📊 Total des commandes: ${totalOrders}`);
    
    // Supprimer toutes les commandes livrées
    const deliveredResult = await ordersCollection.deleteMany({
      'delivery.status': 'delivered'
    });
    console.log(`🗑️  Commandes livrées supprimées: ${deliveredResult.deletedCount}`);
    
    // Supprimer toutes les commandes avec statut 'completed'
    const completedResult = await ordersCollection.deleteMany({
      status: 'completed'
    });
    console.log(`🗑️  Commandes terminées supprimées: ${completedResult.deletedCount}`);
    
    // Supprimer toutes les commandes avec statut 'cancelled'
    const cancelledResult = await ordersCollection.deleteMany({
      status: 'cancelled'
    });
    console.log(`🗑️  Commandes annulées supprimées: ${cancelledResult.deletedCount}`);
    
    // Compter les commandes restantes
    const remainingOrders = await ordersCollection.countDocuments();
    console.log(`📊 Commandes restantes: ${remainingOrders}`);
    
    // Afficher les commandes restantes par statut
    const statusCounts = await ordersCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('\n📋 Répartition des commandes restantes:');
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });
    
    // Afficher les statuts de livraison restants
    const deliveryStatusCounts = await ordersCollection.aggregate([
      {
        $group: {
          _id: '$delivery.status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('\n🚚 Répartition des statuts de livraison:');
    deliveryStatusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });
    
    console.log('\n✅ Nettoyage terminé !');
    console.log('🎯 Vous pouvez maintenant créer de nouvelles commandes pour vos tests');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await client.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
cleanupDeliveries();

