import { Button } from "@/components/ui/Button";

const categories = [
  { id: 1, name: "SKI" },
  { id: 2, name: "VELO" },
  { id: 3, name: "FITNESS" },
  { id: 4, name: "EQUITATION" },
];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((cat) => (
        <Button 
          key={cat.id} 
          variant="brand" 
          size="md" 
          className="h-12 rounded-lg text-sm font-bold uppercase"
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
}
