import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Fonction pour créer l'instance du client Prisma avec l'adaptateur requis par Prisma 7
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL!;
  // Dans Prisma 7, l'adaptateur gère la connexion à MySQL/MariaDB
  const adapter = new PrismaMariaDb(connectionString);
  
  // Note: Prisma 7 gère l'initialisation de l'adaptateur en interne 
  // via l'option adapter du constructeur.
  return new PrismaClient({ adapter });
};

// Utilisation du pattern Singleton pour éviter d'ouvrir trop de connexions en développement
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
