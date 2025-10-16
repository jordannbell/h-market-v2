# 🚀 Déploiement H-Market v2 sur Vercel

## ✅ Variables d'environnement à configurer sur Vercel

### Variables OBLIGATOIRES

```bash
# Base de données MongoDB Atlas
MONGODB_URI=mongodb+srv://jordanbe:DIdfrance2024@cluster0.y2fnxpn.mongodb.net/h-market?retryWrites=true&w=majority&appName=Cluster0

# Sécurité JWT
JWT_SECRET=9d486dccd13aec839e5c2bbfa91ef1e351d3f2e7d220fbcc78367eb1456c40ec09d0e95a1000eec10b7d3875f1c5e15c7059579f36132b1e10704ea2f625b7b5

NEXTAUTH_SECRET=33b49fc72d3a5c6c0a46a7c1d020f3b30f2b2e179ce786aa49a83e1f912783c801c68db50417b93b2458f764f146a9eba179b99ecda2e7c64055620c1c002b6c

# Stripe (à compléter avec vos clés)
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI

# Google Maps (à compléter avec votre clé)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza_VOTRE_CLE_ICI

# URL de l'application (à mettre APRÈS le premier déploiement)
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app

# Configuration de l'application
NEXT_PUBLIC_APP_NAME=H-Market
NEXT_PUBLIC_APP_DESCRIPTION=Plateforme E-commerce Africaine
```

### Variables à ajouter APRÈS le premier déploiement

```bash
# Webhook Stripe (à configurer après le déploiement)
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_WEBHOOK_SECRET

# Unsplash (OPTIONNEL)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=votre_cle_unsplash
```

---

## 📝 Instructions de déploiement

### ÉTAPE 1 : Aller sur Vercel

1. Ouvrez votre navigateur
2. Allez sur : **https://vercel.com**
3. Cliquez sur **"Sign Up"** ou **"Log In"**
4. Connectez-vous avec **GitHub** (recommandé)
5. Autorisez Vercel à accéder à vos repos GitHub

### ÉTAPE 2 : Importer votre projet

1. Une fois connecté, cliquez sur **"Add New..."** (en haut à droite)
2. Sélectionnez **"Project"**
3. Vous verrez votre repo **"h-market-v2"** dans la liste
4. Cliquez sur **"Import"** à côté de h-market-v2

### ÉTAPE 3 : Configurer le projet

1. **Configure Project** s'affiche
2. **Project Name** : Laissez `h-market-v2` ou changez si vous voulez
3. **Framework Preset** : Next.js (détecté automatiquement) ✅
4. **Root Directory** : `./` (par défaut) ✅
5. **Build and Output Settings** : Laissez par défaut ✅

### ÉTAPE 4 : ⚠️ IMPORTANT - Ajouter les variables d'environnement

**NE CLIQUEZ PAS ENCORE SUR "DEPLOY" !**

1. Descendez jusqu'à la section **"Environment Variables"**
2. Pour CHAQUE variable ci-dessous, cliquez sur **"Add"** et remplissez :

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://jordanbe:DIdfrance2024@cluster0.y2fnxpn.mongodb.net/h-market?retryWrites=true&w=majority&appName=Cluster0` | Production, Preview, Development |
| `JWT_SECRET` | `9d486dccd13aec839e5c2bbfa91ef1e351d3f2e7d220fbcc78367eb1456c40ec09d0e95a1000eec10b7d3875f1c5e15c7059579f36132b1e10704ea2f625b7b5` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `33b49fc72d3a5c6c0a46a7c1d020f3b30f2b2e179ce786aa49a83e1f912783c801c68db50417b93b2458f764f146a9eba179b99ecda2e7c64055620c1c002b6c` | Production, Preview, Development |
| `STRIPE_PUBLISHABLE_KEY` | Votre clé pk_test_... | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | Votre clé sk_test_... | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Votre clé AIza... | Production, Preview, Development |
| `NEXT_PUBLIC_APP_NAME` | `H-Market` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_DESCRIPTION` | `Plateforme E-commerce Africaine` | Production, Preview, Development |

**Comment ajouter une variable :**
- Name : Copiez le nom exact (ex: `MONGODB_URI`)
- Value : Collez la valeur correspondante
- Environment : Cochez **Production**, **Preview** ET **Development**
- Cliquez **"Add"**
- Répétez pour chaque variable

**Note :** On ajoutera `NEXT_PUBLIC_APP_URL` et `STRIPE_WEBHOOK_SECRET` après le premier déploiement.

### ÉTAPE 5 : Déployer

1. Une fois TOUTES les variables ajoutées (vérifiez bien !)
2. Cliquez sur le gros bouton bleu **"Deploy"**
3. Vercel va :
   - Installer les dépendances (1-2 min)
   - Builder votre application (2-3 min)
   - Déployer (30 secondes)
4. ⏳ Attendez 3-5 minutes (ne fermez pas la page)
5. 🎉 Quand vous voyez "Congratulations!" avec des confettis, c'est bon !

### ÉTAPE 6 : Récupérer l'URL de votre application

1. Cliquez sur **"Continue to Dashboard"** ou **"Visit"**
2. Vous verrez l'URL de votre app (ex: `https://h-market-v2-xxxx.vercel.app`)
3. **COPIEZ cette URL** (vous en aurez besoin)

