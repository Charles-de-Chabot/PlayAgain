import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import ConversationListClient from "@/components/messages/ConversationListClient";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);

  // Charger toutes les conversations de l'utilisateur
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user_id: userId },
        { product: { user_id: userId } }
      ]
    },
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
          invoice_items: {
            where: {
              invoice: {
                status: {
                  not: "CANCELLED"
                }
              }
            },
            include: {
              invoice: {
                select: {
                  status: true,
                  address_id: true
                }
              }
            }
          }
        }
      },
      messages: {
        orderBy: { created_at: "desc" },
        take: 1
      }
    },
    orderBy: { created_at: "desc" }
  });

  // Sérialisation des objets Decimal de Prisma pour éviter l'erreur de transfert RSC -> Client Component
  const serializedConversations = conversations.map((conv) => ({
    ...conv,
    created_at: conv.created_at.toISOString(),
    product: {
      ...conv.product,
      price: Number(conv.product.price),
      created_at: conv.product.created_at.toISOString(),
      updated_at: conv.product.updated_at.toISOString(),
      invoice_items: (conv.product.invoice_items || []).map((item: any) => ({
        ...item,
        unit_price: Number(item.unit_price),
      })),
    },
    messages: conv.messages.map((msg) => ({
      ...msg,
      created_at: msg.created_at.toISOString(),
    })),
  }));

  return (
    <main className="h-screen w-screen bg-black text-white relative overflow-hidden font-sans flex flex-col">
      {/* Background Decor - Violet / Lime Green */}
      <div className="fixed top-0 left-0 w-screen h-screen z-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-brand-primary blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-accent blur-[140px] opacity-40" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col pt-[64px] md:pt-[81px] min-h-0 overflow-hidden">
        <Header />
        
        {/* Zone principale double colonne */}
        <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto px-4 pb-4 md:pb-6 pt-2 gap-4 min-h-0 overflow-hidden">
          <ConversationListClient 
            initialConversations={serializedConversations} 
            currentUserId={userId}
          >
            {children}
          </ConversationListClient>
        </div>
      </div>
    </main>
  );
}
