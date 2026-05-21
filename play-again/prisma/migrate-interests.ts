import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import "dotenv/config"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaMariaDb(connectionString)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🔄 Début de la migration des intérêts sportifs...");

  // Récupérer tous les profils sportifs
  const profiles = await prisma.sportProfile.findMany();
  console.log(`🔍 Trouvé ${profiles.length} profils à traiter.`);

  let createdSkillsCount = 0;

  for (const profile of profiles) {
    const interests = profile.interests;
    const globalLevel = profile.level; // ex: BEGINNER, INTERMEDIATE, etc.

    if (interests && Array.isArray(interests)) {
      console.log(`Migrating profile ID ${profile.id} (user ID ${profile.userId}) with interests:`, interests);
      
      for (const sport of interests) {
        if (typeof sport === "string") {
          const cleanSportName = sport.trim().toUpperCase();
          if (!cleanSportName) continue;

          // Créer ou mettre à jour la ligne SportSkill correspondante
          await prisma.sportSkill.upsert({
            where: {
              sportProfileId_sportName: {
                sportProfileId: profile.id,
                sportName: cleanSportName,
              }
            },
            update: {
              level: globalLevel,
            },
            create: {
              sportProfileId: profile.id,
              sportName: cleanSportName,
              level: globalLevel,
            }
          });
          createdSkillsCount++;
        }
      }
    }
  }

  console.log(`\n✅ Migration terminée avec succès ! ${createdSkillsCount} compétences sportives créées ou mises à jour.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur pendant la migration :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
