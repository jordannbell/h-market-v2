// Script de diagnostic des tokens
// Usage: node scripts/debug-token.js

const debugToken = () => {
 console.log(' Diagnostic des Tokens JWT')
 console.log('==============================')
 
 console.log('\n1. Vérifier la structure du token')
 console.log(' - Format: header.payload.signature')
 console.log(' - Longueur minimale: 100+ caractères')
 console.log(' - Pas d\'espaces ou caractères spéciaux')
 
 console.log('\n2. Vérifier le localStorage')
 console.log(' - Ouvrir la console (F12)')
 console.log(' - Exécuter: localStorage.getItem("token")')
 console.log(' - Vérifier que le token est présent')
 
 console.log('\n3. Vérifier la validité du token')
 console.log(' - Aller sur jwt.io')
 console.log(' - Coller le token')
 console.log(' - Vérifier la structure')
 
 console.log('\n4. Vérifier les variables d\'environnement')
 console.log(' - JWT_SECRET est défini')
 console.log(' - JWT_SECRET n\'est pas vide')
 console.log(' - JWT_SECRET est suffisamment long')
 
 console.log('\n5. Vérifier la base de données')
 console.log(' - Utilisateur existe')
 console.log(' - Compte est actif')
 console.log(' - Rôle est correct')
 
 console.log('\n Solutions:')
 console.log(' 1. Nettoyer localStorage: localStorage.clear()')
 console.log(' 2. Se reconnecter')
 console.log(' 3. Vérifier JWT_SECRET')
 console.log(' 4. Redémarrer le serveur')
 
 console.log('\n Test prêt !')
}

if (require.main === module) {
 debugToken()
}

module.exports = { debugToken }

