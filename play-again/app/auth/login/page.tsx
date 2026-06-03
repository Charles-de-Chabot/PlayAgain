import { Metadata } from "next";
import LoginClient from "./LoginClient";
import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoMetadata("login");
  return {
    title: seo?.title || "Connexion - Play Again",
    description: seo?.description || "Connectez-vous à votre compte Play Again.",
    keywords: seo?.keywords,
  };
}

export default function LoginPage() {
  return <LoginClient />;
}
