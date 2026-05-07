# Compte Rendu d'Analyse des Maquettes Figma - Play Again

Ce document regroupe les informations de design (couleurs, typographie, espacements, grid) extraites des maquettes Figma pour faciliter l'intégration responsive sur les différentes vues (Mobile, Tablette, Desktop).

> [!IMPORTANT]
> **Approche Mobile-First**
> Conformément à la stratégie du projet, le développement sera réalisé en **Mobile-First**. Cela signifie que l'interface sera d'abord codée pour la vue Téléphone (qui sera la vue par défaut, sans media queries). Ensuite, des règles responsives (via les breakpoints Tailwind comme `md:`, `lg:`, `xl:`) seront ajoutées pour adapter le design à la Tablette puis au Desktop. Cela garantit un code plus propre, de meilleures performances sur mobile, et évite les mauvaises surprises lors de l'adaptation aux grands écrans.

## 🎨 Styles Globaux (Design System)

### Couleurs de la marque
- **Violet (Primaire / Catégories / Tags) :** `#7D38FF`
- **Vert Citron (Accents / Bordures / Badges "Bon état") :** `#C6FF34`
- **Noir (Fonds Hero / Texte principal) :** `#000000`
- **Blanc (Fonds principal / Texte sur fond sombre) :** `#FFFFFF`

### Typographie
- **Police principale :** **Montserrat**
- **Graisses utilisées :**
  - Bold (700) : Utilisé pour les titres de sections.
  - Regular (400) : Utilisé pour le texte de corps et les descriptions.
- **Tailles de Titres :**
  - Mobile : `20px`
  - Desktop : `32px`

---

## 📱 Vue Mobile (Base : 393px - Vue par défaut)

### Structure & Layout
- **Marges de sécurité (Paddings latéraux) :** Environ `15px - 20px`.
- **Header :**
  - Arrière-plan : Blanc (`#FFFFFF`).
  - Logo "PLAY AGAIN" : Centré, avec une largeur proportionnellement importante (`216px`).
- **Section Hero (Header Sombre) :**
  - Arrière-plan : Noir (`#000000`).
  - Organisation entièrement verticale en colonne : Logo > Barre de recherche > Catégories.
  - Les catégories s'empilent ou utilisent un défilement horizontal (`overflow-x: auto`).
- **Grille de Produits (Articles Populaires) :**
  - **Colonnes :** **1 seule colonne** (`1fr`).
  - Les cartes s'empilent verticalement.
  - La taille de police des titres de section ("ARTICLES POPULAIRES") est de `20px` Bold.

---

## 📑 Vue Tablette (Base : 1024px - Breakpoint `md:` ou `lg:`)

### Structure & Layout (Modifications par rapport au Mobile)
- **Header :**
  - Le logo est déplacé vers la **gauche**.
  - Apparition d'icônes de navigation (Home, Profile) sur la **droite**.
- **Section Hero :**
  - Les boutons de catégories passent en une **grille de 2x2** pour optimiser l'espace vertical.
- **Grille de Produits :**
  - **Colonnes :** Passage à **3 colonnes** (`grid-cols-3`).
  - Les cartes produits s'adaptent en largeur (`1fr`) pour s'ajuster à la largeur de l'écran.
- **Footer / Navigation :**
  - Apparition d'une **Tab Bar** (barre de navigation basse) de couleur noire, fixée en bas, contenant des icônes (Cœur, Plus, Message).

---

## 🖥️ Vue Desktop (Base : 1728px - Breakpoint `xl:` ou `2xl:`)

### Structure & Layout (Modifications par rapport à la Tablette)
- **Conteneur Principal :**
  - Largeur maximale (max-width) : `~1204px`.
  - Centré avec des marges latérales automatiques (environ `262px` de chaque côté).
- **Header :**
  - Le logo "PLAY AGAIN" redevient **centré horizontalement** (Dimensions : `140x78px`).
- **Section Hero :**
  - Hauteur fixe : `322px`.
  - **Barre de recherche :** Dimensions `663x79px`, alignée au centre.
  - **Boutons Catégories (ex: SKI) :** Alignés sur une seule ligne (Flex-row) sous la barre de recherche. Dimensions fixes : `163x39px`.
- **Grille de Produits :**
  - **Colonnes :** Passage à **4 colonnes** (`grid-cols-4`).
  - **Gap (Espacement) :** `44px` entre chaque carte.
  - **Cartes :** Largeur fixe de `268px` avec une bordure Vert Citron (`#C6FF34`).

---

## 🛠️ Recommandations pour l'Intégration (CSS / Tailwind Mobile-First)

1. **Variables / Thème :** Configurez les couleurs `#7D38FF` et `#C6FF34` dans votre fichier de configuration (ex: `tailwind.config.ts`).
2. **Container :** Créez des classes de base pour mobile (`w-full px-4`), puis ajoutez les contraintes pour desktop (`xl:max-w-[1204px] xl:mx-auto xl:px-0`).
3. **Responsive Grid :** Définissez d'abord la grille mobile (1 colonne), puis modifiez-la aux breakpoints supérieurs : `grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-11`.
4. **Header Dynamique :** Implémentez un layout centré par défaut (Mobile), puis modifiez son comportement avec Flexbox ou Grid pour aligner les éléments à gauche/droite sur Tablette, et recentrer le logo sur Desktop.
5. **Composants d'Action :** Conservez le contraste élevé (Vert Citron sur Fond Noir) pour garantir l'accessibilité visuelle des boutons secondaires et bordures sur toutes les vues.
