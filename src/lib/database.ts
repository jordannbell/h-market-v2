import mongoose from 'mongoose'

// Validation de la variable d'environnement MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
 throw new Error(
 'La variable d\'environnement MONGODB_URI doit être définie dans .env'
 )
}

// Initialisation du cache global pour la connexion MongoDB
// Ceci évite les reconnexions multiples en développement (hot reload)
if (!global.mongoose) {
 global.mongoose = { conn: null, promise: null }
}

const cached = global.mongoose

/**
 * Fonction pour se connecter à MongoDB avec un système de cache
 * Réutilise la connexion existante si elle est disponible
 * @returns Promise<typeof mongoose> - Instance mongoose connectée
 */
export async function connectDB(): Promise<typeof mongoose> {
 // Si une connexion existe déjà, la réutiliser
 if (cached.conn) {
 return cached.conn
 }

 // Si aucune promesse de connexion n'existe, en créer une
 if (!cached.promise) {
 const opts = {
 bufferCommands: false, // Désactiver le buffering des commandes
 }

 cached.promise = mongoose
 .connect(MONGODB_URI, opts)
 .then((mongooseInstance) => {
 console.log(' Connexion MongoDB établie avec succès')
 return mongooseInstance
 })
 .catch((error) => {
 console.error(' Échec de la connexion MongoDB:', error)
 throw error
 })
 }

 try {
 // Attendre que la promesse se résolve
 cached.conn = await cached.promise
 } catch (error) {
 // En cas d'erreur, réinitialiser la promesse pour permettre une nouvelle tentative
 cached.promise = null
 throw error
 }

 return cached.conn
}

// Écouteurs d'événements pour la connexion MongoDB
mongoose.connection.on('connected', () => {
 console.log(' MongoDB: Connecté avec succès')
})

mongoose.connection.on('error', (err) => {
 console.error(' MongoDB: Erreur de connexion -', err.message)
})

mongoose.connection.on('disconnected', () => {
 console.log(' MongoDB: Déconnecté')
})

mongoose.connection.on('reconnected', () => {
 console.log(' MongoDB: Reconnecté')
})

// Gestion propre de l'arrêt de l'application
const gracefulShutdown = async (signal: string) => {
 console.log(`\n️ Signal ${signal} reçu, fermeture de la connexion MongoDB...`)
 try {
 await mongoose.connection.close()
 console.log(' Connexion MongoDB fermée proprement')
 process.exit(0)
 } catch (error) {
 console.error(' Erreur lors de la fermeture de MongoDB:', error)
 process.exit(1)
 }
}

// Écouter les signaux d'arrêt
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

