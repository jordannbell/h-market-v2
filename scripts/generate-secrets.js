#!/usr/bin/env node

/**
 * Script pour générer des secrets sécurisés pour l'application
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n Génération de secrets sécurisés pour H-Market\n');
console.log('=' .repeat(60));

// Générer JWT_SECRET (256 bits)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\n JWT_SECRET:');
console.log(`JWT_SECRET=${jwtSecret}`);

// Générer NEXTAUTH_SECRET (256 bits)
const nextAuthSecret = crypto.randomBytes(32).toString('hex');
console.log('\n NEXTAUTH_SECRET:');
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);

// Générer un mot de passe aléatoire pour MongoDB (si nécessaire)
const mongoPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
console.log('\n Mot de passe MongoDB suggéré:');
console.log(`MONGO_PASSWORD=${mongoPassword}`);

console.log('\n' + '='.repeat(60));
console.log('\n️ IMPORTANT:');
console.log('1. Copiez ces valeurs dans votre fichier .env');
console.log('2. NE JAMAIS commiter ces secrets dans Git');
console.log('3. Utilisez des secrets différents pour chaque environnement');
console.log('4. Changez ces secrets régulièrement en production');
console.log('\n Secrets générés avec succès !\n');
