# Guide de Seeding avec Prisma - PlayAgain

Le "seeding" est le processus de peuplement de la base de données avec un ensemble initial de données. C'est essentiel pour le développement, les tests, ou pour initialiser des tables de référence (catégories, marques, etc.).

## 1. Configuration requise

Pour que Prisma reconnaisse votre script de seed, deux éléments sont nécessaires dans le `package.json` :

1. **La dépendance de développement** : `ts-node` (pour exécuter du TypeScript directement).
2. **La commande de seed** :
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

## 2. Structure du fichier `seed.ts`

Le fichier doit se trouver dans le dossier `prisma/`. Voici le squelette standard pour garantir une bonne gestion des ressources :

```typescript
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Début du remplissage de la base de données...")

  // --- Vos insertions ici ---

  console.log("✅ Seeding terminé avec succès.")
}

main()
  .then(async () => {
    // Déconnexion propre après réussite
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    // Gestion d'erreur et déconnexion en cas d'échec
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
```

## 3. Syntaxe et Méthodes Clés

### A. `upsert` (Recommandé)
La méthode `upsert` est la meilleure pratique pour le seeding car elle est **idempotente** : vous pouvez relancer le script plusieurs fois sans créer de doublons ni d'erreurs.

*   `where` : Condition pour trouver l'enregistrement (doit être un champ unique/ID).
*   `update` : Ce qu'il faut modifier si l'enregistrement existe déjà.
*   `create` : Ce qu'il faut créer si l'enregistrement n'existe pas.

```typescript
await prisma.category.upsert({
  where: { id: 1 },
  update: {}, // On ne change rien si ça existe déjà
  create: {
    id: 1,
    label: "Vêtements",
  },
})
```

### B. `createMany`
Utile pour insérer rapidement de gros volumes de données sans relations complexes.
*Attention : `createMany` n'est pas supporté par toutes les bases de données pour toutes les relations.*

## 4. Gestion de l'ordre (Relations)

L'ordre d'insertion est crucial à cause des **clés étrangères**. Vous ne pouvez pas créer un Produit si sa Catégorie n'existe pas encore.

**Ordre logique conseillé pour PlayAgain :**
1.  **Niveau 1 (Indépendants)** : `Category`, `Brand`, `User`.
2.  **Niveau 2 (Dépendants simples)** : `Type` (dépend de `Category`), `Address` (dépend de `User`).
3.  **Niveau 3 (Objets complexes)** : `Product` (dépend de `User`, `Category`, `Brand`, `Type`).
4.  **Niveau 4 (Interactions)** : `Message`, `BasketItem`, `Invoice`.

## 5. Exécution

Pour lancer le seeding, utilisez la commande suivante :

```bash
npx prisma db seed
```

## 6. Bonnes pratiques
-   **Données réalistes** : Utilisez des noms et descriptions qui ont du sens pour vos tests UI.
-   **Variables** : Stockez vos données dans des tableaux pour boucler dessus (plus propre).
-   **Nettoyage** : Parfois, il peut être utile d'ajouter un `prisma.model.deleteMany()` au début du script pour repartir de zéro (attention en production !).
