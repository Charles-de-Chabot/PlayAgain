"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { useAdminCatalog } from "@/hooks/useAdminCatalog";
import CatalogFilters from "./components/CatalogFilters";
import ProductAdminCard from "./components/ProductAdminCard";
import ProductDetailDrawer from "./components/modals/ProductDetailDrawer";
import SellerDetailDrawer from "./components/modals/SellerDetailDrawer";
import ImageLightbox from "./components/modals/ImageLightbox";

export default function CatalogAdminPage() {
  const {
    products,
    loading,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    filterBrand,
    setFilterBrand,
    filterStatus,
    setFilterStatus,
    filterState,
    setFilterState,
    sortBy,
    setSortBy,
    activeDropdown,
    setActiveDropdown,
    selectedProduct,
    setSelectedProduct,
    isDrawerOpen,
    setIsDrawerOpen,
    selectedSeller,
    isSellerDrawerOpen,
    setIsSellerDrawerOpen,
    sellerLoading,
    selectedImage,
    setSelectedImage,
    actionLoadingId,
    categories,
    brands,
    handleViewSeller,
    handleToggleProductActive,
    handleSuspendSeller,
    handleReactivateSeller,
  } = useAdminCatalog();

  return (
    <div className="flex-1 flex flex-col space-y-8 relative">
      {/* En-tête de la page */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white text-left">
          Modération du Catalogue
        </h1>
        <p className="text-slate-400 text-sm mt-1 text-left">
          Examinez les articles de sport mis en vente. Suspendre les fiches contrefaites ou non conformes.
        </p>
      </div>

      {/* Barre de Recherche & Filtres Premium */}
      <CatalogFilters
        search={search}
        setSearch={setSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        brands={brands}
        filterBrand={filterBrand}
        setFilterBrand={setFilterBrand}
        filterState={filterState}
        setFilterState={setFilterState}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        activeDropdown={activeDropdown}
        setActiveDropdown={setActiveDropdown}
      />

      {/* Galerie de cartes de modération */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Analyse du catalogue en cours...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 gap-3 bg-white/[0.01] border border-white/[0.04] rounded-3xl">
          <AlertCircle className="w-8 h-8 text-slate-500" />
          <span className="text-xs text-slate-500 font-bold">Aucune annonce trouvée dans le catalogue.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductAdminCard
              key={product.id}
              product={product}
              onClick={() => {
                setSelectedProduct(product);
                setIsDrawerOpen(true);
                setIsSellerDrawerOpen(false);
              }}
              onZoomImage={(url) => setSelectedImage(url)}
              onToggleProductActive={handleToggleProductActive}
              actionLoadingId={actionLoadingId}
            />
          ))}
        </div>
      )}

      {/* MODAL DE ZOOM IMAGE (LIGHTBOX OVERLAY) */}
      <ImageLightbox selectedImage={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* TIROIR LATÉRAL DÉROULANT (MODAL DRAWER) */}
      <ProductDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setIsSellerDrawerOpen(false);
        }}
        product={selectedProduct}
        onZoomImage={(url) => setSelectedImage(url)}
        onViewSeller={handleViewSeller}
        onToggleProductActive={handleToggleProductActive}
        actionLoadingId={actionLoadingId}
        setSelectedProduct={setSelectedProduct}
      />

      {/* TIROIR DU VENDEUR */}
      <SellerDetailDrawer
        isOpen={isSellerDrawerOpen}
        onClose={() => setIsSellerDrawerOpen(false)}
        sellerLoading={sellerLoading}
        selectedSeller={selectedSeller}
        actionLoadingId={actionLoadingId}
        onSuspendSeller={handleSuspendSeller}
        onReactivateSeller={handleReactivateSeller}
      />
    </div>
  );
}
