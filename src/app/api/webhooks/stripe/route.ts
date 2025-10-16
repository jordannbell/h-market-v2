import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { connectDB } from '@/lib/database'
import Order from '@/models/Order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 apiVersion: '2025-07-30.basil'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
 try {
 const body = await request.text()
 const signature = request.headers.get('stripe-signature')!

 let event: Stripe.Event

 try {
 event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
 } catch (err: any) {
 console.error('Erreur webhook signature:', err.message)
 return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
 }

 await connectDB()

 switch (event.type) {
 case 'payment_intent.succeeded':
 const paymentIntent = event.data.object as Stripe.PaymentIntent
 await handlePaymentSuccess(paymentIntent)
 break

 case 'payment_intent.payment_failed':
 const failedPayment = event.data.object as Stripe.PaymentIntent
 await handlePaymentFailure(failedPayment)
 break

 case 'charge.refunded':
 const refund = event.data.object as Stripe.Charge
 await handleRefund(refund)
 break

 default:
 console.log(`Événement non géré: ${event.type}`)
 }

 return NextResponse.json({ received: true })
 } catch (error: any) {
 console.error('Erreur webhook:', error)
 return NextResponse.json({ error: 'Erreur webhook' }, { status: 500 })
 }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
 try {
 const orderId = paymentIntent.metadata.orderId
 
 if (!orderId) {
 console.error('OrderId manquant dans les métadonnées')
 return
 }

 // Mettre à jour la commande
 const order = await Order.findById(orderId)
 if (!order) {
 console.error('Commande non trouvée:', orderId)
 return
 }

 // Mettre à jour le statut du paiement
 order.payment.status = 'succeeded'
 order.payment.paymentIntentId = paymentIntent.id
 order.payment.paidAt = new Date()
 order.status = 'confirmed'

 await order.save()

 console.log(`Paiement réussi pour la commande ${order.orderNumber}`)

 // TODO: Envoyer des notifications (email, SMS)
 // TODO: Assigner un livreur
 // TODO: Mettre à jour le stock des produits

 } catch (error) {
 console.error('Erreur lors du traitement du paiement réussi:', error)
 }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
 try {
 const orderId = paymentIntent.metadata.orderId
 
 if (!orderId) {
 console.error('OrderId manquant dans les métadonnées')
 return
 }

 // Mettre à jour la commande
 const order = await Order.findById(orderId)
 if (!order) {
 console.error('Commande non trouvée:', orderId)
 return
 }

 // Mettre à jour le statut du paiement
 order.payment.status = 'failed'
 order.status = 'cancelled'

 await order.save()

 console.log(`Paiement échoué pour la commande ${order.orderNumber}`)

 // TODO: Envoyer des notifications à l'utilisateur
 // TODO: Proposer une nouvelle tentative de paiement

 } catch (error) {
 console.error('Erreur lors du traitement du paiement échoué:', error)
 }
}

async function handleRefund(charge: Stripe.Charge) {
 try {
 const paymentIntentId = charge.payment_intent as string
 
 if (!paymentIntentId) {
 console.error('PaymentIntentId manquant')
 return
 }

 // Trouver la commande par paymentIntentId
 const order = await Order.findOne({ 'payment.paymentIntentId': paymentIntentId })
 if (!order) {
 console.error('Commande non trouvée pour le remboursement')
 return
 }

 // Mettre à jour le statut du paiement
 order.payment.status = 'refunded'
 order.status = 'cancelled'

 await order.save()

 console.log(`Remboursement traité pour la commande ${order.orderNumber}`)

 // TODO: Envoyer des notifications
 // TODO: Mettre à jour le stock

 } catch (error) {
 console.error('Erreur lors du traitement du remboursement:', error)
 }
}
