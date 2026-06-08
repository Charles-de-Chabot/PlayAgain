"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";
import { deleteProduct } from "@/app/actions/product";

interface DeleteProductButtonProps {
  productId: number;
}

export function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const res = await deleteProduct(productId);
        if (res.success) {
          setIsOpen(false);
          router.push("/profile");
          router.refresh();
        }
      } catch (err) {
        console.error(err);
        alert("Une erreur est survenue lors de la suppression de l'annonce.");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="w-full h-14 rounded-2xl bg-zinc-950 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 text-red-500 text-sm font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-5 h-5 mr-2 stroke-[2.5]" />
        Supprimer l'annonce
      </Button>

      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer l'annonce"
        description="Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible."
      />
    </>
  );
}
