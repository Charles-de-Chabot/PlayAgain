const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const connectionString = process.env.DATABASE_URL || "mysql://dev_user:dev_password@localhost:3306/play_again_db";
const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔍 Checking all invoices...");
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    console.log(`Found ${invoices.length} invoices.`);
    console.log(JSON.stringify(invoices.map(inv => ({
      id: inv.id,
      status: inv.status,
      tracking_number: inv.tracking_number,
      invoice_date: inv.invoice_date,
      buyer: inv.user?.email,
      seller: inv.items[0]?.product?.user?.email
    })), null, 2));
  } catch (error) {
    console.error("Error fetching invoices:", error);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
