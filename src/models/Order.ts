import mongoose, { Document, Schema } from 'mongoose'
import type {
 IOrderItem,
 IOrderTotals,
 IPayment,
 IDelivery,
 IOrderProgress,
 IUserAddress,
 OrderStatus,
 DeliveryStatus,
 PaymentStatus,
} from '@/types/models'

// Ré-exporter les interfaces pour la compatibilité
export type { IOrderItem, IPayment, IDelivery }

/**
 * Interface pour le modèle Order avec toutes ses propriétés et méthodes
 * Étend mongoose.Document pour inclure les fonctionnalités de Mongoose
 */
export interface IOrder extends Document {
 orderNumber: string
 userId: mongoose.Types.ObjectId
 items: IOrderItem[]
 totals: IOrderTotals
 payment: IPayment
 address: IUserAddress
 delivery: IDelivery
 status: OrderStatus
 orderProgress: IOrderProgress
 notes?: string
 createdAt: Date
 updatedAt: Date
 // Méthodes personnalisées
 generateOrderNumber(): string
 calculateTotals(): IOrderTotals
 canBeCancelled(): boolean
 updateStatus(newStatus: OrderStatus): Promise<IOrder>
 updateDeliveryStatus(newStatus: DeliveryStatus): Promise<IOrder>
 updatePaymentStatus(newStatus: PaymentStatus): Promise<IOrder>
}

/**
 * Interface pour les méthodes statiques du modèle Order
 */
export interface IOrderModel extends mongoose.Model<IOrder> {
 findByOrderNumber(orderNumber: string): Promise<IOrder | null>
 findByUserId(userId: string): Promise<IOrder[]>
 findPendingOrders(): Promise<IOrder[]>
 findOrdersByDriver(driverId: string): Promise<IOrder[]>
}

const orderItemSchema = new Schema<IOrderItem>({
 productId: {
 type: Schema.Types.ObjectId,
 ref: 'Product',
 required: true
 },
 title: {
 type: String,
 required: true
 },
 slug: {
 type: String,
 required: true
 },
 image: {
 type: String,
 required: true
 },
 price: {
 type: Number,
 required: true,
 min: 0
 },
 quantity: {
 type: Number,
 required: true,
 min: 1
 },
 totalPrice: {
 type: Number,
 required: true,
 min: 0
 }
})

const paymentSchema = new Schema<IPayment>({
 method: {
 type: String,
 enum: ['stripe', 'paypal'],
 required: true
 },
 status: {
 type: String,
 enum: ['pending', 'succeeded', 'failed', 'refunded'],
 default: 'pending'
 },
 paymentIntentId: String,
 payerId: String,
 amount: {
 type: Number,
 required: true,
 min: 0
 },
 currency: {
 type: String,
 default: 'EUR'
 },
 paidAt: Date
})

const deliverySchema = new Schema<IDelivery>({
 mode: {
 type: String,
 enum: ['planned', 'express', 'outside_idf', 'standard'],
 default: 'express'
 },
 slot: {
 type: String,
 enum: ['morning', 'noon', 'evening'],
 required: false
 },
 scheduledAt: {
 type: Date,
 required: false
 },
 estimatedDeliveryTime: Date,
 actualDeliveryTime: Date,
 status: {
 type: String,
 enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
 default: 'pending'
 },
 notes: String,
 // Nouveaux champs pour le suivi
 assignedDriverId: {
 type: Schema.Types.ObjectId,
 ref: 'User'
 },
 pickupTime: Date,
 deliveryCode: {
 type: String,
 required: true,
 default: () => Math.floor(100000 + Math.random() * 900000).toString()
 },
 currentLocation: {
 lat: Number,
 lng: Number,
 address: String,
 updatedAt: Date
 },
 trackingHistory: [{
 status: String,
 location: {
 lat: Number,
 lng: Number,
 address: String
 },
 timestamp: {
 type: Date,
 default: Date.now
 },
 notes: String
 }]
})

