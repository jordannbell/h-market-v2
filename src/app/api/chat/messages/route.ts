import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

// Modèle temporaire pour les messages (à remplacer par un vrai modèle)
interface ChatMessage {
 id: string
 orderId: string
 senderId: string
 senderRole: 'client' | 'livreur'
 message: string
 timestamp: Date
}

// Stockage temporaire des messages (à remplacer par MongoDB)
let messages: ChatMessage[] = []

export async function GET(request: NextRequest) {
 try {
 await connectDB()
 
 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }
 
 const decoded = await verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }
 
 const { searchParams } = new URL(request.url)
 const orderId = searchParams.get('orderId')
 
 if (!orderId) {
 return NextResponse.json({ error: 'ID de commande requis' }, { status: 400 })
 }
 
 // Filtrer les messages pour cette commande
 const orderMessages = messages.filter(msg => msg.orderId === orderId)
 
 return NextResponse.json({
 success: true,
 messages: orderMessages
 })
 
 } catch (error: any) {
 console.error('Erreur lors de la récupération des messages:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

export async function POST(request: NextRequest) {
 try {
 await connectDB()
 
 // Vérifier l'authentification
 const token = request.headers.get('authorization')?.replace('Bearer ', '')
 if (!token) {
 return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 })
 }
 
 const decoded = await verifyToken(token)
 if (!decoded) {
 return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
 }
 
 const { orderId, message } = await request.json()
 
 if (!orderId || !message) {
 return NextResponse.json({ error: 'ID de commande et message requis' }, { status: 400 })
 }
 
 // Créer un nouveau message
 const newMessage: ChatMessage = {
 id: Date.now().toString(),
 orderId,
 senderId: decoded.userId,
 senderRole: decoded.role as 'client' | 'livreur',
 message,
 timestamp: new Date()
 }
 
 // Ajouter le message à la liste
 messages.push(newMessage)
 
 return NextResponse.json({
 success: true,
 message: newMessage
 })
 
 } catch (error: any) {
 console.error('Erreur lors de l\'envoi du message:', error)
 return NextResponse.json(
 { error: 'Erreur interne du serveur' },
 { status: 500 }
 )
 }
}

