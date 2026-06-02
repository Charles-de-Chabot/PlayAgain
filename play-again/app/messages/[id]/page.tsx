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
          lastname: true,
          products: {
            where: {
              is_sold: true
            },
            select: {
              id: true
            }
          }
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
              lastname: true,
              products: {
                where: {
                  is_sold: true
                },
                select: {
                  id: true
                }
              }
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
  const isSupport = conversation.isSupportThread;
  const isBuyer = conversation.user_id === userId;
  const isSeller = conversation.product ? conversation.product.user_id === userId : false;
  if (!isBuyer && !isSeller) {
    return redirect("/messages");
  }

  // Interlocuteur (l'autre participant)
  const partner = isSupport ? {
    id: 999999,
    username: "Support Officiel PlayAgain",
    firstname: "Support",
    lastname: "PlayAgain",
    profile_picture: null,
    products: []
  } : (isBuyer && conversation.product ? conversation.product.user : conversation.user);

  // 3. Récupération du rôle de l'utilisateur connecté
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  const userRole = currentUser?.role || "USER";

  // 4. Récupération de la facture associée active (liée à l'acheteur de cette discussion)
  const invoice = conversation.product_id ? await prisma.invoice.findFirst({
    where: {
      user_id: conversation.user_id, // Filtrer par l'acheteur de cette conversation
      items: {
        some: {
          product_id: conversation.product_id,
        },
      },
      status: {
        not: "CANCELLED",
      },
    },
    orderBy: {
      id: "desc",
    },
    select: {
      id: true,
      status: true,
      address_id: true,
    },
  }) : null;

  const serializedInvoice = invoice ? {
    id: invoice.id,
    status: invoice.status,
    address_id: invoice.address_id,
  } : null;

  // Sérialisation des objets Decimal de Prisma pour éviter l'erreur de transfert RSC -> Client Component
  const serializedConversation = {
    ...conversation,
    created_at: conversation.created_at.toISOString(),
    product: conversation.product ? {
      ...conversation.product,
      price: Number(conversation.product.price),
      created_at: conversation.product.created_at.toISOString(),
      updated_at: conversation.product.updated_at.toISOString(),
    } : null,
    messages: conversation.messages.map((msg) => ({
      ...msg,
      created_at: msg.created_at.toISOString(),
    })),
  };

  let isSupportClosed = false;
  if (conversation.isSupportThread) {
    const latestTicket = await prisma.supportTicket.findFirst({
      where: { userId: conversation.user_id },
      orderBy: { createdAt: "desc" }
    });
    if (latestTicket && latestTicket.status === "RESOLVED") {
      isSupportClosed = true;
    }
  }

  return (
    <ChatAreaClient 
      initialConversation={serializedConversation as any}
      initialInvoice={serializedInvoice}
      currentUserId={userId}
      currentUserRole={userRole}
      partner={partner}
      isBuyer={isBuyer}
      isSupportClosed={isSupportClosed}
    />
  );
}
