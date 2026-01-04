'use client'; // <--- Esto es lo que le da "inteligencia"

import Link from "next/link";
import { Home, Heart, Gamepad2, Gift } from "lucide-react";
import { usePathname } from 'next/navigation'; // Para saber dónde estamos

export default function MenuInferior() {
  const rutaActual = usePathname();

  // SI ESTAMOS EN LOGIN, NO MOSTRAMOS NADA
  if (rutaActual === '/login') {
    return null;
  }

  return (
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
          <span className="text-[10px] font-medium mt-1">Cupones</span>
      </Link>

    </nav>
  );
}