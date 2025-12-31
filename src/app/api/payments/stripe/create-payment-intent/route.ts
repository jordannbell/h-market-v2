import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Debug: Vérifier les variables d'environnement
console.log(' Variables Stripe:', {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Présente' : 'Manquante',
    STRIPE_SECRET_KEY_LENGTH: process.env.STRIPE_SECRET_KEY?.length || 0,
    NODE_ENV: process.env.NODE_ENV
})

const stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil' as any
    })
    : null

export async function POST(request: NextRequest) {
    try {
        if (!stripe) {
            console.error('STRIPE_SECRET_KEY manquante dans les variables d\'environnement')
            return NextResponse.json({
                error: 'Configuration Stripe manquante',
                details: 'STRIPE_SECRET_KEY n\'est pas définie'
            }, { status: 500 })
        }
        const { amount, currency = 'eur', metadata = {}, orderId } = await request.json()

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
        }

        if (!orderId) {
            return NextResponse.json({ error: 'ID de commande requis' }, { status: 400 })
        }

        // Créer le PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe utilise les centimes
            currency,
            metadata: {
                ...metadata,
                orderId,
                platform: 'h-market'
            },
            automatic_payment_methods: {
                enabled: true,
            },
            capture_method: 'automatic',
            // Supprimé confirmation_method car incompatible avec automatic_payment_methods
        })

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        })
    } catch (error: any) {
        console.error('Erreur Stripe:', error)
        return NextResponse.json({
            error: 'Erreur lors de la création du paiement',
            details: error.message
        }, { status: 500 })
    }
}
