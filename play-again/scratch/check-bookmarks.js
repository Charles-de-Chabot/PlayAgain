const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const connectionString = process.env.DATABASE_URL || "mysql://dev_user:dev_password@localhost:3306/play_again_db";
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Checking bookmarks and fav items...");
  const bookmarks = await prisma.bookmark.findMany({
    include: {
      items: true
    }
  });
  console.log(JSON.stringify(bookmarks, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
