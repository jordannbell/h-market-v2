// Script pour activer un compte utilisateur
// Usage: node scripts/activate-user.js

const { MongoClient } = require('mongodb')

const activateUser = async () => {
 console.log(' Activation du compte utilisateur')
 console.log('====================================')
 
 try {
 // Connexion à MongoDB
 const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market'
 const client = new MongoClient(uri)
 await client.connect()
 
 console.log(' Connecté à MongoDB')
 
 const db = client.db()
 const usersCollection = db.collection('users')
 
 // Activer le compte livreur
 const result = await usersCollection.updateOne(
 { email: 'jordanbe37x21@gmail.com' },
 { $set: { isActive: true } }
 )
 
 if (result.matchedCount > 0) {
 console.log(' Compte activé avec succès !')
 
 // Vérifier la mise à jour
 const updatedUser = await usersCollection.findOne({ email: 'jordanbe37x21@gmail.com' })
 console.log(' Détails du compte:')
 console.log(` - Nom: ${updatedUser.name.first} ${updatedUser.name.last}`)
 console.log(` - Email: ${updatedUser.email}`)
 console.log(` - Rôle: ${updatedUser.role}`)
 console.log(` - Actif: ${updatedUser.isActive ? ' Oui' : ' Non'}`)
 console.log(` - Vérifié: ${updatedUser.isVerified ? ' Oui' : ' Non'}`)
 } else {
 console.log(' Utilisateur non trouvé')
 }
 
 await client.close()
 console.log('\n Activation terminée !')
 
 } catch (error) {
 console.error(' Erreur lors de l\'activation:', error)
 }
}

// Exécuter l'activation
if (require.main === module) {
 activateUser()
}

module.exports = { activateUser }

