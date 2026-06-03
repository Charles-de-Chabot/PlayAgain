"use client";

import React from "react";
import UserAddedBrandsList from "./UserAddedBrandsList";
import BrandMergeTool from "./BrandMergeTool";
import BrandsGrid from "./BrandsGrid";
import { Brand } from "@/hooks/useTaxonomy";

export interface BrandsTabProps {
  userAddedBrands: Brand[];
  setMergeSourceId: (id: string) => void;
  setMergeSearchSource: (label: string) => void;
  setMergeTargetId: (id: string) => void;
  setMergeSearchTarget: (label: string) => void;
  handleValidateUserBrand: (brand: Brand) => void;
  actionLoading: boolean;
  mergeSourceId: string;
  mergeTargetId: string;
  mergeSearchSource: string;
  mergeSearchTarget: string;
  mergeSourceSuggestions: Brand[];
  mergeTargetSuggestions: Brand[];
  handleMergeBrands: (e?: React.FormEvent) => void;
  brandSearch: string;
  setBrandSearch: (s: string) => void;
  filteredBrands: Brand[];
  onSelectSource: (brand: Brand) => void;
  onSelectTarget: (brand: Brand) => void;
}

/**
 * BrandsTab coordinates components related to brand list management, validation, and merges.
 */
export default function BrandsTab({
  userAddedBrands,
  setMergeSourceId,
  setMergeSearchSource,
  setMergeTargetId,
  setMergeSearchTarget,
  handleValidateUserBrand,
  actionLoading,
  mergeSourceId,
  mergeTargetId,
  mergeSearchSource,
  mergeSearchTarget,
  mergeSourceSuggestions,
  mergeTargetSuggestions,
  handleMergeBrands,
  brandSearch,
  setBrandSearch,
  filteredBrands,
  onSelectSource,
  onSelectTarget,
}: BrandsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Outil de Fusion & Suggestions IA (2/5) */}
      <div className="lg:col-span-2 space-y-6">
        {/* Marques ajoutées par les utilisateurs */}
        <UserAddedBrandsList
          userAddedBrands={userAddedBrands}
          setMergeSourceId={setMergeSourceId}
          setMergeSearchSource={setMergeSearchSource}
          handleValidateUserBrand={handleValidateUserBrand}
          actionLoading={actionLoading}
        />

        {/* Formulaire de fusion */}
        <BrandMergeTool
          mergeSourceId={mergeSourceId}
          setMergeSourceId={setMergeSourceId}
          mergeTargetId={mergeTargetId}
          setMergeTargetId={setMergeTargetId}
          mergeSearchSource={mergeSearchSource}
          setMergeSearchSource={setMergeSearchSource}
          mergeSearchTarget={mergeSearchTarget}
          setMergeSearchTarget={setMergeSearchTarget}
          mergeSourceSuggestions={mergeSourceSuggestions}
          mergeTargetSuggestions={mergeTargetSuggestions}
          actionLoading={actionLoading}
          onSubmit={handleMergeBrands}
        />
      </div>

      {/* Liste de toutes les marques en base (3/5) */}
      <div className="lg:col-span-3 space-y-6">
        <BrandsGrid
          brandSearch={brandSearch}
          setBrandSearch={setBrandSearch}
          filteredBrands={filteredBrands}
          onSelectSource={onSelectSource}
          onSelectTarget={onSelectTarget}
        />
      </div>
    </div>
  );
}
