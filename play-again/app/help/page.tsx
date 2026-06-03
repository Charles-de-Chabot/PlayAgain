import { Metadata } from "next";
import HelpClient from "./HelpClient";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoMetadata("help");
  return {
    title: seo?.title || "Centre d'Aide - Play Again",
    description: seo?.description || "Trouvez des réponses à toutes vos questions sur Play Again.",
    keywords: seo?.keywords,
  };
}

export default function HelpPage() {
  return <HelpClient />;
}
