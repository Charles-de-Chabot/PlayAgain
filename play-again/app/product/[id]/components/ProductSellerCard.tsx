import React from "react";
import Link from "next/link";
import { User, MapPin, ShieldCheck, ChevronRight } from "lucide-react";

export interface Seller {
  id: number;
  username: string;
  profile_picture: string | null;
  is_certified: boolean;
}

export interface Product {
  user: Seller;
}

export interface ProductSellerCardProps {
  product: Product;
  sellerLocation: string;
}

/**
 * ProductSellerCard displays seller profile pictures, certifications,
 * usernames, location badges, and direct navigation links to public profiles.
 */
export default function ProductSellerCard({ product, sellerLocation }: ProductSellerCardProps) {
  return (
    <div className="p-5 rounded-3xl bg-zinc-900/50 border border-white/10 backdrop-blur-sm flex items-center justify-between group hover:bg-zinc-900/80 transition-all text-left">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden relative">
          {product.user.profile_picture ? (
            <img src={product.user.profile_picture} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-zinc-650" />
          )}
        </div>
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vendeur</p>
          <div className="flex items-center gap-2">
            <p className="font-bold text-white text-lg">{product.user.username}</p>
            {product.user.is_certified && <ShieldCheck className="w-5 h-5 text-brand-accent" />}
          </div>
          <div className="flex items-center gap-1 text-zinc-400 text-xs mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{sellerLocation}</span>
          </div>
        </div>
      </div>
      <Link
        href={`/profile/${product.user.id}`}
        className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 text-zinc-400 group-hover:text-brand-accent group-hover:border-brand-accent/50 transition-all cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}
