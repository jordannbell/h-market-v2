import { useState, useEffect } from 'react'

interface CartItem {
 _id: string
 title: string
 price: number
 quantity: number
 image: string
 slug: string
}

export function useCart() {
 const [cart, setCart] = useState<CartItem[]>([])
 const [loading, setLoading] = useState(true)

 useEffect(() => {
 // Charger le panier depuis localStorage au chargement
 loadCart()
 }, [])

 const loadCart = () => {
 try {
 const storedCart = localStorage.getItem('cart')
 if (storedCart) {
 setCart(JSON.parse(storedCart))
 }
 } catch (error) {
 console.error('Erreur lors du chargement du panier:', error)
 } finally {
 setLoading(false)
 }
 }

 const addToCart = (product: {
 _id: string
 title: string
 price: number
 images: string[]
 slug: string
 }, quantity: number = 1) => {
 setCart(prevCart => {
 const existingItem = prevCart.find(item => item._id === product._id)
 
 let newCart: CartItem[]
 
 if (existingItem) {
 // Mettre à jour la quantité si le produit existe déjà
 newCart = prevCart.map(item =>
 item._id === product._id
 ? { ...item, quantity: item.quantity + quantity }
 : item
 )
 } else {
 // Ajouter un nouveau produit
 newCart = [...prevCart, {
 _id: product._id,
 title: product.title,
 price: product.price,
 quantity,
 image: product.images[0] || '/placeholder-product.jpg',
 slug: product.slug
 }]
 }
 
 // Sauvegarder dans localStorage
 localStorage.setItem('cart', JSON.stringify(newCart))
 return newCart
 })
 }

 const removeFromCart = (productId: string) => {
 setCart(prevCart => {
 const newCart = prevCart.filter(item => item._id !== productId)
 localStorage.setItem('cart', JSON.stringify(newCart))
 return newCart
 })
 }

 const updateQuantity = (productId: string, quantity: number) => {
 if (quantity <= 0) {
 removeFromCart(productId)
 return
 }
 
 setCart(prevCart => {
 const newCart = prevCart.map(item =>
 item._id === productId
 ? { ...item, quantity }
 : item
 )
 localStorage.setItem('cart', JSON.stringify(newCart))
 return newCart
 })
 }

 const clearCart = () => {
 setCart([])
 localStorage.removeItem('cart')
 }

 const getCartTotal = () => {
 return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
 }

 const getCartCount = () => {
 return cart.reduce((total, item) => total + item.quantity, 0)
 }

 const isInCart = (productId: string) => {
 return cart.some(item => item._id === productId)
 }

 return {
 cart,
 loading,
 addToCart,
 removeFromCart,
 updateQuantity,
 clearCart,
 getCartTotal,
 getCartCount,
 isInCart
 }
}

