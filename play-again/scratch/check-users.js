const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const connectionString = process.env.DATABASE_URL || "mysql://dev_user:dev_password@localhost:3306/play_again_db";
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Checking all users and their stripeConnectId...");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      stripeConnectId: true,
    }
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
