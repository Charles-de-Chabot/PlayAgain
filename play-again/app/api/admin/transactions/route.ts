import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Non autorisé. Veuillez vous connecter.", status: 401 };
  }

  const adminId = parseInt(session.user.id);
  const adminUser = await prisma.user.findUnique({
    where: { id: adminId }
  });

  if (!adminUser || adminUser.role !== "ADMIN") {
    return { error: "Accès refusé. Privilèges insuffisants.", status: 403 };
  }

  return { admin: adminUser, id: adminId };
}

export async function GET(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const disputesOnly = searchParams.get("disputesOnly") === "true";

    const whereClause: any = {};
    if (disputesOnly) {
      whereClause.OR = [
        { is_disputed: true },
        { status: "DISPUTED" }
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        address: true,
        user: {
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            email: true,
            phone: true,
            profile_picture: true,
            is_certified: true,
            created_at: true,
            addresses: true,
          }
        },
        items: {
          include: {
            product: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    phone: true,
                    profile_picture: true,
                    is_certified: true,
                    created_at: true,
                    stripeConnectId: true,
                    addresses: true,
                  }
                },
                media: true,
                category: true,
                type: true,
                brand: true,
                size: true
              }
            }
          }
        }
      },
      orderBy: { invoice_date: "desc" }
    });

    // KPI calculation
    const allInvoices = await prisma.invoice.findMany();
    
    // Escrow volume: total price of pending/shipped/delivered/disputed invoices
    const escrowInvoices = allInvoices.filter(inv => 
      ["PENDING", "SHIPPED", "DELIVERED", "DISPUTED"].includes(inv.status)
    );
    const totalEscrowVolume = escrowInvoices.reduce((sum, inv) => sum + Number(inv.total_price), 0);

    // Commissions: total of commissions from completed invoices
    const completedInvoices = allInvoices.filter(inv => inv.status === "COMPLETED");
    const totalCommissions = completedInvoices.reduce((sum, inv) => sum + Number(inv.commission || 0), 0);

    // Open disputes count
    const openDisputes = allInvoices.filter(inv => inv.status === "DISPUTED").length;

    // Resolution rate
    const resolvedDisputes = allInvoices.filter(inv => inv.status === "COMPLETED" && inv.is_disputed).length;
    const totalDisputesCount = resolvedDisputes + openDisputes;
    const resolutionRate = totalDisputesCount > 0 
      ? Math.round((resolvedDisputes / totalDisputesCount) * 100)
      : 100;

    return NextResponse.json({
      invoices,
      kpis: {
        totalEscrowVolume,
        totalCommissions,
        openDisputes,
        resolutionRate
      }
    });

  } catch (error: any) {
    console.error("Erreur de récupération des transactions :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const adminCheck = await checkAdmin();
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { invoiceId, trackingNumber } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "L'identifiant de la transaction est requis." }, { status: 400 });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: parseInt(invoiceId) },
      data: {
        tracking_number: trackingNumber || null
      }
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    console.error("Erreur de mise à jour du numéro de suivi :", error);
    return NextResponse.json({ error: "Une erreur interne est survenue." }, { status: 500 });
  }
}
