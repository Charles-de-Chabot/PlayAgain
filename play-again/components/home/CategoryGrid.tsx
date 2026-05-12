import { Button } from "@/components/ui/Button";

const categories = [
  { id: 1, name: "SKI" },
  { id: 2, name: "VELO" },
  { id: 3, name: "FITNESS" },
  { id: 4, name: "EQUITATION" },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-8 xl:grid-cols-4 xl:gap-20 justify-items-center mx-auto w-fit">
      {categories.map((cat) => (
        <Button 
          key={cat.id} 
          variant="brand" 
          size="md" 
          className="rounded-none text-sm font-bold uppercase w-36 h-8 md:w-40 md:h-10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-primary/20"
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
}
