import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Récupération des catégories et comptage des produits...");
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  const sorted = categories.sort((a, b) => b._count.products - a._count.products);
  
  console.log("\n=== CLASSEMENT DES CATÉGORIES LES PLUS POPULAIRES (PAR NOMBRE DE PRODUITS) ===");
  let count = 0;
  sorted.forEach(c => {
    count++;
    console.log(`${count}. ${c.label.toUpperCase()} : ${c._count.products} produit(s)`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
