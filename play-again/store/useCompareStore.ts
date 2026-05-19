import { create } from 'zustand';

// Définition d'un produit pour la comparaison
// On inclut les champs nécessaires à l'affichage de la modale
export interface CompareProduct {
  id: number;
  title: string;
  price: number;
  categoryId: number;
  typeId: number;
  categoryLabel: string;
  typeLabel: string;
  condition: string;
  image: string;
  brand: string;
  age?: number | null;
  accessory_included: boolean;
  is_shipping: boolean;
  matchScore?: number | null;
  levelCategory?: string | null;
  dealScore?: any;
}

interface CompareState {
  productA: CompareProduct | null;
  productB: CompareProduct | null;
  isComparingMode: boolean; // True quand on attend la sélection du produit B depuis le catalogue
  
  // Actions
  setProductA: (product: CompareProduct) => void;
  setProductB: (product: CompareProduct) => void;
  setComparingMode: (mode: boolean) => void;
  clearComparison: () => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  productA: null,
  productB: null,
  isComparingMode: false,

  setProductA: (product) => set({ productA: product, isComparingMode: true }),
  
  setProductB: (product) => set((state) => {
    // Vérification de sécurité métier : même catégorie ET même type
    if (state.productA) {
      if (state.productA.categoryId !== product.categoryId || state.productA.typeId !== product.typeId) {
        console.error("Impossible de comparer des produits de catégories ou types différents.");
        return state; // On ne met pas à jour l'état
      }
    }
    return { productB: product, isComparingMode: false };
  }),

  setComparingMode: (mode) => set({ isComparingMode: mode }),

  clearComparison: () => set({ productA: null, productB: null, isComparingMode: false }),
}));