const orderSchema = new Schema<IOrder>({
 orderNumber: {
 type: String,
 required: true,
 unique: true
 },
 userId: {
 type: Schema.Types.ObjectId,
 ref: 'User',
 required: true
 },
 items: [orderItemSchema],
 totals: {
 subtotal: {
 type: Number,
 required: true,
 min: 0
 },
 deliveryFee: {
 type: Number,
 required: true,
 min: 0
 },
 taxes: {
 type: Number,
 required: true,
 min: 0
 },
 discounts: {
 type: Number,
 required: true,
 min: 0
 },
 total: {
 type: Number,
 required: true,
 min: 0
 }
 },
 payment: paymentSchema,
 address: {
 street: {
 type: String,
 required: true
 },
 city: {
 type: String,
 required: true
 },
 postalCode: {
 type: String,
 required: true
 },
 country: {
 type: String,
 default: 'France'
 }
 },
 delivery: deliverySchema,
 status: {
 type: String,
 enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
 default: 'pending'
 },
 // Nouveaux champs pour le suivi client
 orderProgress: {
 step: {
 type: String,
 enum: ['preparation', 'in_transit', 'delivery', 'completed'],
 default: 'preparation'
 },
 currentStep: {
 type: Number,
 default: 1
 },
 totalSteps: {
 type: Number,
 default: 3
 },
 estimatedCompletionTime: Date
 },
 notes: String
}, {
 timestamps: true
})

// Index pour améliorer les performances
// Les index sont déjà créés automatiquement par unique: true pour orderNumber
orderSchema.index({ userId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ 'payment.status': 1 })
orderSchema.index({ 'delivery.status': 1 })
orderSchema.index({ 'delivery.assignedDriverId': 1 })
orderSchema.index({ createdAt: -1 })

/**
 * Méthode pour générer un numéro de commande unique
 * Format: HM-YYYYMMDD-XXX (où XXX est un nombre aléatoire)
 * @returns string - Numéro de commande généré
 */
orderSchema.methods.generateOrderNumber = function (): string {
 const date = new Date()
 const year = date.getFullYear()
 const month = String(date.getMonth() + 1).padStart(2, '0')
 const day = String(date.getDate()).padStart(2, '0')
 const random = Math.floor(Math.random() * 10000)
 .toString()
 .padStart(4, '0')
 return `HM-${year}${month}${day}-${random}`
}

/**
 * Méthode pour calculer les totaux de la commande
 * @returns IOrderTotals - Objet contenant tous les totaux
 */
orderSchema.methods.calculateTotals = function (): IOrderTotals {
 // Calculer le sous-total à partir des items
 const subtotal = this.items.reduce(
 (sum: number, item: IOrderItem) => sum + item.totalPrice,
 0
 )

 // Les frais de livraison dépendent du mode
 let deliveryFee = 0
 switch (this.delivery.mode) {
 case 'express':
 deliveryFee = 5.99
 break
 case 'planned':
 deliveryFee = 3.99
 break
 case 'outside_idf':
 deliveryFee = 9.99
 break
 case 'standard':
 deliveryFee = 4.99
 break
 }

 // Calculer les taxes (TVA 5.5% pour les produits alimentaires en France)
 const taxes = subtotal * 0.055

 // Les réductions sont déjà dans this.totals.discounts
 const discounts = this.totals.discounts || 0

 // Calculer le total final
 const total = subtotal + deliveryFee + taxes - discounts

 return {
 subtotal: Number(subtotal.toFixed(2)),
 deliveryFee: Number(deliveryFee.toFixed(2)),
 taxes: Number(taxes.toFixed(2)),
 discounts: Number(discounts.toFixed(2)),
 total: Number(total.toFixed(2)),
 }
}

/**
 * Méthode pour vérifier si la commande peut être annulée
 * @returns boolean - True si la commande peut être annulée
 */
orderSchema.methods.canBeCancelled = function (): boolean {
 // Une commande peut être annulée si:
 // - Elle est en attente ou confirmée
 // - Le paiement n'a pas encore été effectué
 // - La livraison n'a pas encore été assignée
 return (
 (this.status === 'pending' || this.status === 'confirmed') &&
 this.payment.status !== 'succeeded' &&
 this.delivery.status === 'pending'
 )
}

/**
 * Méthode pour mettre à jour le statut de la commande
 * @param newStatus - Nouveau statut de la commande
 * @returns Promise<IOrder> - Commande mise à jour
 */
orderSchema.methods.updateStatus = async function (
 newStatus: OrderStatus
): Promise<IOrder> {
 this.status = newStatus

 // Mettre à jour le progress en fonction du statut
 switch (newStatus) {
 case 'pending':
 case 'confirmed':
 this.orderProgress.step = 'preparation'
 this.orderProgress.currentStep = 1
 break
 case 'preparing':
 this.orderProgress.step = 'preparation'
 this.orderProgress.currentStep = 1
 break
 case 'out_for_delivery':
 this.orderProgress.step = 'in_transit'
 this.orderProgress.currentStep = 2
 break
 case 'delivered':
 this.orderProgress.step = 'completed'
 this.orderProgress.currentStep = 3
 break
 case 'cancelled':
 // Annuler également la livraison
 this.delivery.status = 'failed'
 break
 }

 return await this.save()
}

