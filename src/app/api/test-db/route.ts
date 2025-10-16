import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'

export async function GET() {
 try {
 console.log('=== TEST: Connexion à la base de données ===')
 
 // Test de connexion MongoDB
 await connectDB()
 console.log(' Connexion MongoDB réussie')
 
 return NextResponse.json({
 success: true,
 message: 'Connexion à MongoDB réussie',
 timestamp: new Date().toISOString()
 })
 
 } catch (error: any) {
 console.error(' Erreur de connexion MongoDB:', error)
 
 return NextResponse.json({
 success: false,
 error: error.message,
 type: error.constructor.name,
 timestamp: new Date().toISOString()
 }, { status: 500 })
 }
}
