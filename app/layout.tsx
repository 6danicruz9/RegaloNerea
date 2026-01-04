import type { Metadata } from "next";
import { Nunito, Pacifico } from "next/font/google"; 
import "./globals.css";
// 1. IMPORTAMOS EL MENÚ NUEVO (Asegúrate de haber creado el archivo del paso 1)
import MenuInferior from "./components/menuinferior"; 
import { PuntosProvider } from "./context/PuntosContext";

const nunito = Nunito({ subsets: ["latin"], variable: '--font-nunito' });
const pacifico = Pacifico({ weight: '400', subsets: ["latin"], variable: '--font-pacifico' });

export const metadata: Metadata = {
  title: "Para Nerea",
  description: "Hecho con amor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} ${pacifico.variable} font-sans h-screen w-screen overflow-hidden flex flex-col`}>
        <PuntosProvider>
          
          {/* El contenido de las páginas */}
          <div className="overflow-y-auto flex-1 pb-24 bg-pink-50 scrollbar-hide">
              {children}
          </div>

          {/* 2. AQUÍ PONEMOS EL COMPONENTE (Se ocultará solo en login) */}
          <MenuInferior />

        </PuntosProvider>
      </body>
    </html>
  );
}