// --- Pré-configuration commune aux tests backend ---
// 1) Garantir qu'un secret JWT est toujours présent avant d'importer les modules auth
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

// 2) Isoler la base Mongo en tests pour éviter d'impacter un environnement réel
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hmarket-test'

// 3) Nettoyer les variables Next.js susceptibles de provoquer des warnings
process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

