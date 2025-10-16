// Types partagés pour les modèles de données
import mongoose from 'mongoose'

// Types pour User
export interface IUserName {
 first: string
 last: string
}

export interface IUserAddress {
 street: string
 city: string
 postalCode: string
 country: string
}

export interface IUserLocation {
 latitude: number
 longitude: number
 updatedAt: Date
}

export interface IUserPreferences {
 favoriteCategories: string[]
 notifications: {
 email: boolean
 sms: boolean
 push: boolean
 }
}

export type UserRole = 'admin' | 'vendeur' | 'client' | 'livreur'
export type VehicleType = 'voiture' | 'moto' | 'scooter' | 'velo'
export type DeliveryZone = 'paris-centre' | 'paris-nord' | 'paris-sud' | 'paris-est' | 'paris-ouest' | 'banlieue-nord' | 'banlieue-sud'

// Types pour Product
export type ProductCategory = 'Fruits & Légumes' | 'Épices & Condiments' | 'Céréales & Grains' | 'Boissons' | 'Huiles & Beurres' | 'Produits Transformés'
export type ProductUnit = 'kg' | 'g' | 'l' | 'ml' | 'unité' | 'paquet'

export interface INutritionalInfo {
 calories?: number
 protein?: number
 carbs?: number
 fat?: number
 fiber?: number
}

// Types pour Order
export interface IOrderItem {
 productId: mongoose.Types.ObjectId
 title: string
 slug: string
 image: string
 price: number
 quantity: number
 totalPrice: number
}

export interface IOrderTotals {
 subtotal: number
 deliveryFee: number
 taxes: number
 discounts: number
 total: number
}

export type PaymentMethod = 'stripe' | 'paypal'
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded'

export interface IPayment {
 method: PaymentMethod
 status: PaymentStatus
 paymentIntentId?: string
 payerId?: string
 amount: number
 currency: string
 paidAt?: Date
}

export type DeliveryMode = 'planned' | 'express' | 'outside_idf' | 'standard'
export type DeliverySlot = 'morning' | 'noon' | 'evening'
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
export type OrderProgressStep = 'preparation' | 'in_transit' | 'delivery' | 'completed'

export interface ITrackingLocation {
 lat: number
 lng: number
 address: string
}

export interface ICurrentLocation extends ITrackingLocation {
 updatedAt: Date
}

export interface ITrackingHistory {
 status: string
 location?: ITrackingLocation
 timestamp: Date
 notes?: string
}

export interface IDelivery {
 mode: DeliveryMode
 slot?: DeliverySlot
 scheduledAt?: Date
 estimatedDeliveryTime?: Date
 actualDeliveryTime?: Date
 status: DeliveryStatus
 notes?: string
 assignedDriverId?: mongoose.Types.ObjectId
 pickupTime?: Date
 deliveryCode: string
 currentLocation?: ICurrentLocation
 trackingHistory: ITrackingHistory[]
}

export interface IOrderProgress {
 step: OrderProgressStep
 currentStep: number
 totalSteps: number
 estimatedCompletionTime?: Date
}



