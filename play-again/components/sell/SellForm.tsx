"use client";

import { useState, useRef } from "react";
import { 
  Camera, 
  ChevronRight, 
  Package, 
  Tag, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Autocomplete } from "@/components/ui/Autocomplete";

interface SellFormProps {
  categories: (any & { sizes: any[] })[];
  brands: any[];
  types: any[];
  userCity: string | null;
}

export function SellForm({ categories, brands, types, userCity }: SellFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    type_id: "",
    brand_id: "",
    state: "EXCELLENT",
    size_id: "",
    price: "",
    quantity: "1",
    age: "",
    accessory_included: false,
    is_shipping_available: true,
  });

  // Filtrage dynamique des types en fonction de la catégorie sélectionnée
  const filteredTypes = formData.category_id 
    ? types.filter(t => t.category_id === parseInt(formData.category_id))
    : types;

  // Filtrage dynamique des tailles en fonction de la catégorie sélectionnée
  const filteredSizes = formData.category_id
    ? categories.find(c => c.id.toString() === formData.category_id)?.sizes || []
    : [];

  const states = [
    { value: "NEUF", label: "Neuf avec étiquette" },
    { value: "EXCELLENT", label: "Très bon état" },
    { value: "BON", label: "Bon état" },
    { value: "SATISFAISANT", label: "Satisfaisant" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleAccessory = () => {
    setFormData(prev => ({ ...prev, accessory_included: !prev.accessory_included }));
  };

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addImages(newFiles);
      // Réinitialisation de la valeur pour permettre de remettre le même fichier après suppression
      e.target.value = "";
    }
  };

  const addImages = (files: File[]) => {
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      addImages(newFiles);
    }
  };

  return (
    <form className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* SECTION 1 : PHOTOS */}
      <section 
        className="relative z-40 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-none p-6 md:p-8"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 bg-brand-primary/10 rounded-none flex items-center justify-center text-brand-primary">
            <Camera className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">Photos du produit</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Input File Caché */}
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 group cursor-pointer hover:border-brand-accent/50 hover:bg-brand-accent/5 transition-all"
          >
            <Plus className="w-8 h-8 text-zinc-700 group-hover:text-brand-accent transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-brand-accent">Ajouter</span>
          </div>

          {/* Affichage des Previews */}
          {previews.map((preview, index) => (
            <div key={index} className="aspect-square bg-zinc-950 border border-white/10 overflow-hidden relative group">
              <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  type="button"
                  onClick={() => {
                    setPreviews(prev => prev.filter((_, i) => i !== index));
                    setImages(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          {/* Placeholders si moins de 4 photos */}
          {Array.from({ length: Math.max(0, 3 - previews.length) }).map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-950/30 border border-white/5 border-dashed" />
          ))}
        </div>
        <p className="mt-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic">
          Ajoutez au moins 1 photo claire de votre article
        </p>
      </section>

      {/* SECTION 2 : L'ESSENTIEL */}
      <section className="relative z-30 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-none p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-10 bg-brand-primary/10 rounded-none flex items-center justify-center text-brand-primary">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tight">Détails de l'article</h2>
        </div>

        <div className="space-y-8">
          {/* Titre - Pleine largeur */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">Titre de l'annonce</label>
            <input 
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Paire de Skis Rossignol Hero 2023..."
              className="w-full bg-zinc-950/50 border border-white/10 p-5 rounded-none text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all font-bold placeholder:text-zinc-700 placeholder:italic text-lg"
            />
          </div>

          {/* Catégorie / Type / Marque - Grid 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Autocomplete 
              label="Catégorie"
              placeholder="Ex: Sports d'hiver"
              items={categories}
              selectedId={formData.category_id}
              onSelect={(id) => setFormData(prev => ({ ...prev, category_id: id, type_id: "", size_id: "" }))}
            />
            <Autocomplete 
              label="Type"
              placeholder={formData.category_id ? "Ex: Skis Alpins" : "Choisissez une catégorie"}
              items={filteredTypes}
              selectedId={formData.type_id}
              onSelect={(id) => {
                const selectedType = types.find(t => t.id.toString() === id);
                if (selectedType) {
                  setFormData(prev => ({ 
                    ...prev, 
                    type_id: id,
                    category_id: selectedType.category_id.toString() 
                  }));
                }
              }}
            />
            <Autocomplete 
              label="Marque"
              placeholder="Ex: Rossignol"
              items={brands}
              selectedId={formData.brand_id}
              onSelect={(id) => setFormData(prev => ({ ...prev, brand_id: id }))}
            />
          </div>

          {/* Taille & Quantité - Grid 2 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Autocomplete 
              label="Taille"
              placeholder={formData.category_id ? "Ex: 42, L, 170cm..." : "Choisissez une catégorie"}
              items={filteredSizes}
              selectedId={formData.size_id}
              onSelect={(id) => setFormData(prev => ({ ...prev, size_id: id }))}
            />
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">Quantité disponible</label>
              <div className="flex bg-zinc-950/50 border border-white/10">
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(prev.quantity) - 1).toString() }))}
                  className="px-6 py-4 hover:bg-white/5 transition-colors text-zinc-500 hover:text-white font-bold cursor-pointer"
                >
                  -
                </button>
                <input 
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full bg-transparent text-center focus:outline-none font-black text-brand-accent"
                />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, quantity: (parseInt(prev.quantity) + 1).toString() }))}
                  className="px-6 py-4 hover:bg-white/5 transition-colors text-zinc-500 hover:text-white font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Description - Pleine largeur */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2 italic">Description détaillée</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez les caractéristiques techniques, l'état d'usure, ou toute information utile pour l'acheteur..."
              className="w-full bg-zinc-950/50 border border-white/10 p-5 rounded-none text-white focus:outline-none focus:border-brand-primary transition-all font-medium placeholder:text-zinc-700 placeholder:italic resize-none min-h-[120px]"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 : ÉTAT & EXPÉDITION */}
      <section className="relative z-20 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-none p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-primary/10 rounded-none flex items-center justify-center text-brand-primary">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black uppercase italic tracking-tight">État & Logistique</h2>
          </div>
          
          {userCity && (
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-950/80 border border-white/5 backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-500">Expédition depuis : <span className="text-white italic">{userCity}</span></span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* État de l'article - Barre pleine largeur */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 italic">État général de l'article</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {states.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, state: s.value }))}
                  className={cn(
                    "p-5 border text-[10px] font-black uppercase tracking-widest transition-all text-center flex flex-col items-center gap-2 group cursor-pointer relative overflow-hidden",
                    formData.state === s.value 
                      ? "bg-brand-primary border-brand-primary text-white shadow-[0_10px_30px_rgba(125,56,255,0.2)]" 
                      : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/20"
                  )}
                >
                  {s.label}
                  <div className={cn(
                    "h-1 w-full absolute bottom-0 left-0 transition-transform duration-300",
                    formData.state === s.value ? "bg-brand-accent scale-x-100" : "bg-white/5 scale-x-0"
                  )} />
                </button>
              ))}
            </div>
          </div>

          {/* Grille technique 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Année */}
            <div className="bg-zinc-950/50 border border-white/5 p-6 hover:border-white/10 transition-colors">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 italic">Année de fabrication</label>
              <div className="relative">
                <input 
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Ex: 2023"
                  className="w-full bg-transparent border-b border-white/10 pb-2 text-xl font-black text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-zinc-800"
                />
              </div>
            </div>

            {/* Accessoires */}
            <div className="bg-zinc-950/50 border border-white/5 p-6 hover:border-white/10 transition-colors">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4 italic">Accessoires fournis</label>
              <button 
                type="button"
                onClick={handleToggleAccessory}
                className={cn(
                  "w-full py-2 border-b transition-all text-left text-xl font-black tracking-tight cursor-pointer",
                  formData.accessory_included 
                    ? "border-brand-accent text-brand-accent" 
                    : "border-white/10 text-zinc-700"
                )}
              >
                {formData.accessory_included ? "OUI" : "NON, SEUL"}
              </button>
            </div>

            {/* Livraison */}
            <div className={cn(
              "p-6 border transition-all flex flex-col justify-between group",
              formData.is_shipping_available ? "bg-brand-accent/5 border-brand-accent/20" : "bg-zinc-950/50 border-white/5"
            )}>
              <div className="flex items-center justify-between mb-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Envoi par colis</label>
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_shipping_available: !prev.is_shipping_available }))}
                  className={cn(
                    "w-12 h-6 flex items-center p-1 transition-colors duration-300 cursor-pointer",
                    formData.is_shipping_available ? "bg-brand-accent" : "bg-zinc-800"
                  )}
                >
                  <div className={cn(
                    "bg-black w-4 h-4 shadow-lg transform transition-transform duration-300",
                    formData.is_shipping_available ? "translate-x-6" : "translate-x-0"
                  )} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRight className={cn("w-5 h-5 transition-transform", formData.is_shipping_available ? "text-brand-accent rotate-90" : "text-zinc-800")} />
                <span className={cn("text-xs font-black uppercase italic", formData.is_shipping_available ? "text-white" : "text-zinc-800")}>
                  {formData.is_shipping_available ? "DISPONIBLE" : "NON DISPONIBLE"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 : PRIX */}
      <section className="relative z-10 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-none p-6 md:p-8">
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
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0.00"
            className="w-full bg-zinc-950/50 border border-white/10 p-6 rounded-none text-3xl font-black text-white focus:outline-none focus:border-brand-accent transition-all placeholder:text-zinc-800"
          />
          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-700 italic">€</span>
        </div>
        <p className="mt-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest italic flex items-center gap-2">
          <AlertCircle className="w-3 h-3" />
          Le prix de vente conseillé se situe généralement à 50% du prix neuf.
        </p>
      </section>

      {/* SUBMIT BUTTON */}
      <div className="pt-8">
        <Button 
          variant="secondary" 
          size="full"
          className="h-20 text-xl font-black italic tracking-tighter uppercase shadow-[0_20px_50px_rgba(198,255,52,0.2)] hover:shadow-brand-accent/40"
        >
          Publier l'annonce
          <ChevronRight className="ml-2 w-6 h-6" />
        </Button>
      </div>

    </form>
  );
}
