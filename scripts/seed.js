const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
 console.error(' MONGODB_URI non configuré dans .env.local')
 process.exit(1)
}

// Définir les schémas directement dans le script
const userSchema = new mongoose.Schema({
 name: {
 first: {
 type: String,
 required: [true, 'Le prénom est requis'],
 trim: true
 },
 last: {
 type: String,
 required: [true, 'Le nom est requis'],
 trim: true
 }
 },
 email: {
 type: String,
 required: [true, 'L\'email est requis'],
 unique: true,
 lowercase: true,
 trim: true,
 match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
 },
 phone: {
 type: String,
 required: [true, 'Le numéro de téléphone est requis'],
 trim: true
 },
 password: {
 type: String,
 required: [true, 'Le mot de passe est requis'],
 minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
 },
 role: {
 type: String,
 enum: ['admin', 'vendeur', 'client', 'livreur'],
 default: 'client'
 },
 isVerified: {
 type: Boolean,
 default: false
 },
 isActive: {
 type: Boolean,
 default: true
 },
 vehicleType: {
 type: String,
 enum: ['voiture', 'moto', 'scooter', 'velo']
 },
 licensePlate: {
 type: String,
 trim: true
 },
 deliveryZone: {
 type: String,
 enum: ['paris-centre', 'paris-nord', 'paris-sud', 'paris-est', 'paris-ouest', 'banlieue-nord', 'banlieue-sud']
 },
 isAvailable: {
 type: Boolean,
 default: false
 },
 rating: {
 type: Number,
 min: 0,
 max: 5,
 default: 0
 },
 totalDeliveries: {
 type: Number,
 min: 0,
 default: 0
 },
 address: {
 street: {
 type: String,
 trim: true
 },
 city: {
 type: String,
 trim: true
 },
 postalCode: {
 type: String,
 trim: true
 },
 country: {
 type: String,
 default: 'France'
 }
 },
 preferences: {
 favoriteCategories: [{
 type: String,
 enum: ['Fruits & Légumes', 'Épices & Condiments', 'Céréales & Grains', 'Boissons', 'Huiles & Beurres', 'Produits Transformés']
 }],
 notifications: {
 email: {
 type: Boolean,
 default: true
 },
 sms: {
 type: Boolean,
 default: false
 },
 push: {
 type: Boolean,
 default: true
 }
 }
 }
}, {
 timestamps: true
})

const productSchema = new mongoose.Schema({
 title: {
 type: String,
 required: [true, 'Le titre est requis'],
 trim: true
 },
 slug: {
 type: String,
 unique: true,
 required: [true, 'Le slug est requis'],
 trim: true
 },
 description: {
 type: String,
 required: [true, 'La description est requise'],
 trim: true
 },
 price: {
 type: Number,
 required: [true, 'Le prix est requis'],
 min: [0, 'Le prix ne peut pas être négatif']
 },
 images: [{
 type: String,
 required: [true, 'Au moins une image est requise']
 }],
 category: {
 type: String,
 required: [true, 'La catégorie est requise'],
 enum: ['Fruits & Légumes', 'Épices & Condiments', 'Céréales & Grains', 'Boissons', 'Huiles & Beurres', 'Produits Transformés']
 },
 originCountry: {
 type: String,
 required: [true, 'Le pays d\'origine est requis'],
 trim: true
 },
 stock: {
 type: Number,
 required: [true, 'Le stock est requis'],
 min: [0, 'Le stock ne peut pas être négatif']
 },
 unit: {
 type: String,
 required: [true, 'L\'unité est requise'],
 enum: ['kg', 'g', 'l', 'ml', 'pièce', 'paquet']
 },
 weight: {
 type: Number,
 required: [true, 'Le poids est requis'],
 min: [0, 'Le poids ne peut pas être négatif']
 },
 ingredients: [{
 type: String,
 trim: true
 }],
 allergens: [{
 type: String,
 trim: true
 }],
 nutritionalInfo: {
 calories: {
 type: Number,
 min: 0
 },
 protein: {
 type: Number,
 min: 0
 },
 carbs: {
 type: Number,
 min: 0
 },
 fat: {
 type: Number,
 min: 0
 },
 fiber: {
 type: Number,
 min: 0
 }
 },
 isApproved: {
 type: Boolean,
 default: false
 },
 isActive: {
 type: Boolean,
 default: true
 },
 isFeatured: {
 type: Boolean,
 default: false
 }
}, {
 timestamps: true
})

