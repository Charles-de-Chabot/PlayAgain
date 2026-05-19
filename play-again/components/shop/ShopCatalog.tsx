"use client";

import { useState, useEffect, useTransition } from "react";
import { createPortal } from "react-dom";
import { 
  Search, SlidersHorizontal, Trash2, Truck, Sparkles, 
  Star, CheckCircle2, Shield, ChevronDown, X, RefreshCcw, 
  Bookmark, Zap, Award, Users, Info
} from "lucide-react";
import { ProductCard } from "@/components/home/ProductCard";
import { getFilteredProducts } from "@/app/actions/product";
import { useAuth } from "@/hooks/useAuth";
import { useVisibleCardsCount } from "@/hooks/useVisibleCardsCount";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  label: string;
}

interface ShopCatalogProps {
  initialProducts: any[];
  categories: Category[];
  brands: Brand[];
}

export function ShopCatalog({ initialProducts, categories, brands }: ShopCatalogProps) {
  const { isAuthenticated } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- ÉTATS DES FILTRES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<string>(isAuthenticated ? "match" : "recent");
  const [isShipping, setIsShipping] = useState(false);
  const [onlyRecommended, setOnlyRecommended] = useState(false);

  // --- AUTRES ÉTATS ---
  const activeCategoryIds = new Set(initialProducts.map(p => p.category_id));
  const activeCategories = categories.filter(cat => activeCategoryIds.has(cat.id));

  const visibleCardsPerRow = useVisibleCardsCount(3);
  const [products, setProducts] = useState(initialProducts);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- ÉTATS DES ACCORDÉONS MOBILE (COLLIDERS) ---
  const [isSportsOpen, setIsSportsOpen] = useState(false);
  const [isConditionsOpen, setIsConditionsOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [isGendersOpen, setIsGendersOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  // Synchroniser l'ouverture des accordéons avec les filtres déjà actifs à l'ouverture de la modal
  useEffect(() => {
    if (isMobileFilterOpen) {
      setIsSportsOpen(selectedCategory !== null);
      setIsConditionsOpen(selectedConditions.length > 0);
      setIsLevelsOpen(selectedLevels.length > 0);
      setIsGendersOpen(selectedGenders.length > 0);
      setIsBrandsOpen(selectedBrand !== null);
      setIsPriceOpen(minPrice !== "" || maxPrice !== "" || isShipping);
    }
  }, [isMobileFilterOpen]);

  // Synchroniser la pagination avec le nombre de cartes par ligne (ex: 4 lignes complètes d'articles)
  useEffect(() => {
    setVisibleCount(visibleCardsPerRow * 4);
  }, [visibleCardsPerRow]);

  // Gérer la classe modal-open sur le body pour masquer la navbar mobile et figer le défilement arrière-plan
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isMobileFilterOpen]);

  // --- APPLIQUER LES FILTRES ---
  const handleApplyFilters = () => {
    startTransition(async () => {
      try {
        const results = await getFilteredProducts({
          searchQuery: searchQuery || undefined,
          categoryId: selectedCategory || undefined,
          brandId: selectedBrand || undefined,
          conditions: selectedConditions.length > 0 ? selectedConditions : undefined,
          targetGenders: selectedGenders.length > 0 ? selectedGenders : undefined,
          sportLevels: selectedLevels.length > 0 ? selectedLevels : undefined,
          minPrice: minPrice !== "" ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
          sortBy,
          isShipping: isShipping || undefined,
          onlyRecommended: onlyRecommended || undefined,
        });
        setProducts(results);
        setVisibleCount(visibleCardsPerRow * 4); // Reset visible count on filter
      } catch (error) {
        console.error("Erreur de filtrage :", error);
      }
    });
  };

  // Déclencher le filtrage automatique sur changement des filtres (sauf recherche textuelle brute immédiate)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleApplyFilters();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [
    searchQuery, selectedCategory, selectedBrand, selectedConditions, 
    selectedGenders, selectedLevels, minPrice, maxPrice, sortBy, 
    isShipping, onlyRecommended
  ]);

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedConditions([]);
    setSelectedGenders([]);
    setSelectedLevels([]);
    setMinPrice("");
    setMaxPrice("");
    setSortBy(isAuthenticated ? "match" : "recent");
    setIsShipping(false);
    setOnlyRecommended(false);
  };

  // Toggle état dans un tableau
  const toggleSelection = (value: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter(item => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Gestionnaires UI pour les états
  const conditionLabels: Record<string, { label: string, color: string }> = {
    "NEUF": { label: "Neuf", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5" },
    "EXCELLENT": { label: "Excellent", color: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
    "BON": { label: "Bon", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
    "SATISFAISANT": { label: "Satisfaisant", color: "text-orange-400 border-orange-500/20 bg-orange-500/5" }
  };

  const levelLabels: Record<string, string> = {
    "BEGINNER": "Débutant",
    "INTERMEDIATE": "Intermédiaire",
    "ADVANCED": "Confirmé / Avancé",
    "PRO": "Professionnel / Expert"
  };

  const genderLabels: Record<string, string> = {
    "MAN": "Homme",
    "WOMAN": "Femme",
    "UNISEX": "Unisexe",
    "KIDS": "Enfant"
  };

  return (
    <div className="w-full max-w-8xl mx-auto px-4 md:px-16 py-6 text-white relative">
      {/* 1. EN-TÊTE DYNAMIQUE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
            Tous les <span className="text-brand-primary">articles</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/40 flex items-center gap-2">
            <span>Découvrez {products.length} {products.length > 1 ? "équipements de sport disponibles" : "équipement de sport disponible"}</span>
            {isPending && <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />}
          </p>
        </div>

        {/* Bouton Filtres Mobile */}
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-5 py-3 border border-white/20 bg-white/10 backdrop-blur-md text-[10px] font-black uppercase italic tracking-widest hover:border-brand-primary active:scale-95 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
          Filtres & Tri
        </button>
      </div>

      {/* 2. LAYOUT DE COLONNES */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* COLONNE FILTRES (DESKTOP) */}
        <aside className="hidden lg:flex flex-col gap-6 w-72 shrink-0 top-24 self-start">
          
          {/* Section: Tri */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Trier par
            </h3>
            <div className="flex flex-col gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setSortBy("match")}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border",
                    sortBy === "match" 
                      ? "bg-brand-primary/20 border-brand-primary text-white shadow-[0_0_15px_rgba(125,56,255,0.15)]" 
                      : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
                  )}
                >
                  Compatibilité Sportive
                </button>
              )}
              <button
                onClick={() => setSortBy("recent")}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border",
                  sortBy === "recent" 
                    ? "bg-brand-primary/20 border-brand-primary text-white" 
                    : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
                )}
              >
                Plus récents
              </button>
              <button
                onClick={() => setSortBy("price_asc")}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border",
                  sortBy === "price_asc" 
                    ? "bg-brand-primary/20 border-brand-primary text-white" 
                    : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
                )}
              >
                Prix : Croissant
              </button>
              <button
                onClick={() => setSortBy("price_desc")}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-xs font-bold uppercase italic tracking-wider transition-all border",
                  sortBy === "price_desc" 
                    ? "bg-brand-primary/20 border-brand-primary text-white" 
                    : "bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/20"
                )}
              >
                Prix : Décroissant
              </button>
            </div>
          </div>

          {/* Section: Barre de recherche textuelle */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl relative">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3 flex items-center justify-between">
              Recherche
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-[10px] text-brand-primary lowercase hover:underline">Effacer</button>
              )}
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Ski, vélo, chaussures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/50 placeholder:text-white/25 rounded-none"
              />
            </div>
          </div>

          {/* Section: AI Match Toggle */}
          {isAuthenticated && (
            <div className="bg-linear-to-br from-brand-primary/10 to-brand-accent/5 border border-brand-primary/20 rounded-[24px] p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent">PlayMatch</span>
                  </div>
                  <span className="text-[11px] font-medium text-white/80">Pour mon profil</span>
                </div>
                <button
                  onClick={() => setOnlyRecommended(!onlyRecommended)}
                  className={cn(
                    "w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer",
                    onlyRecommended ? "bg-brand-accent" : "bg-white/10"
                  )}
                >
                  <div 
                    className={cn(
                      "w-4 h-4 rounded-full bg-black transition-transform duration-300",
                      onlyRecommended ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
              <p className="text-[9px] text-white/50 mt-3 leading-relaxed flex items-start gap-1">
                <Info className="w-3 h-3 shrink-0 text-brand-accent mt-0.5" />
                Masque tous les articles qui ne matchent pas avec votre niveau sportif actuel.
              </p>
            </div>
          )}

          {/* Section: Sports / Catégories */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3 flex items-center justify-between">
              Sports
              {selectedCategory !== null && (
                <button onClick={() => setSelectedCategory(null)} className="text-[10px] text-brand-primary lowercase hover:underline">Tous</button>
              )}
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer italic",
                    selectedCategory === cat.id 
                      ? "bg-brand-primary border-brand-primary text-white" 
                      : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/25"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section: État du matériel */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">État</h3>
            <div className="flex flex-col gap-2.5">
              {Object.entries(conditionLabels).map(([key, value]) => {
                const isChecked = selectedConditions.includes(key);
                return (
                  <label 
                    key={key}
                    className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white"
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelection(key, selectedConditions, setSelectedConditions)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border flex items-center justify-center transition-all",
                      isChecked ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {isChecked && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <span className={cn("font-bold tracking-widest uppercase text-[10px]", value.color.split(" ")[0])}>
                      {value.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section: Niveau */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">Niveau requis</h3>
            <div className="flex flex-col gap-2.5">
              {Object.entries(levelLabels).map(([key, label]) => {
                const isChecked = selectedLevels.includes(key);
                return (
                  <label 
                    key={key}
                    className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white"
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelection(key, selectedLevels, setSelectedLevels)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border flex items-center justify-center transition-all",
                      isChecked ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {isChecked && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section: Prix */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">Prix (€)</h3>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/20 rounded-none text-center"
              />
              <span className="text-white/40 text-xs">à</span>
              <input 
                type="number" 
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-white/20 rounded-none text-center"
              />
            </div>
          </div>

          {/* Section: Marques */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3 flex items-center justify-between">
              Marques
              {selectedBrand !== null && (
                <button onClick={() => setSelectedBrand(null)} className="text-[10px] text-brand-primary lowercase hover:underline">Toutes</button>
              )}
            </h3>
            <div className="relative">
              <select
                value={selectedBrand || ""}
                onChange={(e) => setSelectedBrand(e.target.value === "" ? null : Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-brand-primary/50 cursor-pointer rounded-none appearance-none"
              >
                <option value="" className="bg-zinc-950 text-white">Toutes les marques</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} className="bg-zinc-950 text-white">
                    {b.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <ChevronDown className="h-3 w-3 text-white/40" />
              </div>
            </div>
          </div>

          {/* Section: Genre */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/80 mb-3">Genre</h3>
            <div className="flex flex-col gap-2.5">
              {Object.entries(genderLabels).map(([key, label]) => {
                const isChecked = selectedGenders.includes(key);
                return (
                  <label 
                    key={key}
                    className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white"
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelection(key, selectedGenders, setSelectedGenders)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "w-4 h-4 border flex items-center justify-center transition-all",
                      isChecked ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
                    )}>
                      {isChecked && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section: Livraison */}
          <div className="bg-white/5 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
            <label className="flex items-center gap-3 cursor-pointer group text-xs text-white/80 hover:text-white">
              <input 
                type="checkbox"
                checked={isShipping}
                onChange={() => setIsShipping(!isShipping)}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 border flex items-center justify-center transition-all",
                isShipping ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
              )}>
                {isShipping && <span className="text-[10px] font-black">✓</span>}
              </div>
              <Truck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest">Livraison possible</span>
            </label>
          </div>

          {/* Bouton de Réinitialisation complet */}
          <button
            onClick={handleResetFilters}
            className="w-full py-3.5 border-2 border-dashed border-white/10 hover:border-white/30 text-white/40 hover:text-white text-[10px] font-black uppercase italic tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none mt-2"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-brand-primary" />
            Réinitialiser filtres
          </button>
        </aside>

        {/* 3. GRILLE DE PRODUITS (DROITE) */}
        <main className="flex-1 w-full flex flex-col justify-between min-h-[500px]">
          
          {/* État de chargement global */}
          {isPending && products.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 py-32">
              <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-xs uppercase font-black italic tracking-widest text-zinc-500">Mise à jour du catalogue...</span>
            </div>
          ) : products.length > 0 ? (
            <div>
              {/* Grille responsive des cartes auto-gérée */}
              <div className="grid grid-cols-[repeat(auto-fill,160px)] md:grid-cols-[repeat(auto-fill,240px)] gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-10 justify-center w-full">
                {products.slice(0, visibleCount).map((product) => (
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    condition={product.state}
                    category={product.category?.label || "SPORT"}
                    image={product.media?.[0]?.url}
                    matchScore={product.matchScore > 0 ? product.matchScore : undefined}
                    fullProduct={product}
                  />
                ))}
              </div>

              {/* Bouton Voir Plus */}
              {products.length > visibleCount && (
                <div className="mt-16 text-center">
                  <button 
                    onClick={() => setVisibleCount(prev => prev + visibleCardsPerRow * 2)}
                    className="relative px-8 py-3.5 bg-zinc-950 text-white font-black uppercase italic tracking-widest text-[10px] border border-white/20 hover:border-brand-primary hover:bg-brand-primary/10 transition-all rounded-none cursor-pointer group"
                  >
                    <span className="relative z-10">Afficher plus d'articles</span>
                    <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-none pointer-events-none" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* État vide magnifique */
            <div className="flex flex-col items-center justify-center flex-1 py-20 px-4 text-center bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl max-w-2xl mx-auto w-full my-auto">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6">
                <Trash2 className="w-7 h-7 text-brand-primary" />
              </div>
              <h4 className="text-lg font-black uppercase italic tracking-tight mb-2">Aucun article trouvé</h4>
              <p className="text-xs text-white/50 max-w-sm leading-relaxed mb-8">
                Vos critères de filtrage sont très spécifiques. Essayez de réinitialiser vos options ou d'élargir vos recherches pour trouver le matériel idéal !
              </p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-brand-primary text-white font-black uppercase italic tracking-widest text-[10px] hover:bg-brand-primary/95 transition-all rounded-none cursor-pointer"
              >
                Réinitialiser les critères
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 4. MODAL / TIROIR FILTRES MOBILE (BOTTOM SHEET FLOATING) */}
      {mounted && typeof document !== "undefined" && isMobileFilterOpen ? createPortal(
        <div 
          style={{ zIndex: 9999 }}
          className="fixed inset-0 lg:hidden bg-zinc-950 flex flex-col animate-in fade-in duration-200"
        >
          <div className="relative z-10 bg-zinc-950 flex flex-col h-dvh w-full shadow-2xl animate-in slide-in-from-bottom duration-300 ease-out">
            
            {/* En-tête de la modal */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-black uppercase tracking-widest italic">Filtres de sport</span>
              </div>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenu défilant */}
            <ScrollArea className="p-6 flex flex-col gap-4 pb-6">
              
              {/* Carte 1 : Recherche & Tri */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] p-4 flex flex-col gap-4 shrink-0">
                {/* Recherche */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Recherche</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Ski, vélo, raquettes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-brand-primary/50 placeholder:text-white/25 rounded-none"
                    />
                  </div>
                </div>

                {/* Tri */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Trier par</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-brand-primary/50 cursor-pointer rounded-none appearance-none"
                    >
                      {isAuthenticated && <option value="match" className="bg-zinc-950 text-white">🎯 Compatibilité Sportive</option>}
                      <option value="recent" className="bg-zinc-950 text-white">✨ Plus récents</option>
                      <option value="price_asc" className="bg-zinc-950 text-white">📈 Prix : Croissant</option>
                      <option value="price_desc" className="bg-zinc-950 text-white">📉 Prix : Décroissant</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <ChevronDown className="h-3 w-3 text-white/40" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte 2 : PlayMatch IA (Si connecté) */}
              {isAuthenticated && (
                <div className="bg-linear-to-br from-brand-primary/15 to-brand-accent/5 border border-brand-primary/20 rounded-[20px] p-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-accent">PlayMatch IA</span>
                      </div>
                      <span className="text-[10px] font-semibold text-white/80">Pour mon profil sportif</span>
                    </div>
                    <button
                      onClick={() => setOnlyRecommended(!onlyRecommended)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer",
                        onlyRecommended ? "bg-brand-accent" : "bg-white/10"
                      )}
                    >
                      <div 
                        className={cn(
                          "w-4 h-4 rounded-full bg-black transition-transform duration-300",
                          onlyRecommended ? "translate-x-6" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                  <p className="text-[8.5px] text-white/40 mt-2.5 leading-relaxed flex items-start gap-1">
                    <Info className="w-3 h-3 shrink-0 text-brand-accent mt-0.5" />
                    Masque tous les articles inadaptés à vos caractéristiques ou votre niveau de sport.
                  </p>
                </div>
              )}

              {/* Accordéon 1 : Sports */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSportsOpen(!isSportsOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic font-montserrat">Sports</span>
                    {selectedCategory !== null && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-white/40 transition-transform duration-300 shrink-0",
                    isSportsOpen ? "rotate-180 text-brand-primary" : ""
                  )} />
                </button>
                {isSportsOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {activeCategories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                          className={cn(
                            "px-3 py-2.5 border text-[9px] font-black uppercase tracking-widest transition-all italic cursor-pointer",
                            selectedCategory === cat.id 
                              ? "bg-brand-primary border-brand-primary text-white" 
                              : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordéon 2 : État du matériel */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsConditionsOpen(!isConditionsOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic font-montserrat">État du matériel</span>
                    {selectedConditions.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[8px] font-black rounded-full bg-brand-primary text-white animate-pulse">
                        {selectedConditions.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-white/40 transition-transform duration-300 shrink-0",
                    isConditionsOpen ? "rotate-180 text-brand-primary" : ""
                  )} />
                </button>
                {isConditionsOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(conditionLabels).map(([key, value]) => {
                        const isChecked = selectedConditions.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => toggleSelection(key, selectedConditions, setSelectedConditions)}
                            className={cn(
                              "px-3 py-2.5 border text-[9px] font-black uppercase tracking-widest transition-all italic cursor-pointer",
                              isChecked ? "bg-brand-primary/20 border-brand-primary text-white" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                            )}
                          >
                            {value.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordéon 3 : Niveau requis */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLevelsOpen(!isLevelsOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic font-montserrat">Niveau requis</span>
                    {selectedLevels.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[8px] font-black rounded-full bg-brand-primary text-white animate-pulse">
                        {selectedLevels.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-white/40 transition-transform duration-300 shrink-0",
                    isLevelsOpen ? "rotate-180 text-brand-primary" : ""
                  )} />
                </button>
                {isLevelsOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(levelLabels).map(([key, label]) => {
                        const isChecked = selectedLevels.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => toggleSelection(key, selectedLevels, setSelectedLevels)}
                            className={cn(
                              "px-3 py-2.5 border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                              isChecked ? "bg-brand-primary/20 border-brand-primary text-white" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordéon 4 : Genre */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsGendersOpen(!isGendersOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic font-montserrat">Genre</span>
                    {selectedGenders.length > 0 && (
                      <span className="px-1.5 py-0.5 text-[8px] font-black rounded-full bg-brand-primary text-white animate-pulse">
                        {selectedGenders.length}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-white/40 transition-transform duration-300 shrink-0",
                    isGendersOpen ? "rotate-180 text-brand-primary" : ""
                  )} />
                </button>
                {isGendersOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(genderLabels).map(([key, label]) => {
                        const isChecked = selectedGenders.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => toggleSelection(key, selectedGenders, setSelectedGenders)}
                            className={cn(
                              "px-3 py-2.5 border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                              isChecked ? "bg-brand-primary/20 border-brand-primary text-white" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordéon 5 : Marque */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic font-montserrat">Marque</span>
                    {selectedBrand !== null && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-white/40 transition-transform duration-300 shrink-0",
                    isBrandsOpen ? "rotate-180 text-brand-primary" : ""
                  )} />
                </button>
                {isBrandsOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="relative mt-2">
                      <select
                        value={selectedBrand || ""}
                        onChange={(e) => setSelectedBrand(e.target.value === "" ? null : Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white/80 focus:outline-none appearance-none rounded-none cursor-pointer"
                      >
                        <option value="" className="bg-zinc-950 text-white">Toutes les marques</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id} className="bg-zinc-950 text-white">
                            {b.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <ChevronDown className="h-3 w-3 text-white/40" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordéon 6 : Prix & Options */}
              <div className="bg-white/5 border border-white/10 rounded-[20px] overflow-hidden transition-all duration-300 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-white/5 transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 italic font-montserrat">Prix & Options</span>
                    {(minPrice !== "" || maxPrice !== "" || isShipping) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                    )}
                  </div>
                  <ChevronDown className={cn(
                    "w-4 h-4 text-white/40 transition-transform duration-300 shrink-0",
                    isPriceOpen ? "rotate-180 text-brand-primary" : ""
                  )} />
                </button>
                {isPriceOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Tranche de prix */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Prix (€)</span>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/20 rounded-none text-center"
                        />
                        <span className="text-white/40 text-xs">à</span>
                        <input 
                          type="number" 
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/20 rounded-none text-center"
                        />
                      </div>
                    </div>

                    {/* Option de livraison */}
                    <div className="bg-white/5 border border-white/10 rounded-[15px] p-3">
                      <label className="flex items-center gap-3 cursor-pointer group text-xs text-white/80 hover:text-white">
                        <input 
                          type="checkbox"
                          checked={isShipping}
                          onChange={() => setIsShipping(!isShipping)}
                          className="sr-only"
                        />
                        <div className={cn(
                          "w-4 h-4 border flex items-center justify-center transition-all",
                          isShipping ? "border-brand-primary bg-brand-primary text-black" : "border-white/20 group-hover:border-white/40"
                        )}>
                          {isShipping && <span className="text-[10px] font-black">✓</span>}
                        </div>
                        <Truck className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Livraison possible</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

            </ScrollArea>

            {/* Actions persistantes figées (Sticky Footer Actions) */}
            <div className="p-5 bg-zinc-950 border-t border-white/10 grid grid-cols-2 gap-4 shrink-0 z-20 pb-8 rounded-b-none shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              <button
                onClick={handleResetFilters}
                className="w-full py-3.5 border border-white/25 text-white/60 hover:text-white active:scale-95 transition-all text-[9px] font-black uppercase italic tracking-widest cursor-pointer hover:border-white/40"
              >
                Réinitialiser ({
                  (searchQuery ? 1 : 0) + 
                  (selectedCategory ? 1 : 0) + 
                  (selectedBrand ? 1 : 0) + 
                  selectedConditions.length + 
                  selectedLevels.length + 
                  selectedGenders.length + 
                  (minPrice !== "" || maxPrice !== "" ? 1 : 0) + 
                  (isShipping ? 1 : 0) + 
                  (onlyRecommended ? 1 : 0)
                })
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3.5 bg-brand-primary text-white active:scale-95 transition-all text-[9px] font-black uppercase italic tracking-widest cursor-pointer shadow-[0_0_20px_rgba(125,56,255,0.3)] hover:bg-brand-primary/90"
              >
                Voir les articles ({products.length})
              </button>
            </div>

          </div>
        </div>,
        document.body
      ) : null}
    </div>
  );
}