---

## 🔧 Configuration post-déploiement

### A. Ajouter l'URL de l'application

1. Sur Vercel, allez sur votre projet
2. Cliquez sur **"Settings"** (en haut)
3. Dans le menu de gauche → **"Environment Variables"**
4. Cliquez sur **"Add New"**
5. Ajoutez :
   - Name : `NEXT_PUBLIC_APP_URL`
   - Value : `https://h-market-v2-xxxx.vercel.app` (votre URL)
   - Environment : Cochez Production, Preview, Development
6. Cliquez **"Save"**

### B. Configurer le webhook Stripe

1. Allez sur **https://dashboard.stripe.com**
2. Assurez-vous d'être en mode **Test** (toggle en haut à droite)
3. Dans le menu de gauche → **Developers** → **Webhooks**
4. Cliquez sur **"Add endpoint"**
5. Remplissez :
   - **Endpoint URL** : `https://h-market-v2-xxxx.vercel.app/api/webhooks/stripe` (remplacez par votre URL)
   - **Description** : `H-Market Webhook`
   - **Events to send** : Cliquez sur **"Select events"**
     - Cochez : `payment_intent.succeeded`
     - Cochez : `payment_intent.payment_failed`
     - Cochez : `charge.refunded`
6. Cliquez **"Add endpoint"**
7. Sur la page de l'endpoint créé, vous verrez **"Signing secret"**
8. Cliquez sur **"Reveal"** et **copiez** le secret (commence par `whsec_...`)

### C. Ajouter le webhook secret sur Vercel

1. Retournez sur Vercel → Votre projet → Settings → Environment Variables
2. Cliquez sur **"Add New"**
3. Ajoutez :
   - Name : `STRIPE_WEBHOOK_SECRET`
   - Value : `whsec_...` (le secret copié)
   - Environment : Cochez Production, Preview, Development
4. Cliquez **"Save"**

### D. Redéployer l'application

Pour que les nouvelles variables soient prises en compte :

1. Allez sur l'onglet **"Deployments"**
2. Trouvez le dernier déploiement (en haut)
3. Cliquez sur les **trois points** (...)
4. Cliquez sur **"Redeploy"**
5. Confirmez **"Redeploy"**
6. Attendez 2-3 minutes

---

## ✅ Tester votre application

### Tests à effectuer :

1. **Page d'accueil** : Ouvrez `https://votre-app.vercel.app`
   - Devrait afficher la page d'accueil de H-Market

2. **Test de la base de données** : `https://votre-app.vercel.app/api/test-db`
   - Devrait afficher un message de succès de connexion MongoDB

3. **Inscription** : Allez sur `/auth/register`
   - Créez un compte client

4. **Connexion** : Allez sur `/auth/login`
   - Connectez-vous avec le compte créé

5. **Produits** : Allez sur `/produits`
   - Devrait afficher la liste des produits (vide au début)

6. **Admin** : Allez sur `/admin/login`
   - Vous devrez créer un compte admin d'abord (voir ci-dessous)

### Créer un compte administrateur

Option 1 - Via API (recommandé) :
```bash
curl -X POST https://votre-app.vercel.app/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hmarket.com",
    "password": "Admin123!",
    "nom": "Admin",
    "prenom": "Principal"
  }'
```

Option 2 - Via script local :
```bash
# Créez un fichier .env.local avec vos variables
node scripts/setup-database.js
node scripts/seed.js
```

---

## 🎯 Checklist finale

- [ ] Application déployée sur Vercel
- [ ] Toutes les variables d'environnement configurées
- [ ] URL de l'application ajoutée dans les variables
- [ ] Webhook Stripe configuré
- [ ] Application redéployée après ajout des variables
- [ ] Test de connexion MongoDB réussi
- [ ] Compte admin créé
- [ ] Inscription/connexion fonctionnelle

---

## 🐛 Dépannage

### Erreur "MongoDB connection failed"
- Vérifiez que `MONGODB_URI` est bien configurée dans Vercel
- Vérifiez que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas

### Erreur "JWT_SECRET must be defined"
- Vérifiez que `JWT_SECRET` est bien dans les Environment Variables
- Redéployez l'application

### Erreur Stripe
- Vérifiez que les clés Stripe sont bien en mode Test
- Vérifiez que le webhook est bien configuré avec la bonne URL

### Page blanche ou erreur 500
- Allez sur Vercel → Deployments → Votre déploiement → Functions
- Consultez les logs pour voir l'erreur exacte

---

## 📚 Ressources

- Dashboard Vercel : https://vercel.com/dashboard
- Documentation Vercel : https://vercel.com/docs
- Votre repo GitHub : https://github.com/jordannbell/h-market-v2
- MongoDB Atlas : https://cloud.mongodb.com
- Stripe Dashboard : https://dashboard.stripe.com

---

Bon déploiement ! 🚀

