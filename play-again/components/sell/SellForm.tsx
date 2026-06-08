"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createProduct, updateProduct } from "@/app/actions/product";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, AlertCircle, Tag } from "lucide-react";
import SellPhotoUploader from "./components/SellPhotoUploader";
import SellGeneralDetails from "./components/SellGeneralDetails";
import SellTechnicalDetails from "./components/SellTechnicalDetails";
import SellShippingAndCondition from "./components/SellShippingAndCondition";

interface SellFormProps {
  categories: any[];
  brands: any[];
  types: (any & { sizes: any[] })[];
  userCity: string | null;
  initialProduct?: any;
}

export function SellForm({ categories, brands, types, userCity, initialProduct }: SellFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: initialProduct?.title || "",
    description: initialProduct?.description || "",
    category_id: initialProduct?.category_id?.toString() || "",
    type_id: initialProduct?.type_id?.toString() || "",
    brand_id: initialProduct?.brand_id?.toString() || "",
    state: initialProduct?.state || "EXCELLENT",
    size_id: initialProduct?.size_id?.toString() || "",
    price: initialProduct?.price?.toString() || "",
    quantity: initialProduct?.stock_quantity?.toString() || "1",
    age: initialProduct?.age?.toString() || "",
    accessory_included: initialProduct?.accessory_included || false,
    is_shipping_available: initialProduct?.is_shipping ?? true,
    targetGender: initialProduct?.targetGender || "UNISEX",
  });

  const [photoItems, setPhotoItems] = useState<{ id?: number; url: string; file?: File }[]>(() => {
    if (initialProduct?.media) {
      return initialProduct.media.map((m: any) => ({
        id: m.id,
        url: m.url,
      }));
    }
    return [];
  });

  const handleChangeField = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCategory = (id: string) => {
    setFormData((prev) => ({ ...prev, category_id: id, type_id: "", size_id: "" }));
  };

  const handleSelectType = (id: string) => {
    const selectedType = types.find((t) => t.id.toString() === id);
    if (selectedType) {
      setFormData((prev) => ({
        ...prev,
        type_id: id,
        category_id: selectedType.category_id.toString(),
        size_id: "", // clear size on type change
      }));
    } else {
      setFormData((prev) => ({ ...prev, type_id: id, size_id: "" }));
    }
  };

  const handleQuantityChange = (delta: number) => {
    setFormData((prev) => ({ ...prev, quantity: Math.max(1, parseInt(prev.quantity) + delta).toString() }));
  };

  const handleChangeQuantityDirect = (val: string) => {
    setFormData((prev) => ({ ...prev, quantity: val }));
  };

  const handleToggleAccessory = () => {
    setFormData((prev) => ({ ...prev, accessory_included: !prev.accessory_included }));
  };

  const handleToggleShipping = () => {
    setFormData((prev) => ({ ...prev, is_shipping_available: !prev.is_shipping_available }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photoItems.length === 0) {
      alert("Veuillez ajouter au moins une image");
      return;
    }

    const submissionData = new FormData();
    submissionData.append("title", formData.title);
    submissionData.append("description", formData.description);
    submissionData.append("category_id", formData.category_id);
    submissionData.append("type_id", formData.type_id);
    submissionData.append("brand_id", formData.brand_id);
    submissionData.append("state", formData.state);
    submissionData.append("size_id", formData.size_id);
    submissionData.append("price", formData.price);
    submissionData.append("quantity", formData.quantity);
    submissionData.append("age", formData.age);
    submissionData.append("accessory_included", formData.accessory_included.toString());
    submissionData.append("is_shipping", formData.is_shipping_available.toString());
    submissionData.append("targetGender", formData.targetGender);

    photoItems.forEach((item) => {
      if (item.file) {
        submissionData.append("images", item.file);
      } else {
        submissionData.append("keep_images", item.url);
      }
    });

    startTransition(async () => {
      try {
        let result;
        if (initialProduct) {
          result = await updateProduct(initialProduct.id, submissionData);
        } else {
          result = await createProduct(submissionData);
        }

        if (result?.success) {
          if (initialProduct) {
            router.push(`/product/${initialProduct.id}`);
          } else {
            router.push("/profile");
          }
          router.refresh();
        }
      } catch (error) {
        console.error("Erreur lors de la modification/création du produit:", error);
        alert("Une erreur est survenue lors de la publication ou modification de l'annonce.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* SECTION 1 : PHOTOS */}
      <SellPhotoUploader
        photoItems={photoItems}
        setPhotoItems={setPhotoItems}
      />

      {/* SECTION 2 : L'ESSENTIEL (TITRE, DESCRIPTION, PUBLIC) */}
      <SellGeneralDetails
        title={formData.title}
        targetGender={formData.targetGender}
        description={formData.description}
        onChangeField={(name, val) => handleChangeField(name, val)}
      />

      {/* SECTION 3 : DETIALS TECHNIQUES (CATEGORIES, TYPES, MARQUES, TAILLES, QUANTITES) */}
      <SellTechnicalDetails
        categories={categories}
        brands={brands}
        types={types}
        categoryId={formData.category_id}
        typeId={formData.type_id}
        brandId={formData.brand_id}
        sizeId={formData.size_id}
        quantity={formData.quantity}
        onSelectCategory={handleSelectCategory}
        onSelectType={handleSelectType}
        onSelectBrand={(id) => handleChangeField("brand_id", id)}
        onSelectSize={(id) => handleChangeField("size_id", id)}
        onQuantityChange={handleQuantityChange}
        onChangeQuantityDirect={handleChangeQuantityDirect}
      />

      {/* SECTION 4 : ETAT & LOGISTIQUE */}
      <SellShippingAndCondition
        userCity={userCity}
        state={formData.state}
        onSelectState={(val) => handleChangeField("state", val)}
        age={formData.age}
        onChangeAge={(val) => handleChangeField("age", val)}
        accessoryIncluded={formData.accessory_included}
        onToggleAccessory={handleToggleAccessory}
        isShippingAvailable={formData.is_shipping_available}
        onToggleShipping={handleToggleShipping}
      />

      {/* SECTION 5 : PRIX */}
      <section className="relative z-10 bg-zinc-900/60 backdrop-blur-3xl border-2 border-white/10 rounded-none p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.8)] text-left">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-brand-primary/10 rounded-none flex items-center justify-center text-brand-primary">
            <Tag className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">Prix de vente</h2>
        </div>

        <div className="max-w-xs relative">
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={(e) => handleChangeField("price", e.target.value)}
            placeholder="0.00"
            className="w-full bg-zinc-950/50 border border-white/10 p-6 rounded-none text-3xl font-black text-white focus:outline-none focus:border-brand-accent transition-all placeholder:text-zinc-800"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-700 italic">
            €
          </span>
        </div>
        <p className="mt-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Le prix de vente conseillé se situe généralement à 50% du prix neuf.
        </p>
      </section>

      {/* SUBMIT BUTTON */}
      <div className="pt-8">
        <Button
          type="submit"
          variant="secondary"
          size="full"
          disabled={isPending}
          className="h-20 text-xl font-black italic tracking-tighter uppercase shadow-[0_20px_50px_rgba(198,255,52,0.2)] hover:shadow-brand-accent/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending
            ? initialProduct
              ? "Modification en cours..."
              : "Publication en cours..."
            : initialProduct
            ? "Enregistrer les modifications"
            : "Publier l'annonce"}
          <ChevronRight className="ml-2 w-6 h-6" />
        </Button>
      </div>
    </form>
  );
}
