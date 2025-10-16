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

const User = mongoose.model('User', UserSchema)

async function fixLivreurStatus() {
 try {
 await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/h-market')
 console.log(' Connecté à MongoDB')

 // Mettre à jour le statut du livreur
 const result = await User.updateMany(
 { role: 'livreur' },
 { 
 $set: { 
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
 }
 }
 )

 console.log(` ${result.modifiedCount} livreur(s) mis à jour`)

 // Vérifier les livreurs
 const livreurs = await User.find({ role: 'livreur' })
 console.log('\n Livreurs après mise à jour:')
 livreurs.forEach(livreur => {
 console.log(` - ${livreur.name?.first} ${livreur.name?.last}`)
 console.log(` Disponible: ${livreur.isAvailable}`)
 console.log(` Véhicule: ${livreur.vehicleType}`)
 console.log(` Zone: ${livreur.deliveryZone}`)
 console.log(` Note: ${livreur.rating}`)
 })

 } catch (error) {
 console.error(' Erreur:', error)
 } finally {
 await mongoose.disconnect()
 console.log('\n Déconnecté de MongoDB')
 }
}

fixLivreurStatus()
