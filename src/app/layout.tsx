import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Aqui nós importamos o seu novo Menu

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "COMAN | Comando de Airsoft do Nordeste",
  description: "O portal oficial do Airsoft no Nordeste.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-900 text-slate-100`}>
        
        {/* NOSSO MENU EXTERNO ENTRA AQUI */}
        <Navbar />

        {/* CONTEÚDO DA PÁGINA */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}