import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoMetadata("home");
  return {
    title: seo?.title || "Play Again",
    description: seo?.description || "Marketplace d'articles de sport d'occasion",
    keywords: seo?.keywords,
  };
}

export default function Home() {
  return <HomeClient />;
}
