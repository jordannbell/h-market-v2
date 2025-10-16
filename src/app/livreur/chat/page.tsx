'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { FiMapPin, FiMessageSquare, FiPhone, FiSend, FiUser } from 'react-icons/fi'


interface Message {
 id: string
 orderId: string
 senderId: string
 senderRole: 'client' | 'livreur'
 message: string
 timestamp: Date
}

interface Order {
 id: string
 orderNumber: string
 customer: {
 name: string
 phone: string
 }
 address: any
 status: string
}

export default function LivreurChat() {
 const { token, user } = useAuth()
 const [orders, setOrders] = useState<Order[]>([])
 const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
 const [messages, setMessages] = useState<Message[]>([])
 const [newMessage, setNewMessage] = useState('')
 const [loading, setLoading] = useState(true)
 const [sending, setSending] = useState(false)
 const messagesEndRef = useRef<HTMLDivElement>(null)

 useEffect(() => {
 fetchOrders()
 }, [])

 useEffect(() => {
 if (selectedOrder) {
 fetchMessages(selectedOrder.id)
 // Polling pour les nouveaux messages
 const interval = setInterval(() => {
 fetchMessages(selectedOrder.id)
 }, 5000)
 return () => clearInterval(interval)
 }
 }, [selectedOrder])

 useEffect(() => {
 scrollToBottom()
 }, [messages])

 const fetchOrders = async () => {
 try {
 const response = await fetch('/api/delivery/my-deliveries', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })
 
 if (response.ok) {
 const data = await response.json()
 setOrders(data.orders || [])
 if (data.orders && data.orders.length > 0) {
 setSelectedOrder(data.orders[0])
 }
 }
 } catch (error) {
 console.error('Erreur lors de la récupération des commandes:', error)
 } finally {
 setLoading(false)
 }
 }

 const fetchMessages = async (orderId: string) => {
 try {
 const response = await fetch(`/api/chat/messages?orderId=${orderId}`, {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })
 
 if (response.ok) {
 const data = await response.json()
 setMessages(data.messages || [])
 }
 } catch (error) {
 console.error('Erreur lors de la récupération des messages:', error)
 }
 }

 const sendMessage = async () => {
 if (!selectedOrder || !newMessage.trim() || sending) return

 setSending(true)
 try {
 const response = await fetch('/api/chat/messages', {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 },
 body: JSON.stringify({
 orderId: selectedOrder.id,
 message: newMessage.trim()
 })
 })
 
 if (response.ok) {
 const data = await response.json()
 setMessages(prev => [...prev, data.message])
 setNewMessage('')
 }
 } catch (error) {
 console.error('Erreur lors de l\'envoi du message:', error)
 } finally {
 setSending(false)
 }
 }

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
 }

 const formatTime = (timestamp: Date) => {
 return new Date(timestamp).toLocaleTimeString('fr-FR', {
 hour: '2-digit',
 minute: '2-digit'
 })
 }

 if (loading) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
 </div>
 )
 }

 return (
 <div className="space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
 <p className="text-gray-600">Communiquez avec vos clients</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
 {/* Liste des commandes */}
 <div className="lg:col-span-1">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
 <div className="p-4 border-b border-gray-200">
 <h2 className="text-lg font-semibold text-gray-900">Commandes</h2>
 <p className="text-sm text-gray-600">Sélectionnez une commande</p>
 </div>
 
 <div className="p-4 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
 {orders.length === 0 ? (
 <div className="text-center py-8">
 <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500">Aucune commande</p>
 </div>
 ) : (
 orders.map((order) => (
 <button
 key={order.id}
 onClick={() => setSelectedOrder(order)}
 className={`w-full text-left p-3 rounded-lg border transition-colors ${
 selectedOrder?.id === order.id
 ? 'border-green-500 bg-green-50'
 : 'border-gray-200 hover:bg-gray-50'
 }`}
 >
 <div className="flex items-center justify-between mb-2">
 <h3 className="font-medium text-gray-900">
 #{order.orderNumber}
 </h3>
 <span className={`
 px-2 py-1 text-xs font-medium rounded-full
 ${order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
 order.status === 'picked_up' ? 'bg-orange-100 text-orange-800' :
 'bg-green-100 text-green-800'}
 `}>
 {order.status === 'assigned' ? 'Assignée' :
 order.status === 'picked_up' ? 'Récupérée' :
 'En transit'}
 </span>
 </div>
 <p className="text-sm text-gray-600">{order.customer.name}</p>
 <p className="text-xs text-gray-500 truncate">
 {order.address?.street}, {order.address?.city}
 </p>
 </button>
 ))
 )}
 </div>
 </div>
 </div>

 {/* Chat */}
 <div className="lg:col-span-2">
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
 {selectedOrder ? (
 <>
 {/* Header du chat */}
 <div className="p-4 border-b border-gray-200">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-lg font-semibold text-gray-900">
 Commande #{selectedOrder.orderNumber}
 </h2>
 <p className="text-sm text-gray-600">{selectedOrder.customer.name}</p>
 </div>
 <div className="flex items-center space-x-2">
 <span className={`
 px-2 py-1 text-xs font-medium rounded-full
 ${selectedOrder.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
 selectedOrder.status === 'picked_up' ? 'bg-orange-100 text-orange-800' :
 'bg-green-100 text-green-800'}
 `}>
 {selectedOrder.status === 'assigned' ? 'Assignée' :
 selectedOrder.status === 'picked_up' ? 'Récupérée' :
 'En transit'}
 </span>
 </div>
 </div>
 
 {/* Informations client */}
 <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
 <div className="flex items-center space-x-2">
 <FiUser className="w-4 h-4 text-gray-400" />
 <span className="text-gray-600">{selectedOrder.customer.name}</span>
 </div>
 <div className="flex items-center space-x-2">
 <FiPhone className="w-4 h-4 text-gray-400" />
 <span className="text-gray-600">{selectedOrder.customer.phone}</span>
 </div>
 <div className="flex items-start space-x-2 md:col-span-2">
 <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
 <span className="text-gray-600">
 {selectedOrder.address?.street}, {selectedOrder.address?.city}
 </span>
 </div>
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 p-4 overflow-y-auto">
 {messages.length === 0 ? (
 <div className="text-center py-8">
 <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500">Aucun message</p>
 <p className="text-sm text-gray-400">Commencez la conversation</p>
 </div>
 ) : (
 <div className="space-y-4">
 {messages.map((message) => (
 <div
 key={message.id}
 className={`flex ${message.senderRole === 'livreur' ? 'justify-end' : 'justify-start'}`}
 >
 <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
 message.senderRole === 'livreur'
 ? 'bg-green-600 text-white'
 : 'bg-gray-100 text-gray-900'
 }`}>
 <p className="text-sm">{message.message}</p>
 <p className={`text-xs mt-1 ${
 message.senderRole === 'livreur' ? 'text-green-100' : 'text-gray-500'
 }`}>
 {formatTime(message.timestamp)}
 </p>
 </div>
 </div>
 ))}
 <div ref={messagesEndRef} />
 </div>
 )}
 </div>

 {/* Input message */}
 <div className="p-4 border-t border-gray-200">
 <div className="flex space-x-2">
 <input
 type="text"
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
 placeholder="Tapez votre message..."
 className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
 disabled={sending}
 />
 <button
 onClick={sendMessage}
 disabled={!newMessage.trim() || sending}
 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {sending ? (
 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
 ) : (
 <FiSend className="w-4 h-4" />
 )}
 </button>
 </div>
 </div>
 </>
 ) : (
 <div className="flex-1 flex items-center justify-center">
 <div className="text-center">
 <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500 text-lg">Sélectionnez une commande</p>
 <p className="text-gray-400">pour commencer à discuter</p>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )
}

