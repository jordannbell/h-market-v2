// Déclaration des types globaux pour l'application
import mongoose from 'mongoose'

declare global {
 // Types globaux pour Node.js
 var mongoose: {
 conn: typeof mongoose | null
 promise: Promise<typeof mongoose> | null
 }

 // Namespace pour les variables d'environnement
 namespace NodeJS {
 interface ProcessEnv {
 MONGODB_URI: string
 JWT_SECRET: string
 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
 STRIPE_SECRET_KEY: string
 NEXT_PUBLIC_API_URL: string
 GOOGLE_MAPS_API_KEY?: string
 }
 }
}

export {}





