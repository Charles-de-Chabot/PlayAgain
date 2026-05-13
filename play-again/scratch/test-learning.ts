import prisma from "../lib/prisma";
import { calculateMatch } from "../lib/ai/matcher";

async function testLearning() {
  console.log("🧪 Test de l'Apprentissage Automatique...\n");

  const userProfile = { level: "ADVANCED" };
  
  // Une marque qui n'est PAS dans brandRegistry.ts
  const newProduct = {
    title: "Cervélo S5 Carbon",
    description: "Vélo de route ultra-aéro pour la compétition. Très rigide, géométrie agressive pour coureurs confirmés.",
    brand: { name: "Cervélo" },
    levelCategory: "BEGINNER" // Le défaut en DB est Beginner, mais l'IA doit détecter PRO/ADVANCED
  };

  console.log(`🧐 Analyse d'une nouvelle marque : ${newProduct.brand.name}`);
  const result = await calculateMatch(userProfile, newProduct);
  
  console.log(`📊 Résultat IA : ${result.detectedLevel} (Score: ${result.score}%)`);
  console.log(`💬 Explication : ${result.explanation}`);

  // On attend un peu pour que la promesse d'écriture en DB se termine
  await new Promise(resolve => setTimeout(resolve, 2000));

  const memory = await prisma.brandExpertise.findMany();
  console.log("\n🧠 Contenu de la mémoire de l'IA :");
  console.table(memory);
}

testLearning().catch(console.error);
