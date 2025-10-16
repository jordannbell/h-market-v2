const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function testAPI() {
 try {
 // Simuler un token de livreur (vous devrez remplacer par un vrai token)
 const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRkMmVkNjMwZDhiN2Y0OTFlZjFjOTMiLCJlbWFpbCI6ImpldGV0ZXk5NzJAYml0bWVucy5jb20iLCJyb2xlIjoibGl2cmV1ciIsImlhdCI6MTc1OTMyNjA3MiwiZXhwIjoxNzU5OTMwODcyfQ.26KSwwKOHD0cRo2orjro40He12KFLjUTlJfI5pQjiHI'
 
 console.log(' Test de l\'API /api/delivery/all-orders...')
 
 const response = await fetch('http://localhost:3000/api/delivery/all-orders', {
 headers: {
 'Authorization': `Bearer ${token}`
 }
 })
 
 console.log('Status:', response.status)
 console.log('Headers:', Object.fromEntries(response.headers.entries()))
 
 const data = await response.json()
 console.log('\n Réponse de l\'API:')
 console.log(JSON.stringify(data, null, 2))
 
 if (data.deliveries) {
 console.log(`\n ${data.deliveries.length} livraisons trouvées`)
 data.deliveries.forEach((delivery, index) => {
 console.log(` ${index + 1}. ${delivery.orderNumber} - ${delivery.deliveryStatus} - ${delivery.totals?.total}€`)
 })
 }
 
 } catch (error) {
 console.error(' Erreur lors du test API:', error.message)
 }
}

testAPI()