/**
 * Méthode pour mettre à jour le statut de livraison
 * @param newStatus - Nouveau statut de livraison
 * @returns Promise<IOrder> - Commande mise à jour
 */
orderSchema.methods.updateDeliveryStatus = async function (
 newStatus: DeliveryStatus
): Promise<IOrder> {
 this.delivery.status = newStatus

 // Ajouter à l'historique de suivi
 this.delivery.trackingHistory.push({
 status: newStatus,
 timestamp: new Date(),
 notes: `Statut de livraison mis à jour: ${newStatus}`,
 })

 // Mettre à jour le statut de la commande en conséquence
 switch (newStatus) {
 case 'picked_up':
 case 'in_transit':
 this.status = 'out_for_delivery'
 this.orderProgress.step = 'in_transit'
 this.orderProgress.currentStep = 2
 break
 case 'delivered':
 this.status = 'delivered'
 this.orderProgress.step = 'completed'
 this.orderProgress.currentStep = 3
 this.delivery.actualDeliveryTime = new Date()
 break
 case 'failed':
 this.status = 'cancelled'
 break
 }

 return await this.save()
}

/**
 * Méthode pour mettre à jour le statut de paiement
 * @param newStatus - Nouveau statut de paiement
 * @returns Promise<IOrder> - Commande mise à jour
 */
orderSchema.methods.updatePaymentStatus = async function (
 newStatus: PaymentStatus
): Promise<IOrder> {
 this.payment.status = newStatus

 if (newStatus === 'succeeded') {
 this.payment.paidAt = new Date()
 // Confirmer la commande automatiquement après le paiement
 if (this.status === 'pending') {
 this.status = 'confirmed'
 }
 }

 return await this.save()
}

// Middleware pre-save pour générer le numéro de commande
orderSchema.pre('save', function (next) {
 if (!this.orderNumber) {
 this.orderNumber = this.generateOrderNumber()
 }
 next()
})

// Middleware pre-save pour recalculer les totaux si nécessaire
orderSchema.pre('save', function (next) {
 if (this.isModified('items') || this.isModified('delivery.mode')) {
 const calculatedTotals = this.calculateTotals()
 this.totals = calculatedTotals
 }
 next()
})

/**
 * Méthode statique pour trouver une commande par son numéro
 * @param orderNumber - Numéro de la commande
 * @returns Promise<IOrder | null> - Commande trouvée ou null
 */
orderSchema.statics.findByOrderNumber = function (
 orderNumber: string
): Promise<IOrder | null> {
 return this.findOne({ orderNumber })
 .populate('userId', '-password')
 .populate('delivery.assignedDriverId', '-password')
 .exec()
}

/**
 * Méthode statique pour trouver toutes les commandes d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @returns Promise<IOrder[]> - Liste des commandes
 */
orderSchema.statics.findByUserId = function (userId: string): Promise<IOrder[]> {
 return this.find({ userId })
 .sort({ createdAt: -1 })
 .populate('delivery.assignedDriverId', 'name phone vehicleType')
 .exec()
}

/**
 * Méthode statique pour trouver les commandes en attente
 * @returns Promise<IOrder[]> - Liste des commandes en attente
 */
orderSchema.statics.findPendingOrders = function (): Promise<IOrder[]> {
 return this.find({
 status: { $in: ['pending', 'confirmed'] },
 'payment.status': 'succeeded',
 })
 .sort({ createdAt: 1 })
 .populate('userId', 'name phone address')
 .exec()
}

/**
 * Méthode statique pour trouver les commandes d'un livreur
 * @param driverId - ID du livreur
 * @returns Promise<IOrder[]> - Liste des commandes assignées au livreur
 */
orderSchema.statics.findOrdersByDriver = function (
 driverId: string
): Promise<IOrder[]> {
 return this.find({ 'delivery.assignedDriverId': driverId })
 .sort({ createdAt: -1 })
 .populate('userId', 'name phone address')
 .exec()
}

// Export du modèle avec typage statique et d'instance
export default (mongoose.models.Order as IOrderModel) ||
 mongoose.model<IOrder, IOrderModel>('Order', orderSchema)
