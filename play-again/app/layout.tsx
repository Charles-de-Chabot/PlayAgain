import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import { Footer } from "@/components/layout/Footer";
import { MobileNavbar } from "@/components/layout/MobileNavbar";

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
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-black">
        <SessionProvider>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <MobileNavbar />
        </SessionProvider>
      </body>
    </html>
  );
}
