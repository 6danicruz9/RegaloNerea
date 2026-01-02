import type { Metadata } from "next";
import { Nunito, Pacifico } from "next/font/google"; // Nunito para leer bien, Pacifico para títulos
import "./globals.css";
import Link from "next/link";
import { Home, Heart, Gamepad2, Gift } from "lucide-react"; // Iconos importados
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
      <body className={`${nunito.variable} ${pacifico.variable} font-sans`}>
        <PuntosProvider>
          {/* Aquí se cargan las páginas (El contenido) */}
          <div className="pb-24 bg-pink-50 min-h-screen">
              {children}
          </div>

          {/* BARRA DE NAVEGACIÓN INFERIOR (Estilo App Móvil) */}
          <nav className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white border-t border-pink-100 flex justify-around items-center shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-pink-600 transition-colors">
                <Home size={26} />
                <span className="text-[10px] font-medium mt-1">Inicio</span>
            </Link>

            <Link href="/historia" className="flex flex-col items-center text-gray-400 hover:text-pink-600 transition-colors">
                <Heart size={26} />
                <span className="text-[10px] font-medium mt-1">Historia</span>
            </Link>

            <Link href="/juegos" className="flex flex-col items-center text-gray-400 hover:text-pink-600 transition-colors">
                <Gamepad2 size={26} />
                <span className="text-[10px] font-medium mt-1">Juegos</span>
            </Link>

            <Link href="/regalos" className="flex flex-col items-center text-gray-400 hover:text-pink-600 transition-colors">
                <Gift size={26} />
                <span className="text-[10px] font-medium mt-1">Vales</span>
            </Link>

          </nav>
        </PuntosProvider>
      </body>
    </html>
  );
}