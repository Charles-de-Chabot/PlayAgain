import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Vous devez être connecté pour soumettre cette demande." }, { status: 401 });
    }

    const {
      submittedEmail,
      submittedPhone,
      submittedStreetNumber,
      submittedStreetName,
      submittedCity,
      submittedZip,
      submittedCountry,
      idCardPhoto1Url,
      idCardPhoto2Url,
      selfieUrl
    } = await req.json();

    // 1. Validation de la présence des champs obligatoires (submittedStreetNumber est optionnel, tout comme dans la table Address)
    if (!submittedEmail || !submittedPhone || !submittedStreetName || !submittedCity || !submittedZip || !submittedCountry) {
      return NextResponse.json({ error: "Toutes les coordonnées (sauf le numéro de rue s'il n'y en a pas) sont obligatoires." }, { status: 400 });
    }
    if (!idCardPhoto1Url || !selfieUrl) {
      return NextResponse.json({ error: "La pièce d'identité (Photo 1) et le selfie avec papier manuscrit sont obligatoires." }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    // 2. Récupérer l'utilisateur avec son adresse principale (is_default = true)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          where: { is_default: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé." }, { status: 404 });
    }

    // 3. Normalisation des coordonnées et de l'adresse saisies
    const normalizedInputEmail = submittedEmail.trim().toLowerCase();
    const normalizedInputPhone = submittedPhone.replace(/[\s\-\+\(\)]/g, "");
    const inputNumber = (submittedStreetNumber || "").trim().toLowerCase();
    const inputStreetName = submittedStreetName.trim().toLowerCase();

    // 5. Vérifier s'il n'y a pas déjà une demande active (PENDING ou PROCESSING_AI)
    const activeRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId,
        status: { in: ["PENDING", "PROCESSING_AI"] }
      }
    });

    if (activeRequest) {
      return NextResponse.json({ error: "Une demande de vérification est déjà en cours d'analyse." }, { status: 400 });
    }

    // 6. Enregistrement de la requête en BDD
    const newRequest = await prisma.verificationRequest.create({
      data: {
        userId,
        submittedEmail: normalizedInputEmail,
        submittedPhone: normalizedInputPhone,
        submittedStreetNumber: inputNumber || null,
        submittedStreetName: inputStreetName,
        submittedCity: submittedCity.trim(),
        submittedZip: submittedZip.trim(),
        submittedCountry: submittedCountry.trim(),
        idCardPhoto1Url,
        idCardPhoto2Url: idCardPhoto2Url || null,
        selfieUrl,
        status: "PENDING",
        method: "MANUAL",
      }
    });

    // 7. Création automatique de la notification de confirmation d'envoi en BDD
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: "VERIFICATION_SUBMITTED",
        message: "Votre demande de vérification de profil a bien été reçue. Notre équipe va l'analyser sous peu !",
        is_opened: false
      }
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error: any) {
    console.error("Erreur d'API lors de la soumission de vérification :", error);
    return NextResponse.json({ error: error.message || "Une erreur interne est survenue." }, { status: 500 });
  }
}
