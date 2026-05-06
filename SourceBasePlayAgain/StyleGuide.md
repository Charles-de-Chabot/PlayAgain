# Charte Graphique & Technique - Play Again

Ce document sert de référence technique pour l'intégration front-end du projet React/Tailwind CSS. Il est basé sur l'extraction des données "Inspect" de la maquette Figma.

## 🎨 Couleurs (Colors)

| Nom de la variable | Valeur Hexadécimale | Usage Principal |
| :--- | :--- | :--- |
| `primary-violet` | `#9747FF` | Boutons d'actions principaux (ex: catégories SKI, VELO), éléments de navigation. |
| `primary-lime` | `#CFFF5E` | Boutons secondaires (ex: VOIR), tags d'état, éléments de mise en avant. |
| `danger-red` | `#FF4B4B` | Actions critiques, boutons à fort impact (ex: FAIRE UN DON). |
| `black` | `#000000` | Fonds de page principaux, texte à fort contraste. |
| `white` | `#FFFFFF` | Texte principal sur fond noir, icônes, fonds de cartes/boutons. |

> **⚠️ Recommandations d'Accessibilité (WCAG 2.1)**
> - **Texte Blanc sur Violet (`#FFFFFF` sur `#9747FF`)** : Le ratio de contraste est d'environ **2.9:1**. Cela **échoue** aux critères WCAG AA pour le texte normal (qui requiert 4.5:1). *Suggestion : Utiliser un texte noir (`#000000`) sur les boutons violets, ou assombrir la teinte violette pour les éléments interactifs contenant du texte blanc.*
> - **Texte Noir sur Lime (`#000000` sur `#CFFF5E`)** : Excellent ratio de contraste (environ **16.5:1**). Validé WCAG AAA.
> - **Texte Blanc sur Noir (`#FFFFFF` sur `#000000`)** : Ratio maximal (**21:1**). Parfaitement accessible.

## 🔡 Typographie (Typography)

La police principale du projet est **Inter** (Google Fonts).

| Élément | Graisse (Weight) | Casse | Usage |
| :--- | :--- | :--- | :--- |
| **Titres de Section** | Bold (700) | Majuscules (UPPERCASE) | Headers principaux (ex: "ARTICLES POPULAIRES") |
| **Boutons** | Medium (500) | Majuscules (UPPERCASE) | Labels interactifs |
| **Corps de Texte** | Regular (400)| Normale | Descriptions, prix, textes courants |

## 📐 Espacements & Tailles (Spacings & Layout)

- **Border Radius (Arrondis)** : `5px` appliqué globalement sur les cartes, les boutons et les champs de saisie.
- **Hauteurs de Boutons** :
  - *Small* (`h-btn-sm` / `32px`) : Boutons de catégories.
  - *Large* (`h-btn-lg` / `49px`) : Boutons d'actions principaux (Formulaires, validation).
- **Gouttières (Gap)** : `16px` entre les cartes produits dans les grilles (`gap-card`).

## 📁 Guide d'Assets & Structure de Dossiers

### Stratégie d'export depuis Figma
- **Icônes (UI, navigation, pictos)** : À exporter en **SVG**. Les SVG permettent une manipulation via CSS (ex: `fill-current` avec Tailwind pour adapter la couleur au texte) et assurent une netteté parfaite.
- **Images photographiques (Bannières, Produits)** : À exporter en **WebP** avec un fallback JPG si nécessaire. Le format WebP garantit des performances optimales (temps de chargement réduit).
- **Illustrations vectorielles complexes** : À exporter en **SVG** optimisé (passé par SVGO).

### Structure recommandée pour `/public` ou `/src/assets`

```text
/public
  /assets
    /icons            # Fichiers .svg (ex: icon-search.svg, icon-cart.svg)
    /images
      /products       # Fichiers .webp (Photos des articles)
      /banners        # Fichiers .webp (Bannières hero)
    /logos            # Logo du site (play-again-logo.svg)
```
