// Script de test pour vérifier l'authentification
// Usage: node scripts/test-auth.js

const testAuth = () => {
 console.log(' Test de l\'authentification')
 console.log('==============================')
 
 console.log('\n1. Vérifier la connexion')
 console.log(' - Se connecter en tant que livreur')
 console.log(' - Vérifier le token dans localStorage')
 console.log(' - Vérifier le rôle utilisateur')
 
 console.log('\n2. Vérifier les routes API')
 console.log(' - /api/delivery/available-orders')
 console.log(' - /api/delivery/my-deliveries')
 console.log(' - /api/delivery/all-orders')
 
 console.log('\n3. Vérifier l\'interface')
 console.log(' - Page dashboard livreur')
 console.log(' - Page commandes livreur')
 console.log(' - Composant de debug visible')
 
 console.log('\n Instructions:')
 console.log(' 1. Ouvrir la console du navigateur (F12)')
 console.log(' 2. Aller sur /livreur/dashboard')
 console.log(' 3. Cliquer sur " Debug Auth"')
 console.log(' 4. Vérifier l\'état de l\'authentification')
 
 console.log('\n Si problème:')
 console.log(' - Se déconnecter et se reconnecter')
 console.log(' - Vérifier la console pour les erreurs')
 console.log(' - Vérifier le localStorage')
 
 console.log('\n Test prêt !')
}

if (require.main === module) {
 testAuth()
}

module.exports = { testAuth }

