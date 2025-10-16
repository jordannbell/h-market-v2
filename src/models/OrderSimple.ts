import mongoose, { Document, Schema } from 'mongoose'

export interface IOrderItem {
 productId: mongoose.Types.ObjectId
 title: string
 slug: string
 image: string
 price: number
 quantity: number
 totalPrice: number
}

export interface IPayment {
 method: 'stripe' | 'paypal'
 status: 'pending' | 'succeeded' | 'failed' | 'refunded'
 paymentIntentId?: string
 payerId?: string
 amount: number
 currency: string
 paidAt?: Date
}

export interface IDelivery {
 mode: 'express' | 'standard' | 'planned'
 slot: 'morning' | 'noon' | 'evening'
 scheduledAt: Date
 estimatedDeliveryTime?: Date
 actualDeliveryTime?: Date
 status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
 notes?: string
}

export interface IOrder extends Document {
 orderNumber: string
 userId: mongoose.Types.ObjectId
 items: IOrderItem[]
 totals: {
 subtotal: number
 deliveryFee: number
 taxes: number
 discounts: number
 total: number
 }
 payment: IPayment
 address: {
 street: string
 city: string
 postalCode: string
 country: string
 }
 delivery: IDelivery
 status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
 notes?: string
 createdAt: Date
 updatedAt: Date
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
 enum: ['express', 'standard', 'planned'],
 required: true
 },
 slot: {
 type: String,
 enum: ['morning', 'noon', 'evening'],
 required: true
 },
 scheduledAt: {
 type: Date,
 required: true
 },
 estimatedDeliveryTime: Date,
 actualDeliveryTime: Date,
 status: {
 type: String,
 enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'],
 default: 'pending'
 },
 notes: String
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
 notes: String
}, {
 timestamps: true
})

// Index simples sans duplication
// Note : orderNumber a déjà un index automatique via unique: true
orderSchema.index({ userId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

// Générer un numéro de commande simple
orderSchema.pre('save', function(next) {
 if (!this.orderNumber) {
 const date = new Date()
 const year = date.getFullYear()
 const month = String(date.getMonth() + 1).padStart(2, '0')
 const day = String(date.getDate()).padStart(2, '0')
 const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
 this.orderNumber = `HM-${year}${month}${day}-${random}`
 }
 next()
})

export default mongoose.model<IOrder>('OrderSimple', orderSchema)
