import { calculateMatch } from "../lib/ai/matcher";

async function runTest() {
  console.log("🚀 Lancement du test de l'IA locale...\n");

  const userProfile = {
    level: "INTERMEDIATE"
  };

  const products = [
    {
      title: "Rossignol Hero Elite ST",
      description: "Skis de slalom compétition, ultra rigides et nerveux. Pour les skieurs experts uniquement.",
      brand: { name: "Rossignol" }
    },
    {
      title: "Skis Wedze Boost",
      description: "Skis très faciles et souples, parfaits pour apprendre et progresser tranquillement sur piste.",
      brand: { name: "Decathlon" }
    }
  ];

  for (const product of products) {
    console.log(`📝 Analyse du produit : "${product.title}"`);
    console.log(`📖 Description : ${product.description}`);
    
    const result = await calculateMatch(userProfile, product);
    
    console.log(`🧠 IA : Niveau détecté = ${result.detectedLevel}`);
    console.log(`📊 Score de Match = ${result.score}%`);
    console.log(`💬 Explication : ${result.explanation}`);
    console.log("-----------------------------------\n");
  }
}

runTest().catch(console.error);
