"use client";

import { useState, useRef } from "react";
import { User as UserIcon, Camera, Loader2 } from "lucide-react";
import { updateProfilePicture } from "@/app/actions/user";
import { useRouter } from "next/navigation";

interface ProfileAvatarProps {
  userId: number;
  currentProfilePicture: string | null;
  username: string | null;
}

export function ProfileAvatar({ userId, currentProfilePicture, username }: ProfileAvatarProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validation rapide côté client
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await updateProfilePicture(formData);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || "Une erreur est survenue lors du téléversement.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setIsUploading(false);
      // Réinitialiser la valeur de l'input pour pouvoir sélectionner à nouveau le même fichier si besoin
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start gap-2 select-none">
      <div 
        onClick={handleContainerClick}
        className="relative group shrink-0 cursor-pointer"
      >
        {/* Glow effect outline (premium aesthetic matching login style) */}
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-accent rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse" />
        
        {/* Main avatar container */}
        <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-white/20 shadow-2xl overflow-hidden transition-all duration-300 group-hover:border-brand-accent/50">
          
          {/* Current profile picture or user icon */}
          {currentProfilePicture ? (
            <img 
              src={currentProfilePicture} 
              alt={username || "Profile"} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <UserIcon className="w-10 h-10 md:w-14 md:h-14 text-zinc-700 transition-colors duration-300 group-hover:text-zinc-500" />
          )}

          {/* Hover Overlay with camera icon */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-1">
            <Camera className="w-5 h-5 md:w-7 md:h-7 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-300 scale-90 group-hover:scale-100 transition-transform duration-300 text-center px-2">
              Modifier
            </span>
          </div>

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-20">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-brand-accent animate-spin" />
            </div>
          )}
        </div>

        {/* Hidden input file */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Error message under avatar */}
      {error && (
        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider max-w-[200px] text-center sm:text-left mt-1 block animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
}