// Créer les modèles
const User = mongoose.models.User || mongoose.model('User', userSchema)
const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

// Fonction pour hasher les mots de passe
async function hashPassword(password) {
 const salt = await bcrypt.genSalt(12)
 return bcrypt.hash(password, salt)
}

async function seedDatabase() {
 try {
 console.log(' Début du seeding de la base de données...')

 // Connexion à MongoDB
 await mongoose.connect(MONGODB_URI)
 console.log(' Connecté à MongoDB')

 // Nettoyer la base de données
 await User.deleteMany({})
 // Ne pas supprimer les produits existants pour garder ceux ajoutés par l'admin
 console.log(' Base de données nettoyée (utilisateurs uniquement)')

 // Créer un utilisateur admin
 const hashedAdminPassword = await hashPassword('admin123')
 const adminUser = new User({
 name: {
 first: 'Admin',
 last: 'H-Market'
 },
 email: 'admin@h-market.com',
 phone: '+33123456789',
 password: hashedAdminPassword,
 role: 'admin',
 isVerified: true
 })
 await adminUser.save()
 console.log(' Utilisateur admin créé')

 // Créer un utilisateur vendeur
 const hashedVendorPassword = await hashPassword('vendeur123')
 const vendorUser = new User({
 name: {
 first: 'Vendeur',
 last: 'Africain'
 },
 email: 'vendeur@h-market.com',
 phone: '+33987654321',
 password: hashedVendorPassword,
 role: 'vendeur',
 isVerified: true
 })
 await vendorUser.save()
 console.log(' Utilisateur vendeur créé')

 // Créer un utilisateur client
 const hashedClientPassword = await hashPassword('client123')
 const clientUser = new User({
 name: {
 first: 'Marie',
 last: 'Dubois'
 },
 email: 'client@h-market.com',
 phone: '+33612345678',
 password: hashedClientPassword,
 role: 'client',
 isVerified: true,
 address: {
 street: '123 Rue de la Paix',
 city: 'Paris',
 postalCode: '75001',
 country: 'France'
 },
 preferences: {
 favoriteCategories: ['Fruits & Légumes', 'Épices & Condiments'],
 notifications: {
 email: true,
 sms: false,
 push: true
 }
 }
 })
 await clientUser.save()
 console.log(' Utilisateur client créé')

 // Créer un utilisateur livreur
 const hashedDriverPassword = await hashPassword('livreur123')
 const driverUser = new User({
 name: {
 first: 'Ahmed',
 last: 'Benali'
 },
 email: 'livreur@h-market.com',
 phone: '+33698765432',
 password: hashedDriverPassword,
 role: 'livreur',
 isVerified: true,
 vehicleType: 'moto',
 licensePlate: 'AB-123-CD',
 deliveryZone: 'paris-centre',
 isAvailable: true,
 rating: 4.5,
 totalDeliveries: 25
 })
 await driverUser.save()
 console.log(' Utilisateur livreur créé')

 console.log(' Aucun produit de test créé - seuls les produits ajoutés par l\'admin seront affichés')

 console.log('\n Seeding terminé avec succès!')
 console.log('\n Comptes de test:')
 console.log(' Admin: admin@h-market.com / admin123')
 console.log(' Vendeur: vendeur@h-market.com / vendeur123')
 console.log(' Client: client@h-market.com / client123')
 console.log(' Livreur: livreur@h-market.com / livreur123')
 console.log('\n Accédez à: http://localhost:3000')

 } catch (error) {
 console.error(' Erreur lors du seeding:', error)
 } finally {
 await mongoose.disconnect()
 console.log(' Déconnecté de MongoDB')
 process.exit(0)
 }
}

seedDatabase()
