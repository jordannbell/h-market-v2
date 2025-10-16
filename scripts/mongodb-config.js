// Configuration MongoDB Atlas pour H-Market
// Remplacez les valeurs par vos vraies informations de connexion

const MONGODB_CONFIG = {
 // URI de connexion MongoDB Atlas
 // Format: mongodb+srv://username:password@cluster.mongodb.net/database
 uri: 'mongodb+srv://jordanbe37x21:VOTRE_MOT_DE_PASSE@cluster0.mongodb.net/h-market?retryWrites=true&w=majority',
 
 // Nom de la base de données
 database: 'h-market',
 
 // Options de connexion
 options: {
 retryWrites: true,
 w: 'majority',
 maxPoolSize: 10,
 serverSelectionTimeoutMS: 5000,
 socketTimeoutMS: 45000,
 }
};

// Instructions de configuration :
// 1. Allez sur MongoDB Atlas (cloud.mongodb.com)
// 2. Connectez-vous avec votre compte
// 3. Sélectionnez votre cluster
// 4. Cliquez sur "Connect"
// 5. Choisissez "Connect your application"
// 6. Copiez l'URI de connexion
// 7. Remplacez <password> par votre vrai mot de passe
// 8. Remplacez <dbname> par "h-market"

// Exemple d'URI :
// mongodb+srv://jordanbe37x21:MonMotDePasse123@cluster0.abc123.mongodb.net/h-market?retryWrites=true&w=majority

module.exports = MONGODB_CONFIG;

