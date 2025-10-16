import mongoose from 'mongoose'
import type { ProductUnit, ProductCategory, INutritionalInfo } from '@/types/models'

/**
 * Interface pour le modèle Product avec toutes ses propriétés
 * Étend mongoose.Document pour inclure les méthodes de mongoose
 */
export interface IProduct extends mongoose.Document {
 title: string
 slug: string
 description: string
 price: number
 images: string[]
 category: ProductCategory
 originCountry: string
 isActive: boolean
 isApproved: boolean
 isFeatured: boolean
 stock: number
 unit: ProductUnit
 weight?: number
 ingredients?: string[]
 allergens?: string[]
 nutritionalInfo?: INutritionalInfo
 createdAt: Date
 updatedAt: Date
 // Méthodes personnalisées
 generateSlug(): string
 isInStock(): boolean
 updateStock(quantity: number): Promise<IProduct>
}

/**
 * Schéma Mongoose pour les produits
 * Définit la structure et les validations pour les produits dans MongoDB
 */
const productSchema = new mongoose.Schema<IProduct>(
 {
 title: {
 type: String,
 required: [true, 'Le titre du produit est requis'],
 trim: true,
 maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
 },
 slug: {
 type: String,
 required: true,
 unique: true,
 lowercase: true,
 trim: true,
 index: true, // Index pour améliorer les recherches par slug
 },
 description: {
 type: String,
 required: [true, 'La description du produit est requise'],
 maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
 },
 price: {
 type: Number,
 required: [true, 'Le prix est requis'],
 min: [0, 'Le prix ne peut pas être négatif'],
 },
 images: {
 type: [String],
 required: [true, 'Au moins une image est requise'],
 validate: {
 validator: (v: string[]) => v.length > 0,
 message: 'Au moins une image est requise',
 },
 },
 category: {
 type: String,
 required: [true, 'La catégorie est requise'],
 enum: {
 values: [
 'Fruits & Légumes',
 'Épices & Condiments',
 'Céréales & Grains',
 'Boissons',
 'Huiles & Beurres',
 'Produits Transformés',
 ],
 message: '{VALUE} n\'est pas une catégorie valide',
 },
 },
 originCountry: {
 type: String,
 required: [true, 'Le pays d\'origine est requis'],
 trim: true,
 },
 isActive: {
 type: Boolean,
 default: true,
 index: true,
 },
 isApproved: {
 type: Boolean,
 default: false,
 index: true,
 },
 isFeatured: {
 type: Boolean,
 default: false,
 index: true,
 },
 stock: {
 type: Number,
 required: [true, 'Le stock est requis'],
 min: [0, 'Le stock ne peut pas être négatif'],
 default: 0,
 },
 unit: {
 type: String,
 required: [true, 'L\'unité de mesure est requise'],
 enum: {
 values: ['kg', 'g', 'l', 'ml', 'unité', 'paquet'],
 message: '{VALUE} n\'est pas une unité valide',
 },
 },
 weight: {
 type: Number,
 min: [0, 'Le poids ne peut pas être négatif'],
 },
 ingredients: [String],
 allergens: [String],
 nutritionalInfo: {
 calories: { type: Number, min: 0 },
 protein: { type: Number, min: 0 },
 carbs: { type: Number, min: 0 },
 fat: { type: Number, min: 0 },
 fiber: { type: Number, min: 0 },
 },
 },
 {
 timestamps: true, // Ajoute automatiquement createdAt et updatedAt
 toJSON: { virtuals: true }, // Inclure les champs virtuels lors de la sérialisation JSON
 toObject: { virtuals: true },
 }
)

// Index composites pour améliorer les performances des requêtes complexes
productSchema.index({ category: 1, isActive: 1, isApproved: 1 })
productSchema.index({ price: 1, isActive: 1 })
productSchema.index({ originCountry: 1, category: 1 })
productSchema.index({ isFeatured: 1, isActive: 1 })
productSchema.index({ createdAt: -1 })

// Champ virtuel pour le nom complet avec l'unité
productSchema.virtual('displayName').get(function () {
 return `${this.title} (${this.stock} ${this.unit})`
})

// Champ virtuel pour vérifier la disponibilité
productSchema.virtual('isAvailable').get(function () {
 return this.isActive && this.isApproved && this.stock > 0
})

/**
 * Méthode pour générer un slug à partir du titre
 * Convertit le titre en format URL-friendly
 */
productSchema.methods.generateSlug = function (): string {
 return this.title
 .toLowerCase()
 .normalize('NFD') // Décompose les caractères accentués
 .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
 .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères non alphanumériques par des tirets
 .replace(/(^-|-$)/g, '') // Supprime les tirets au début et à la fin
}

/**
 * Méthode pour vérifier si le produit est en stock
 */
productSchema.methods.isInStock = function (): boolean {
 return this.stock > 0
}

/**
 * Méthode pour mettre à jour le stock
 * @param quantity - Quantité à ajouter (positive) ou retirer (négative)
 */
productSchema.methods.updateStock = async function (
 quantity: number
): Promise<IProduct> {
 this.stock += quantity
 if (this.stock < 0) {
 this.stock = 0
 }
 return await this.save()
}

// Middleware pre-save pour générer automatiquement le slug
productSchema.pre('save', function (next) {
 // Générer le slug seulement si le titre est modifié ou si c'est un nouveau document
 if (this.isModified('title') || this.isNew) {
 this.slug = this.generateSlug()
 }
 next()
})

// Middleware pre-save pour validation supplémentaire
productSchema.pre('save', function (next) {
 // Vérifier que le stock n'est jamais négatif
 if (this.stock < 0) {
 this.stock = 0
 }
 
 // Vérifier que le prix est valide
 if (this.price < 0) {
 return next(new Error('Le prix ne peut pas être négatif'))
 }
 
 // Vérifier qu'il y a au moins une image
 if (!this.images || this.images.length === 0) {
 return next(new Error('Au moins une image est requise'))
 }
 
 next()
})

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema)

