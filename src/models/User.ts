import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'
import type {
 UserRole,
 VehicleType,
 DeliveryZone,
 IUserName,
 IUserAddress,
 IUserLocation,
 IUserPreferences,
} from '@/types/models'

/**
 * Interface pour le modèle User avec toutes ses propriétés et méthodes
 * Étend mongoose.Document pour inclure les fonctionnalités de Mongoose
 */
export interface IUser extends Document {
 name: IUserName
 email: string
 phone: string
 password: string
 role: UserRole
 isVerified: boolean
 isActive: boolean
 // Champs spécifiques au livreur
 vehicleType?: VehicleType
 licensePlate?: string
 deliveryZone?: DeliveryZone
 isAvailable?: boolean
 rating?: number
 totalDeliveries?: number
 location?: IUserLocation
 // Champs spécifiques au client
 address?: IUserAddress
 preferences?: IUserPreferences
 lastLoginAt?: Date
 createdAt: Date
 updatedAt: Date
 // Méthodes d'instance
 comparePassword(candidatePassword: string): Promise<boolean>
 toPublicJSON(): Omit<IUser, 'password'>
 getFullName(): string
}

/**
 * Interface pour les méthodes statiques du modèle User
 */
export interface IUserModel extends mongoose.Model<IUser> {
 findAvailableDrivers(deliveryZone?: DeliveryZone): Promise<IUser[]>
 updateDriverRating(driverId: string, newRating: number): Promise<IUser | null>
}

const userSchema = new Schema<IUser>({
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
 // Champs spécifiques au livreur
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
 location: {
 latitude: {
 type: Number
 },
 longitude: {
 type: Number
 },
 updatedAt: {
 type: Date,
 default: Date.now
 }
 },
 // Champs spécifiques au client
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
 },
 lastLoginAt: {
 type: Date,
 default: null
 }
}, {
 timestamps: true
})

// Index pour améliorer les performances
// Les index sont déjà créés automatiquement par unique: true
userSchema.index({ role: 1 })
userSchema.index({ 'deliveryZone': 1, 'isAvailable': 1 })

// Middleware pour hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
 if (!this.isModified('password')) return next()
 
 try {
 const salt = await bcrypt.genSalt(12)
 this.password = await bcrypt.hash(this.password, salt)
 next()
 } catch (error) {
 next(error as Error)
 }
})

// Validation personnalisée pour les livreurs
userSchema.pre('save', function(next) {
 if (this.role === 'livreur') {
 if (!this.vehicleType) {
 return next(new Error('Le type de véhicule est requis pour les livreurs'))
 }
 if (!this.deliveryZone) {
 return next(new Error('La zone de livraison est requise pour les livreurs'))
 }
 if (this.vehicleType !== 'velo' && !this.licensePlate) {
 return next(new Error('La plaque d\'immatriculation est requise pour les véhicules motorisés'))
 }
 }
 next()
})

/**
 * Méthode d'instance pour comparer le mot de passe fourni avec le hash stocké
 * @param candidatePassword - Mot de passe en clair à vérifier
 * @returns Promise<boolean> - True si les mots de passe correspondent
 */
userSchema.methods.comparePassword = async function (
 candidatePassword: string
): Promise<boolean> {
 try {
 return await bcrypt.compare(candidatePassword, this.password)
 } catch (error) {
 console.error(' Erreur lors de la comparaison des mots de passe:', error)
 return false
 }
}

/**
 * Méthode d'instance pour obtenir le nom complet de l'utilisateur
 * @returns string - Nom complet (prénom + nom)
 */
userSchema.methods.getFullName = function (): string {
 return `${this.name.first} ${this.name.last}`
}

// Champ virtuel pour le nom complet (alternative à la méthode)
userSchema.virtual('fullName').get(function () {
 return this.getFullName()
})

/**
 * Méthode d'instance pour obtenir les informations publiques de l'utilisateur
 * Exclut le mot de passe et les informations sensibles
 * @returns Objet utilisateur sans mot de passe
 */
userSchema.methods.toPublicJSON = function () {
 const userObject = this.toObject()
 // Supprimer le mot de passe pour la sécurité
 delete userObject.password
 return userObject
}

/**
 * Méthode statique pour trouver les livreurs disponibles
 * @param deliveryZone - Zone de livraison optionnelle pour filtrer
 * @returns Promise<IUser[]> - Liste des livreurs disponibles
 */
userSchema.statics.findAvailableDrivers = function (
 deliveryZone?: DeliveryZone
): Promise<IUser[]> {
 const query: {
 role: string
 isAvailable: boolean
 isActive: boolean
 deliveryZone?: DeliveryZone
 } = {
 role: 'livreur',
 isAvailable: true,
 isActive: true,
 }

 if (deliveryZone) {
 query.deliveryZone = deliveryZone
 }

 return this.find(query)
 .select('-password') // Exclure le mot de passe
 .sort({ rating: -1, totalDeliveries: -1 }) // Trier par meilleur rating d'abord
 .exec()
}

/**
 * Méthode statique pour mettre à jour le rating d'un livreur
 * Calcule la moyenne pondérée du rating
 * @param driverId - ID du livreur
 * @param newRating - Nouveau rating à ajouter (1-5)
 * @returns Promise<IUser | null> - Livreur mis à jour ou null
 */
userSchema.statics.updateDriverRating = async function (
 driverId: string,
 newRating: number
): Promise<IUser | null> {
 // Validation du rating
 if (newRating < 0 || newRating > 5) {
 throw new Error('Le rating doit être entre 0 et 5')
 }

 const driver = await this.findById(driverId)
 if (!driver) {
 throw new Error('Livreur non trouvé')
 }
 if (driver.role !== 'livreur') {
 throw new Error('Cet utilisateur n\'est pas un livreur')
 }

 // Calculer le nouveau rating moyen pondéré
 const currentRating = driver.rating || 0
 const totalDeliveries = driver.totalDeliveries || 0
 const newAverageRating =
 (currentRating * totalDeliveries + newRating) / (totalDeliveries + 1)

 // Mettre à jour le livreur
 return this.findByIdAndUpdate(
 driverId,
 {
 rating: Number(newAverageRating.toFixed(2)), // Arrondir à 2 décimales
 totalDeliveries: totalDeliveries + 1,
 },
 { new: true, select: '-password' } // Retourner le document mis à jour sans mot de passe
 )
}

// Export du modèle avec typage statique et d'instance
export default (mongoose.models.User as IUserModel) ||
 mongoose.model<IUser, IUserModel>('User', userSchema)
