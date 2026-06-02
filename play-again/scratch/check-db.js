const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const connectionString = "mysql://dev_user:dev_password@localhost:3306/play_again_db";
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const conversations = await prisma.conversation.findMany({
    include: {
      product: true,
    }
  });
  console.log("=== Conversations ===");
  console.log(JSON.stringify(conversations, null, 2));

  const invoices = await prisma.invoice.findMany({
    include: {
      items: true
    }
  });
  console.log("=== Invoices ===");
  console.log(JSON.stringify(invoices, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
