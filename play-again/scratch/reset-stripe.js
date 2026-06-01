const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const connectionString = process.env.DATABASE_URL || "mysql://dev_user:dev_password@localhost:3306/play_again_db";
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Recherche d'utilisateurs avec des comptes Stripe invalides...");

  // Mettre à jour les utilisateurs ayant 'acct_test1' ou d'autres identifiants fictifs
  const result = await prisma.user.updateMany({
    where: {
      OR: [
        {
          stripeConnectId: {
            startsWith: "acct_test",
          },
        },
        {
          stripeConnectId: {
            in: ["acct_dummy", "null", ""],
          },
        },
        {
          email: {
            in: ["test@test.com", "test2@test.com", "test3@test.com"],
          },
        },
      ],
    },
    data: {
      stripeConnectId: null,
    },
  });

  console.log(`✅ Réinitialisation réussie ! ${result.count} utilisateur(s) mis à jour avec stripeConnectId = null.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors de la réinitialisation :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
