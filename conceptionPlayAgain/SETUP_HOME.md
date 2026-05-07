# Guide d'Installation pour travailler à la maison 🏠

Ce guide récapitule les étapes nécessaires pour cloner le projet et le faire fonctionner sur une nouvelle machine.

## 1. Pré-requis
Assure-toi d'avoir installé :
- **Node.js** (v20 ou plus récent)
- **Docker** et **Docker Desktop** (pour la base de données)
- **Git**

## 2. Récupération du projet
```bash
git clone [URL_DU_REPO]
cd PlayAgain/play-again
```

## 3. Configuration de l'environnement
Crée un fichier `.env` à la racine du dossier `play-again` et colle le contenu suivant :
```env
# Connexion à la base de données MariaDB dans Docker
DATABASE_URL="mysql://dev_user:dev_password@localhost:3306/play_again_db"

# Configuration NextAuth
NEXTAUTH_SECRET="un_secret_tres_long_et_aleatoire"
NEXTAUTH_URL="http://localhost:3000"
```

## 4. Lancement de la Base de Données (Docker)
Assure-toi que Docker est lancé, puis exécute :
```bash
docker compose up -d
```
*Cela va lancer un conteneur MariaDB accessible sur le port 3306.*

## 5. Initialisation de Prisma et de la BDD
```bash
# Installation des dépendances
npm install

# Création des tables dans la base de données
npx prisma db push

# Remplissage de la base de données avec les données de test (catégories, marques, etc.)
npx prisma db seed
```

## 6. Lancement de l'application
```bash
npm run dev
```
L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

---

## Rappels Utiles 💡

### Commandes Prisma
- `npx prisma generate` : À faire si tu modifies le fichier `schema.prisma`.
- `npx prisma studio` : Ouvre une interface visuelle pour voir et modifier les données de la BDD.

### Problèmes fréquents
- **Modules manquants** : Si tu as une erreur "Module not found", fais `npm install`.
- **Docker/Port 3306 déjà utilisé** : Vérifie qu'aucune autre instance de MySQL/MariaDB ne tourne sur ton PC.
- **Erreurs de seed** : Si le seed échoue, vérifie que le conteneur Docker est bien "Up".
