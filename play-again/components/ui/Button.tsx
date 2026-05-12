import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "brand";
  size?: "sm" | "md" | "lg" | "full";
}

export function Button({ 
  className, 
  variant = "primary", 
  size = "md", 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-white text-black hover:bg-gray-100",
    secondary: "bg-brand-accent text-black hover:opacity-90",
    outline: "border border-white text-white hover:bg-white/10",
    ghost: "text-white hover:bg-white/10",
    brand: "bg-brand-primary text-white hover:opacity-90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
    full: "w-full py-4 text-lg font-bold",
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-none font-medium transition-colors cursor-pointer focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
