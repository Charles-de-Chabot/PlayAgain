import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { notificationRegistry } from "@/lib/notificationRegistry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Non autorisé", { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // Enregistrer le client dans le registre partagé pour pouvoir lui pousser les notifications
  const send = (data: string) => {
    try {
      writer.write(encoder.encode(`data: ${data}\n\n`));
    } catch (err) {
      console.error(`Erreur d'écriture dans le flux pour l'utilisateur ${userId}:`, err);
    }
  };
  notificationRegistry.register(userId, send);

  // Envoyer un signal de vie (keepalive) toutes les 25s pour empêcher la fermeture par timeout des reverse proxies
  const interval = setInterval(() => {
    try {
      writer.write(encoder.encode(": keepalive\n\n"));
    } catch (err) {
      // Client déconnecté
    }
  }, 25000);

  // Écouter l'interruption / la fermeture de la connexion côté client pour nettoyer le registre
  req.signal.addEventListener("abort", () => {
    clearInterval(interval);
    notificationRegistry.unregister(userId);
    try {
      writer.close();
    } catch (err) {
      // Déjà fermé
    }
  });

  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
