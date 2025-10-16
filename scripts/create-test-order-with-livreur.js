require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../src/models/User')
const Order = require('../src/models/Order')

async function createTestOrderWithLivreur() {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connexion à MongoDB établie')

    // Trouver ou créer un livreur
    let livreur = await User.findOne({ role: 'livreur' })
    
    if (!livreur) {
      console.log('📦 Création d\'un livreur de test...')
      livreur = new User({
        name: { first: 'Jean', last: 'Dupont' },
        email: 'livreur@test.com',
        phone: '+33123456789',
        password: 'password123',
        role: 'livreur',
        isVerified: true,
        vehicleType: 'moto',
        deliveryZone: 'paris-centre',
        isAvailable: true,
        licensePlate: 'AB-123-CD'
      })
      await livreur.save()
      console.log('✅ Livreur créé:', livreur.email)
    } else {
      console.log('✅ Livreur trouvé:', livreur.email)
    }

    // Trouver ou créer un client
    let client = await User.findOne({ role: 'client' })
    
    if (!client) {
      console.log('👤 Création d\'un client de test...')
      client = new User({
        name: { first: 'Marie', last: 'Martin' },
        email: 'client@test.com',
        phone: '+33987654321',
        password: 'password123',
        role: 'client',
        isVerified: true,
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        }
      })
      await client.save()
      console.log('✅ Client créé:', client.email)
    } else {
      console.log('✅ Client trouvé:', client.email)
    }

    // Créer une commande de test
    console.log('🛒 Création d\'une commande de test...')
    
    const testOrder = new Order({
      orderNumber: `HM-${Date.now()}-TEST`,
      userId: client._id,
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          title: 'Produit de test',
          slug: 'produit-test',
          image: '/placeholder-product.jpg',
          price: 15.99,
          quantity: 2,
          totalPrice: 31.98
        }
      ],
      totals: {
        subtotal: 31.98,
        deliveryFee: 3.99,
        taxes: 1.76,
        discounts: 0,
        total: 37.73
      },
      payment: {
        method: 'stripe',
        status: 'succeeded',
        paymentIntentId: 'pi_test_123',
        amount: 37.73,
        currency: 'EUR',
        paidAt: new Date()
      },
      address: client.address,
      delivery: {
        mode: 'express',
        slot: 'evening',
        scheduledAt: new Date(),
        status: 'assigned', // Commande déjà assignée au livreur
        assignedDriverId: livreur._id,
        deliveryCode: Math.floor(100000 + Math.random() * 900000).toString(),
        estimatedDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // Dans 2h
      },
      status: 'confirmed',
      orderProgress: {
        step: 'preparation',
        currentStep: 1,
        totalSteps: 3
      }
    })

    await testOrder.save()
    console.log('✅ Commande créée:', testOrder.orderNumber)
    console.log('📋 Détails:')
    console.log('   - Client:', `${client.name.first} ${client.name.last}`)
    console.log('   - Livreur:', `${livreur.name.first} ${livreur.name.last}`)
    console.log('   - Montant:', `${testOrder.totals.total}€`)
    console.log('   - Statut:', testOrder.delivery.status)

    console.log('\n🎯 Instructions pour tester:')
    console.log('1. Connectez-vous comme livreur avec:', livreur.email)
    console.log('2. Allez sur /livreur/commandes')
    console.log('3. La commande devrait apparaître dans "Mes livraisons"')
    console.log('4. Cliquez sur "Gérer cette livraison"')
    console.log('5. Suivez les étapes jusqu\'à "Marquer comme LIVRÉE"')
    console.log('6. La commande devrait disparaître de la liste')

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Connexion fermée')
  }
}

createTestOrderWithLivreur()
