import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string | number;
  showShadows?: boolean;
  children: React.ReactNode;
}

export function ScrollArea({
  className,
  maxHeight,
  showShadows = true,
  children,
  style,
  ...props
}: ScrollAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopShadow, setShowTopShadow] = useState(false);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current || !showShadows) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    
    // Affiche l'ombre du haut si on a scrollé vers le bas
    setShowTopShadow(scrollTop > 5);
    
    // Affiche l'ombre du bas s'il reste des éléments à scroller vers le bas
    setShowBottomShadow(scrollTop + clientHeight < scrollHeight - 5);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      handleScroll();
      el.addEventListener("scroll", handleScroll, { passive: true });
      
      // Observer pour recalculer si la taille du contenu change
      const resizeObserver = new ResizeObserver(() => {
        handleScroll();
      });
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }

      window.addEventListener("resize", handleScroll, { passive: true });

      return () => {
        el.removeEventListener("scroll", handleScroll);
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, [children, showShadows]);

  return (
    <div className="relative group/scroll w-full flex flex-col min-h-0" style={{ maxHeight }}>
      {/* Ombre de dégradé supérieure */}
      {showShadows && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-6 pointer-events-none bg-linear-to-b from-zinc-950 to-transparent z-10 transition-opacity duration-300",
            showTopShadow ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Conteneur de défilement principal */}
      <div
        ref={scrollRef}
        className={cn(
          "h-full w-full overflow-y-auto custom-scrollbar scroll-smooth min-h-0",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </div>

      {/* Ombre de dégradé inférieure */}
      {showShadows && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-6 pointer-events-none bg-linear-to-t from-zinc-950 to-transparent z-10 transition-opacity duration-300",
            showBottomShadow ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
