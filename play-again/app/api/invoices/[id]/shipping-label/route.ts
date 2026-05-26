import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { id } = await params;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return new NextResponse("ID de facture invalide", { status: 400 });
    }

    // Récupérer la facture avec les relations nécessaires
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: true, // L'acheteur
        address: true, // L'adresse d'expédition
        items: {
          include: {
            product: {
              include: {
                user: true, // Le vendeur
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return new NextResponse("Facture non trouvée", { status: 404 });
    }

    const item = invoice.items[0];
    if (!item) {
      return new NextResponse("Aucun article dans cette facture", { status: 400 });
    }

    const product = item.product;
    const seller = product.user;
    const buyer = invoice.user;
    const address = invoice.address;

    // Sécurité : Seul l'acheteur ou le vendeur de la transaction peut y accéder
    const isBuyer = invoice.user_id === userId;
    const isSeller = product.user_id === userId;

    if (!isBuyer && !isSeller) {
      return new NextResponse("Accès refusé à ce bordereau d'expédition", { status: 403 });
    }

    // Générer une page HTML ultra-premium pour impression directe (avec couperet et codes barres stylisés)
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bordereau d'expédition PlayAgain #${invoice.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Courier+Prime&display=swap');
    
    body {
      font-family: 'Montserrat', sans-serif;
      background-color: #f3f4f6;
      color: #111827;
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .container {
      width: 100%;
      max-width: 650px;
      background: #ffffff;
      padding: 40px;
      border-radius: 24px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }

    /* En-tête */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo-container h1 {
      font-size: 24px;
      font-weight: 900;
      color: #7D38FF;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .logo-container p {
      font-size: 10px;
      color: #6b7280;
      margin: 2px 0 0 0;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-shipping {
      background: #7D38FF;
      color: #ffffff;
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Informations de Livraison */
    .grid-addresses {
      display: grid;
      grid-template-cols: 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    @media(min-width: 480px) {
      .grid-addresses {
        grid-template-columns: 1fr 1fr;
      }
    }

    .address-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #f3f4f6;
    }

    .address-card h3 {
      font-size: 11px;
      font-weight: 900;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 10px 0;
    }

    .address-name {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 6px;
    }

    .address-text {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.5;
    }

    /* Détails de l'article */
    .product-section {
      border: 1px dashed #e5e7eb;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 30px;
    }

    .product-title {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }

    .product-meta {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }

    /* Zone Code-barres simulée */
    .barcode-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
      background: #f9fafb;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      text-align: center;
    }

    .barcode-stripes {
      font-family: 'Courier Prime', monospace;
      font-size: 28px;
      letter-spacing: 1px;
      font-weight: bold;
      color: #000000;
      user-select: none;
      margin-bottom: 6px;
    }

    .barcode-number {
      font-family: 'Courier Prime', monospace;
      font-size: 12px;
      color: #4b5563;
      letter-spacing: 3px;
    }

    /* Ligne de découpe pour impression */
    .cutting-line {
      border-top: 2px dashed #9ca3af;
      margin: 40px 0;
      position: relative;
      text-align: center;
    }

    .cutting-line span {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffffff;
      padding: 0 15px;
      font-size: 10px;
      color: #9ca3af;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .print-button-container {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .btn-print {
      background: #7D38FF;
      color: #ffffff;
      border: none;
      padding: 12px 30px;
      font-size: 12px;
      font-weight: 900;
      border-radius: 12px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: all 0.2s;
    }

    .btn-print:hover {
      background: #6826e0;
      transform: translateY(-1px);
    }

    /* Styles spécifiques pour l'impression */
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .container {
        box-shadow: none;
        border: none;
        max-width: 100%;
        padding: 0;
      }
      .print-button-container {
        display: none;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <div class="logo-container">
        <h1>Play Again</h1>
        <p>Bordereau de transport officiel</p>
      </div>
      <div class="badge-shipping">
        Colissimo Suivi
      </div>
    </div>

    <div class="grid-addresses">
      <div class="address-card">
        <h3>Expéditeur (Vendeur)</h3>
        <div class="address-name">${seller.firstname || ""} ${seller.lastname || seller.username || "Utilisateur"}</div>
        <div class="address-text">
          Membre certifié PlayAgain<br>
          FRANCE
        </div>
      </div>

      <div class="address-card">
        <h3>Destinataire (Acheteur)</h3>
        <div class="address-name">${buyer.firstname || ""} ${buyer.lastname || buyer.username || "Acheteur"}</div>
        <div class="address-text">
          ${address?.street_number || ""} ${address?.street_name || ""}<br>
          ${address?.zip_code || ""} ${address?.city || ""}<br>
          ${address?.country || "FRANCE"}<br>
          Tél : ${buyer.phone || "Non renseigné"}
        </div>
      </div>
    </div>

    <div class="barcode-container">
      <div class="barcode-stripes">
        |||||| | |||| ||| || |||| | ||| |||| |
      </div>
      <div class="barcode-number">
        TR-PA-${invoice.id}-${buyer.id}
      </div>
    </div>

    <div class="cutting-line">
      <span>Ciseaux - Couper ici pour coller sur le colis</span>
    </div>

    <div class="print-button-container">
      <button class="btn-print" onclick="window.print()">Imprimer le bordereau</button>
    </div>
  </div>

</body>
</html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

  } catch (error: any) {
    console.error("Erreur lors de la génération du bordereau d'expédition :", error);
    return new NextResponse("Une erreur interne est survenue.", { status: 500 });
  }
}
