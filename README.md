<p align="center">
  <img src="conceptionPlayAgain/images/Readme.png" alt="PlayAgain Banner" width="100%" style="border-radius: 8px;" />
</p>

# PlayAgain 🔄 - Marketplace Éco-Responsable

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0%2B-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Language-FR-blue?style=for-the-badge" alt="Language" />
</p>

---

> **Redonnez vie à vos équipements de sport, donnez du souffle à la planète et optimisez vos performances en toute sécurité.** 🌿🏆

PlayAgain est une marketplace moderne de seconde main dédiée aux équipements et matériels sportifs techniques, combinant un moteur d'affinité intelligent et des transactions sécurisées.

---

## 🗺️ Table des Matières

1. [📖 Présentation & Pitch](#-présentation--pitch)
2. [⚙️ Installation et Configuration](#%EF%B8%8F-installation-et-configuration)
3. [🚀 Fonctionnalités Clés](#-fonctionnalités-clés)
4. [🛠️ Stack Technique](#%EF%B8%8F-stack-technique)
5. [📂 Organisation du Code](#-organisation-du-code)
6. [📐 Architecture de Données](#-architecture-de-données)
7. [🎨 Design System (Figma)](#-design-system-figma)
8. [📊 Diagnostics et Métriques](#-diagnostics-et-métriques)
9. [⚖️ Mentions Légales et Sécurité](#%EF%B8%8F-mentions-légales-et-sécurité)
10. [✍️ Signature & Crédits](#%EF%B8%8F-signature--crédits)

---

## 📖 Présentation & Pitch

### L'Ambition PlayAgain
Chaque année, des millions d'équipements de sport de haute qualité dorment dans des placards ou finissent prématurément dans des décharges, tandis que des sportifs à la recherche de matériel technique se heurtent à des prix neufs prohibitifs. **PlayAgain** est née pour briser ce cycle en offrant une marketplace dédiée exclusivement aux articles sportifs de seconde main. Notre objectif est de redonner de la valeur à ces équipements techniques tout en diminuant de manière significative l'empreinte carbone collective liée à la pratique sportive.

Au-delà d'une simple plateforme de petites annonces, PlayAgain réinvente l'achat d'occasion en apportant de l'intelligence et de la sécurité dans chaque échange. Que vous soyez un skieur chevronné, un surfeur débutant ou un cycliste passionné, la plateforme vous oriente vers le matériel idéalement adapté à vos besoins physiques, physiologiques et techniques, éliminant ainsi toute approximation.

### 🌟 Propositions de Valeur Uniques (USP)
*   **Calculateur d'Affinité Morphologique & Technique (AI & Paramétrique) :** Fini le risque d'acheter un équipement inadapté ou dangereux. PlayAgain croise automatiquement les données physiques de l'acheteur (poids, taille, niveau) avec les attributs de l'article (taille de planche, niveau requis) pour afficher un indicateur de compatibilité dynamique.
*   **Sécurisation Totale via Séquestre Financier (Stripe Connect Express) :** Les fonds de l'acheteur sont sécurisés et mis sous séquestre jusqu'à la livraison et la validation de la conformité de l'article. Les vendeurs reçoivent leurs virements automatiquement après validation, éliminant le risque de fraude.
*   **Certification de Confiance ("KYC Trust") :** Pour lutter contre le vol et le recel, les profils des vendeurs peuvent être vérifiés et labellisés via un parcours d'authentification robuste (photos de pièces d'identité et selfie de contrôle avec mot manuscrit).

### 🎯 Cible d'Utilisateurs
*   **Les Vendeurs :** Sportifs de tous niveaux souhaitant faire de la place chez eux, rentabiliser leurs anciens équipements haut de gamme ou financer l'achat de leur futur matériel.
*   **Les Acheteurs :** Pratiquants amateurs, intermédiaires ou professionnels recherchant des articles de grandes marques de sport (technique, premium ou généraliste) à un prix d'occasion juste et transparent, tout en s'inscrivant dans une démarche éco-responsable.

---

## ⚙️ Installation et Configuration

Cette section détaille la procédure étape par étape pour cloner le projet, configurer les variables d'environnement, démarrer les conteneurs et lancer le serveur de développement local.

### 📋 Pré-requis système
*   **Node.js :** Version `>= v20` (Node 20 LTS recommandée).
*   **Gestionnaire de paquets :** `npm` (installé par défaut avec Node.js) ou `pnpm` / `yarn`.
*   **Docker & Docker Compose :** Nécessaire pour démarrer l'instance locale de MariaDB sans installation manuelle.

---

### 1. Clonage du projet
Clonez le dépôt distant et accédez au dossier racine de l'application :
```bash
git clone git@github.com:Charles-de-Chabot/PlayAgain.git
cd PlayAgain/play-again
```

---

### 2. Configuration des variables d'environnement
Créez un fichier `.env` à la racine du sous-dossier `play-again` à partir de la configuration par défaut :
```bash
cp .env.example .env
```

Éditez le fichier `.env` en y configurant les variables clés :

#### 🗄️ Base de Données
*   `DATABASE_URL` : Chaîne de connexion à MariaDB. En local, nous utilisons l'hôte `localhost` car le conteneur MariaDB expose son port `3306` sur la machine hôte.
    ```env
    DATABASE_URL="mysql://dev_user:dev_password@localhost:3306/play_again_db"
    ```

#### 🔑 Authentification (Auth.js v5 / NextAuth)
*   `AUTH_SECRET` & `NEXTAUTH_SECRET` : Clés aléatoires servant à signer et chiffrer les tokens JWT de session. Générez un secret sécurisé en ligne de commande :
    ```bash
    openssl rand -base64 32
    ```
*   `NEXTAUTH_URL` : URL d'accès de base en local.
    ```env
    NEXTAUTH_URL="http://localhost:3000"
    ```
*   `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` : Secrets et ID Client obtenus dans la console Google Cloud pour autoriser la connexion via compte Google et le One Tap.

#### 💳 Paiements & Séquestres Stripe
*   `STRIPE_SECRET_KEY` : Clé privée de test (`sk_test_...`) pour les requêtes API serveur (création de sessions de paiement, transferts Stripe Connect).
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` : Clé publique de test (`pk_test_...`) pour Stripe Elements.
*   `STRIPE_WEBHOOK_SECRET` : Clé secrète de validation des événements Stripe (`whsec_...`). Obtenue lors du lancement de la Stripe CLI (voir l'étape 6 de l'installation). La CLI affichera : `Ready! Your webhook signing secret is whsec_...`. Vous devez copier cette valeur et la reporter dans le fichier `.env`.

---

### 3. Lancement de la Base de Données
Démarrez le conteneur Docker en arrière-plan contenant l'instance MariaDB configurée :
```bash
docker compose up -d
```

---

### 4. Initialisation des dépendances et de Prisma
Installez les packages Node et préparez les schémas SQL :
```bash
# Installation des dépendances
npm install

# Génération du client Prisma (indispensable pour le typage des requêtes)
npx prisma generate

# Création des tables dans MariaDB (push du schéma Prisma)
npx prisma db push

# Injection des données initiales (seeds de catégories, marques, etc.)
npx prisma db seed
```

---

### 5. Démarrage du serveur local
Démarrez le serveur Next.js en mode développement :
```bash
npm run dev
```
L'application est maintenant accessible à l'adresse suivante : [http://localhost:3000](http://localhost:3000).

---

### 6. Écoute des Webhooks Stripe (Pour tester les transactions)
Pour capter localement les événements Stripe (ex: validation de paiement `payment_intent.succeeded` pour le séquestre des fonds), vous devez associer la CLI à votre compte Stripe. Vous pouvez le faire soit en vous connectant, soit en fournissant directement votre clé API de test :

```bash
# Option A : Via connexion par navigateur (recommandé)
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Option B : Directement en transmettant votre clé secrète (sk_test_...) du fichier .env
stripe listen --forward-to localhost:3000/api/webhooks/stripe --api-key sk_test_51TLB0IGpN...
```

> [!IMPORTANT]  
> Lors du lancement réussi de la commande `stripe listen`, la CLI Stripe affichera une ligne de ce type :
> `Ready! Your webhook signing secret is whsec_abc123...`
> Copiez cette clé `whsec_...` et collez-la dans votre fichier `.env` sous la variable `STRIPE_WEBHOOK_SECRET` pour que l'application puisse authentifier les appels Stripe, puis redémarrez votre serveur Next.js.


---


### 🛠️ Résolution des Problèmes (Troubleshooting)

> [!WARNING]  
> **Erreur de port 3306 occupé :** Si le conteneur Docker refuse de démarrer, vérifiez qu'aucune instance locale de MySQL ou MariaDB ne tourne déjà sur votre machine. Arrêtez le service système (`sudo service mysql stop` ou équivalent) avant de relancer `docker compose`.

> [!NOTE]  
> ```bash
> npx prisma studio
> ```

---

## 🚀 Fonctionnalités Clés

Chaque fonctionnalité majeure de PlayAgain répond à des objectifs business et des contraintes techniques précis, garantissant une expérience utilisateur premium, fluide et sécurisée.

### 1. Profil Sportif Adaptatif
*   **Objectif :** Maximiser la sécurité des pratiquants en évitant l'achat de matériel inadapté et réduire le taux de retour d'articles incompatibles.
*   **Détails Techniques :** Collecte de données morphologiques (taille, poids) et sportives (sports pratiqués, niveau : débutant, intermédiaire, avancé, pro, et fréquence de pratique). Le système calcule en temps réel la compatibilité de l'article en vente (ex. : taille de skis/surf) avec le gabarit de l'acheteur et affiche un indicateur visuel de couleur (Vert/Orange/Rouge) directement sur la fiche produit.

### 2. Messagerie Interne & Support Client
*   **Objectif :** Permettre une communication fluide, confidentielle et directe entre acheteurs et vendeurs sans divulgation de coordonnées privées.
*   **Détails Techniques :** Module de chat instantané associé à chaque annonce de produit. Il comprend des boutons de signalement de messages inappropriés et d'ouverture de tickets d'assistance client, connectés au panneau d'administration.

### 3. Sécurité & Certification d'Identité (KYC Trust)
*   **Objectif :** Éliminer le risque d'escroqueries, de contrefaçons ou de recel, et rassurer les acheteurs sur le sérieux des vendeurs.
*   **Détails Techniques :** Processus d'authentification en 4 sections : (1) Coordonnées, (2) Adresse physique, (3) Photos des pièces d'identité (CNI/Passeport), (4) Selfie de contrôle avec mot manuscrit temporaire "Play Again". La vérification est hybride : validation manuelle administrative ou validation automatique biométrique locale via FastAPI + DeepFace + OCR (PaddleOCR). Un badge brillant exclusif "Identité Vérifiée" est attribué aux comptes validés.

### 4. Transactions Sécurisées & Séquestre Stripe
*   **Objectif :** Protéger les fonds des acheteurs jusqu'à la livraison conforme de l'article et garantir un paiement automatique au vendeur.
*   **Détails Techniques :** Onboarding Stripe Connect Express pour les vendeurs (renseignement de l'IBAN sécurisé). Initialisation du paiement via Stripe Elements. Séquestration des fonds. Le transfert d'argent (déblocage) s'active automatiquement via cron job suite à la confirmation de livraison ou manuellement par un administrateur après résolution de litige. La commission plateforme est prélevée automatiquement à la source.

### 5. Panneau d'Administration Centralisé (Back-Office Multi-Modules)
*   **Objectif :** Offrir à l'équipe opérationnelle de PlayAgain un contrôle absolu et granulaire sur l'activité financière, le catalogue et la modération du site.
*   **Détails Techniques :** Le back-office d'administration regroupe 15 modules distincts :
    *   *Dashboard :* Aperçu global de l'activité, inscriptions quotidiennes et volume d'affaires (GMV).
    *   *Utilisateurs :* Modération et suspension/activation des comptes utilisateurs.
    *   *Catalogue :* Validation et gestion des fiches articles publiées.
    *   *Transactions & Litiges :* Supervision des transactions financières et résolution des litiges clients.
    *   *Vérifications d'ID (KYC) :* Validation des dossiers d'identité et des selfies de contrôle.
    *   *Notifications & Sondages :* Planification et envoi d'alertes temps réel (SSE) et de sondages de satisfaction.
    *   *Marques & IA :* Gestion des taxonomies de marques et des règles IA (embeddings, niveaux, gammes).
    *   *Commissions :* Paramétrage dynamique des pourcentages de commission et frais.
    *   *Détection Fraude :* Outil d'analyse des comportements suspects ou spams.
    *   *Logistique Active :* Suivi des statuts des colis et gestion manuelle de livraison.
    *   *Audit Interne :* Logs d'audit détaillés des actions administratives pour des raisons de conformité.
    *   *Codes Promos :* Génération, suivi et limites d'utilisation des codes de réduction.
    *   *Helpdesk Support :* Traitement des demandes de support génériques.
    *   *Nettoyeur d'Images :* Script d'analyse pour supprimer les images orphelines du stockage.
    *   *Console SEO :* Configuration SEO, meta-tags et gestion des sitemaps/redirections.

### 6. Système de Notifications Temps Réel (SSE & In-App)
*   **Objectif :** Maximiser la réactivité des utilisateurs face aux messages de chat, ventes et statuts d'expéditions.
*   **Détails Techniques :** Envoi des alertes via Server-Sent Events (SSE). Micro-animations CSS sur la cloche du menu, notifications dynamiques sur le titre de l'onglet du navigateur, regroupement anti-spam des alertes pour une même discussion sous 15 minutes, et suppression automatique après 30 jours.

### 7. Gestion de l'État des Articles en Vente
*   **Objectif :** Structurer précisément le cycle de vie de chaque produit pour offrir une transparence totale sur son niveau d'usure.
*   **Détails Techniques :** Utilisation de l'énumération Prisma `stateProduct` (`NEUF`, `EXCELLENT`, `BON`, `SATISFAISANT`). Le cycle de vie est verrouillé par le statut `is_sold` (interdiction d'acheter un produit unique déjà vendu) et le statut `is_active` (permettant aux modérateurs de suspendre une annonce non conforme).

### 8. Calculateur de Rapport Qualité/Prix (Deal Score)
*   **Objectif :** Mettre en évidence les meilleures offres financières de la marketplace pour inciter à l'achat.
*   **Détails Techniques :** L'algorithme `calculateProductScore` combine :
    *   *Score d'usure physique (50%) :* Attribution de points prédéfinis (`NEUF` : 100, `EXCELLENT` : 85, `BON` : 70, `SATISFAISANT` : 50).
    *   *Score de prix relatif (50%) :* Comparaison avec le prix moyen de la catégorie pondéré par la gamme de la marque (`GENERALIST` : x1.0, `TECHNICAL` : x1.6, `PREMIUM` : x2.8).
    *   *Bonus accessoire (+10 pts) :* Ajouté si `accessoryIncluded` est vrai.
    *   *Labellisation UI/UX :* Si le score est `>= 90`, attribution du badge **"Super Deal 🔥"** (dégradé vert émeraude animé) octroyant `+8 points` bonus dans le moteur de matching utilisateur.

### 9. Algorithme de Correspondance et d'Affinité (AI Matching Engine)
*   **Objectif :** Personnaliser l'expérience d'achat en proposant prédictivement les équipements les plus adaptés au profil et budget de l'utilisateur.
*   **Détails Techniques :** Le moteur d'affinité croise :
    *   *Classification Intelligente (Niveau & Gamme) :* Classification automatique du niveau requis (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `PRO`) et de la gamme de la marque (`GENERALIST`, `TECHNICAL`, `PREMIUM`). Il utilise des heuristiques prioritaires et, en dernier recours, une comparaison sémantique par similarité cosinus (embeddings via `all-MiniLM-L6-v2` exécutés localement avec `@xenova/transformers`).
    *   *Écart de Niveau :* Pénalité linéaire de `-20%` par niveau d'écart. Si l'équipement est trop difficile pour le niveau de l'acheteur, un message d'alerte sécurité s'affiche.
    *   *Intégration du Deal Score :* Bonus d'affichage de `+8 points` pour un "Super Deal", et malus de `-12 points` si l'article est surévalué financièrement.

### 10. Support Client & Gestion des Réclamations (Dispute Center)
*   **Objectif :** Offrir un espace neutre d'arbitrage pour résoudre de manière structurée les désaccords liés aux transactions.
*   **Détails Techniques :** Modèle Prisma `SupportTicket` lié à un acheteur, un vendeur et une transaction. Module de discussion sécurisé avec les administrateurs via `SupportMessage` (avec distinction `isAdminReply` pour identifier l'intervenant officiel).
### 11. Logs de Sécurité, Audit & Configurations Dynamiques
*   **Objectif :** Tracer l'intégralité des actions sensibles sur la plateforme à des fins d'audit de sécurité et administrer l'application à chaud sans mise à jour du code.
*   **Détails Techniques :** Historisation complète des connexions et des adresses IP via `UserActivityLog`, et enregistrement des actions des modérateurs via `AdminLog`. La table Prisma `SystemConfig` sert de base clé-valeur pour modifier à chaud les paramètres système (pourcentage de commission, montant minimum de transaction, etc.).

---

## 🛠️ Stack Technique

PlayAgain s'appuie sur une stack de technologies modernes, performantes et sécurisées pour assurer le rendu rapide des pages, le traitement local de l'intelligence artificielle et la robustesse des transactions financières.

| Composant | Technologie | Rôle dans l'application | Justification Technique |
| :--- | :--- | :--- | :--- |
| **Frontend & SSR** | **Next.js 15+ & React 19** | Rendu hybride et structure applicative. | Utilisation de l'App Router pour le Server-Side Rendering (SSR) et l'Incremental Static Regeneration (ISR), garantissant des temps de chargement ultra-rapides et une indexation SEO maximale pour le catalogue de produits. |
| **Styling** | **Tailwind CSS v4 & PostCSS** | Intégration graphique et design. | Permet d'écrire des styles modernes, réactifs et d'optimiser le bundle CSS au pixel près avec une approche Mobile-First, tout en supportant les variables CSS personnalisées natives. |
| **State Management** | **Zustand** | Gestion d'état global client-side. | Bibliothèque extrêmement légère et réactive pour gérer l'état du panier d'achat, les filtres de recherche et l'état global sans les lourdeurs de React Context ou Redux. |
| **Persistance & ORM** | **Prisma ORM** | Cartographie de données et requêtes DB. | Assure une sécurité de typage de bout en bout (Type-Safe queries) avec TypeScript, facilitant les migrations de schémas et la manipulation de données relationnelles complexes. |
| **Base de Données** | **MariaDB** | Stockage de données relationnelles. | SGBDR robuste, performant et compatible SQL, idéal pour gérer les relations complexes (utilisateurs, profils sportifs, transactions et logs). |
| **Authentification** | **NextAuth.js v5 (Auth.js)** | Sécurisation des sessions. | Authentification sécurisée gérant les sessions utilisateur via identifiants classiques (Credentials) et connexion rapide via les comptes Google (OAuth et One Tap). |
| **Paiements** | **Stripe (Connect Express)** | Séquestres et transferts d'argent. | Solution de référence pour gérer des flux financiers de type marketplace. Stripe Connect Express permet l'onboarding rapide des vendeurs et la mise sous séquestre sécurisée des transactions. |
| **Intelligence Artificielle** | **@xenova/transformers (Transformers.js)** | Modèle d'embeddings sémantiques. | Exécution locale (Node.js) du modèle `all-MiniLM-L6-v2` pour calculer la similarité cosinus. Permet de classifier automatiquement la gamme (`GENERALIST`, `TECHNICAL`, `PREMIUM`) et le niveau (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `PRO`) des marques et matériels de sport, fonctionnant 100% hors-ligne sans appels réseau externes (sans API OpenAI ou HuggingFace payantes). |

---

## 📂 Organisation du Code

L'application suit la structure standard de Next.js (App Router), organisée de manière modulaire pour isoler les composants, les hooks personnalisés, les scripts d'accès aux données (Prisma) et les algorithmes d'IA locale.

```text
play-again/
├── app/                  # Routes, layouts et pages Next.js (App Router)
│   ├── api/              # Points d'entrée d'API (Stripe webhooks, SSE, Auth)
│   ├── admin/            # Pages du Panneau d'Administration Multi-Modules
│   ├── chat/             # Chat en temps réel et messagerie interne
│   └── page.tsx          # Fiche d'accueil et catalogue principal
├── components/           # Composants UI React réutilisables (atomiques et moléculaires)
│   ├── admin/            # Composants liés au panneau d'administration
│   ├── chat/             # Composants de messagerie instantanée
│   └── ui/               # Éléments d'interface de base (boutons, inputs, badges)
├── hooks/                # Hooks React personnalisés (état global, transactions, notifications)
├── lib/                  # Bibliothèques, utilitaires et configurations globales
│   ├── ai/               # Moteur IA local (matcher, calcul d'embeddings @xenova/transformers)
│   ├── db.ts             # Instance partagée du client Prisma
│   └── utils.ts          # Utilitaires génériques (ex: calcul du Deal Score)
├── prisma/               # Schémas de base de données et scripts d'initialisation
│   ├── schema.prisma     # Définition des entités de la base de données MariaDB
│   └── seed.ts           # Script d'injection des données de base (catégories, marques)
├── public/               # Actifs statiques accessibles publiquement (images, icônes)
└── package.json          # Déclaration des dépendances et scripts système
```

---

## 📐 Architecture de Données

PlayAgain utilise Prisma ORM pour modéliser et requêter la base de données relationnelle MariaDB. Ce schéma intègre les concepts clés d'utilisateurs, de profils morphologiques, de transactions, d'audits et de cache de modélisation IA.

Voici le diagramme entité-relation (ERD) complet de l'application :

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email
        string role "USER | ADMIN"
        datetime createdAt
    }

    SportProfile {
        string id PK
        string userId FK
        int height "cm"
        int weight "kg"
        string gender
        datetime updatedAt
    }

    SportSkill {
        string id PK
        string profileId FK
        string sportId
        string skillLevel "BEGINNER | INTERMEDIATE | ADVANCED | PRO"
    }

    Product {
        string id PK
        string sellerId FK
        string title
        float price
        string stateProduct "NEUF | EXCELLENT | BON | SATISFAISANT"
        boolean is_sold
        boolean is_active
        boolean accessoryIncluded
        datetime createdAt
    }

    Transaction {
        string id PK
        string productId FK "Unique"
        string buyerId FK
        string stripePaymentIntentId
        string status "PENDING | SECURED | COMPLETED | DISPUTED | REFUNDED"
        datetime createdAt
    }

    Invoice {
        string id PK
        string transactionId FK "Unique"
        string invoiceNumber
        float totalAmount
        datetime createdAt
    }

    InvoiceItem {
        string id PK
        string invoiceId FK
        string description
        float amount
    }

    VerificationRequest {
        string id PK
        string userId FK
        string status "PENDING | APPROVED | REJECTED"
        string idDocumentUrl
        string selfieUrl
        datetime createdAt
    }

    Conversation {
        string id PK
        datetime createdAt
    }

    ConversationParticipant {
        string conversationId PK, FK
        string userId PK, FK
    }

    Message {
        string id PK
        string conversationId FK
        string senderId FK
        string content
        datetime createdAt
    }

    SupportTicket {
        string id PK
        string userId FK
        string transactionId FK "Optional"
        string status "OPEN | IN_PROGRESS | RESOLVED | CLOSED"
        datetime createdAt
    }

    SupportMessage {
        string id PK
        string ticketId FK
        string senderId FK
        string content
        boolean isAdminReply
        datetime createdAt
    }

    Notification {
        string id PK
        string userId FK
        string type "INFO | TRANSACTION | CHAT | ALERT"
        string content
        boolean isRead
        datetime createdAt
    }

    UserActivityLog {
        string id PK
        string userId FK
        string action
        string ipAddress
        datetime createdAt
    }

    AdminLog {
        string id PK
        string adminId FK
        string action
        string targetEntity
        string details
        datetime createdAt
    }

    BrandExpertise {
        string id PK "Entité Isolée (Cache IA)"
        string brandName "Unique"
        string marketPosition "GENERALIST | TECHNICAL | PREMIUM"
        string defaultSkillLevel "BEGINNER | INTERMEDIATE | ADVANCED | PRO"
        datetime updatedAt
    }

    SystemConfig {
        string key PK "Entité Isolée (Config)"
        string value
        datetime updatedAt
    }

    User ||--|| SportProfile : "has"
    SportProfile ||--o{ SportSkill : "defines"
    User ||--o{ Product : "sells"
    Product ||--o| Transaction : "originates"
    Transaction ||--|| Invoice : "generates"
    Invoice ||--o{ InvoiceItem : "contains"
    User ||--o{ VerificationRequest : "submits"
    User ||--o{ ConversationParticipant : "belongs to"
    Conversation ||--o{ ConversationParticipant : "includes"
    Conversation ||--o{ Message : "contains"
    User ||--o{ Message : "writes"
    User ||--o{ SupportTicket : "opens"
    SupportTicket ||--o{ SupportMessage : "comprises"
    User ||--o{ SupportMessage : "sends"
    User ||--o{ Notification : "receives"
    User ||--o{ UserActivityLog : "generates logs"
    User ||--o{ AdminLog : "performs actions"
```

---

## 🎨 Design System (Figma)

Pour assurer une intégration UI/UX homogène et fidèle aux maquettes Figma de PlayAgain, les développeurs doivent respecter rigoureusement la charte graphique et le système de grilles décrits ci-dessous.

### 🎨 Palette de Couleurs

#### Couleurs Principales
*   **Primaire (Violet) :** `#7D38FF` — Utilisé pour les boutons d'appel à l'action principaux, les liens interactifs, les contours d'inputs actifs et les éléments sélectionnés.
*   **Accent (Vert Citron) :** `#C6FF34` — Utilisé pour les badges de confiance de la plateforme, les indicateurs de réussite et certaines touches esthétiques de contraste.
*   **Neutre Sombre (Noir) :** `#000000` — Couleur de fond pour les zones immersives sombres (mode sombre global, pied de page, hero banners).
*   **Neutre Clair (Blanc) :** `#FFFFFF` — Couleur de fond pour les conteneurs de cartes de produits, formulaires et blocs de texte clairs.

#### Couleurs des Fonctionnalités Métier
*   **Badge "Super Deal 🔥" :** Dégradé brillant en mouvement (gradient linéaire du Vert Émeraude `#10B981` au Vert Menthe `#059669`).
*   **Indicateurs de Compatibilité Morphologique :**
    *   🟢 *Compatible :* Vert Émeraude `#10B981`
    *   🟡 *Modéré :* Orange Ambre `#F59E0B`
    *   🔴 *Incompatible/Attention :* Rouge Cerise `#EF4444`
*   **Badge "Identité Vérifiée" :** Effet de lueur radial brillant combinant le Violet `#7D38FF` et le Vert Citron `#C6FF34`.
*   **Dispute Center (Statuts des Tickets) :**
    *   🟡 *En attente :* Jaune Orangé `#FBBF24`
    *   🔴 *Litige/Urgent :* Rouge Écarlate `#DC2626`
    *   🔵 *Résolu :* Bleu Cobalt `#2563EB`

---

### 🔤 Typographie
*   **Police Globale :** **Montserrat**
*   **Titres Majeurs (H1, H2, H3) :** Graisse `700` (Bold) pour imposer une structure claire et moderne.
*   **Corps de texte & Descriptions :** Graisse `400` (Regular) pour assurer une lisibilité optimale sur tous les écrans.

---

### 📐 Grilles Responsives (Mobile-First)

L'intégration doit être pensée **Mobile-First** pour maximiser le confort d'utilisation sur smartphone :
1.  **Mobile (Viewport 393px) :** Structure sur 1 seule colonne pour les listes de produits.
2.  **Tablette (Viewport 1024px) :** Grille fluide sur 3 colonnes.
3.  **Desktop (Viewport 1728px) :** Conteneur principal centré de 1204px de large, structure en grille de 4 colonnes avec des espaces d'espacement (gap) de 44px.

---

## 📊 Diagnostics et Métriques

PlayAgain intègre des outils d'analyse et de diagnostic pour permettre aux développeurs d'inspecter l'intégrité des données, de valider les performances du moteur d'IA locale et d'optimiser l'expérience utilisateur globale.

### ⚡ Performance & Référencement (SEO)
*   **Rendu Hybride (SSR / ISR) :** Les pages de catalogue et les fiches produits sont générées côté serveur (Server-Side Rendering) ou mises à jour de manière incrémentale (Incremental Static Regeneration) pour garantir un chargement instantané pour les utilisateurs et une indexation parfaite par les robots d'indexation Google (SEO).
*   **Optimisation des Images :** Utilisation systématique du composant `next/image` de Next.js pour formater et compresser automatiquement les images de produits téléversées par les utilisateurs au format moderne WebP/AVIF.
*   **Core Web Vitals :** L'objectif de performance ciblé pour l'application sous Lighthouse est de maintenir un score supérieur à **90/100** pour les indicateurs clés (LCP, FID, CLS).

### 🗄️ Monitoring & Inspection de la Base de Données
Pour tester l'intégrité des relations Prisma, déboguer des enregistrements ou inspecter les logs d'activité, vous pouvez utiliser Prisma Studio, qui fournit une console d'administration visuelle complète pour MariaDB :
```bash
npx prisma studio
```
Cette commande ouvre une application web locale à l'adresse [http://localhost:5555](http://localhost:5555), vous permettant d'éditer, filtrer et ajouter des enregistrements en toute simplicité.

### 🧠 Diagnostic du Moteur d'IA Locale
Le moteur de correspondance sémantique IA s'exécute entièrement côté serveur Node.js sans nécessiter de connexions API tierces :
*   **Chargement initial :** Lors de la première requête de matching sémantique, la bibliothèque `@xenova/transformers` télécharge localement le modèle d'embeddings `all-MiniLM-L6-v2` et le met en cache dans le dossier `./.next/cache/transformers`.
*   **Performance sémantique :** Les calculs de similarité cosinus s'effectuent en mémoire. Pour optimiser les temps de réponse et éviter de recalculer les vecteurs à chaque affichage, les résultats de catégorisation de marque et gamme analysés sont stockés de manière permanente dans la table `BrandExpertise`.

---

## ⚖️ Mentions Légales et Sécurité

### 📜 Licence
Ce projet est distribué sous la licence **MIT**. Vous êtes libre de l'utiliser, de le modifier et de le distribuer dans le cadre de vos projets open source ou commerciaux, sous réserve de conserver la mention de copyright d'origine.

### 🛡️ Politique de Sécurité (Responsible Disclosure)
La sécurité de nos utilisateurs et des transactions financières est notre priorité absolue. Si vous découvrez une vulnérabilité de sécurité sur l'application (faille d'injection, fuite de données, contournement de paiement ou contournement du KYC biométrique), merci de nous le signaler de manière responsable en envoyant un email détaillé à : `charles.de-chabot@test.school`.
Nous vous demandons de ne pas divulguer publiquement la faille avant que nous ayons pu la corriger. (Cette adresse n'existe pas étant donnée que cette application est un exercice)

### 📋 Traçabilité et Conformité
Pour prévenir la fraude, le blanchiment d'argent et assurer la transparence de l'arbitrage administratif, l'application historique :
*   Toutes les adresses IP de connexion et les logs d'activité dans la table `UserActivityLog`.
*   Un journal d'audit immuable (`AdminLog`) listant chaque action effectuée par l'équipe d'administration (modération de produit, validation KYC, déblocage manuel de fonds).

---

## ✍️ Signature & Crédits

<p align="center">
  <b>Conçu avec passion dans le cadre d'un projet d'étude pour l'IDEM Perpignan, pour redonner vie à vos équipements et du souffle à la planète. 🌿</b>
</p>

<p align="center">
  Créé par <b>Charles de Chabot</b> — Retrouvez mes travaux et contributions sur mon profil GitHub :
</p>

<p align="center">
  <a href="https://github.com/Charles-de-Chabot" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-Charles--de--Chabot-7D38FF?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile" />
  </a>
</p>
