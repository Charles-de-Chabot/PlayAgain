import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-4 md:gap-10 justify-items-center mx-auto w-fit">
      {categories.map((cat) => (
        <Link 
          key={cat.id} 
          href={`/shop?category=${cat.id}`}
          className="relative group overflow-hidden border-2 border-brand-primary/50 w-32 h-9 md:w-36 md:h-11 transition-all duration-500 hover:border-brand-primary cursor-pointer flex items-center justify-center"
        >
          {/* Background fill on hover */}
          <div className="absolute inset-0 bg-brand-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          
          {/* Text */}
          <span className="relative z-10 block text-[10px] md:text-[11px] font-black uppercase tracking-widest text-brand-primary group-hover:text-white transition-colors italic line-clamp-1 px-1">
            {cat.name}
          </span>

          {/* Glow effect hover */}
          <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
        </Link>
      ))}
    </div>
  );
}

