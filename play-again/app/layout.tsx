import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { Footer } from "@/components/layout/Footer";
import { MobileNavbar } from "@/components/layout/MobileNavbar";
import { GlobalScrollbar } from "@/components/ui/GlobalScrollbar";
import { CompareModal } from "@/components/ui/CompareModal";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Play Again",
  description: "Marketplace d'articles de sport d'occasion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-black text-white" suppressHydrationWarning>
        <SessionProvider>
          <GlobalScrollbar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <MobileNavbar />
          <CompareModal />
        </SessionProvider>
      </body>
    </html>
  );
}
