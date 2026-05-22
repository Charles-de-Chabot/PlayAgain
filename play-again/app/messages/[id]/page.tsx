import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import ChatAreaClient from "@/components/messages/ChatAreaClient";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);
  const { id } = await params;
  const conversationId = parseInt(id);

  if (isNaN(conversationId)) {
    return notFound();
  }

  // 1. Récupération de la conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile_picture: true,
          firstname: true,
          lastname: true
        }
      },
      product: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile_picture: true,
              firstname: true,
              lastname: true
            }
          },
          media: {
            take: 1
          },
          category: true
        }
      },
      messages: {
        orderBy: { created_at: "asc" }
      }
    }
  });

  if (!conversation) {
    return notFound();
  }

  // 2. Sécurité : L'utilisateur connecté doit faire partie de la conversation
  const isBuyer = conversation.user_id === userId;
  const isSeller = conversation.product.user_id === userId;
  if (!isBuyer && !isSeller) {
    return redirect("/messages");
  }

  // Interlocuteur (l'autre participant)
  const partner = isBuyer ? conversation.product.user : conversation.user;

  // 3. Récupération du rôle de l'utilisateur connecté
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  const userRole = currentUser?.role || "USER";

  // Sérialisation des objets Decimal de Prisma pour éviter l'erreur de transfert RSC -> Client Component
  const serializedConversation = {
    ...conversation,
    created_at: conversation.created_at.toISOString(),
    product: {
      ...conversation.product,
      price: Number(conversation.product.price),
      created_at: conversation.product.created_at.toISOString(),
      updated_at: conversation.product.updated_at.toISOString(),
    },
    messages: conversation.messages.map((msg) => ({
      ...msg,
      created_at: msg.created_at.toISOString(),
    })),
  };

  return (
    <ChatAreaClient 
      initialConversation={serializedConversation}
      currentUserId={userId}
      currentUserRole={userRole}
      partner={partner}
      isBuyer={isBuyer}
    />
  );
}
