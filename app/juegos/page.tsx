import Link from "next/link";
import { Puzzle, HelpCircle, Zap } from "lucide-react";

export default function MenuJuegos() {
  return (
    <div className="p-6 pt-10 pb-24 min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 flex flex-col gap-8">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-black text-pink-600 mb-3 text-center font-[family-name:var(--font-pacifico)] drop-shadow-sm">Zona de Juegos</h1>
        <p className="text-center text-gray-500 font-medium text-lg">Gana puntos para desbloquear tu regalo final</p>
      </div>
      
      {/* JUEGO 1: Memory */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl shadow-lg border-2 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 transform">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full shadow-lg">
            <Puzzle size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-blue-700">Memoria</h2>
            <p className="text-sm text-gray-600 font-medium">Me dijiste que te gustaba</p>
          </div>
        </div>
        <Link href="/juegos/memory" className="block w-full text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all hover:from-blue-600 hover:to-blue-700">
          🎮 Jugar
        </Link>
      </div>

      {/* JUEGO 2: Runner */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-3xl shadow-lg border-2 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 transform">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full shadow-lg">
            <Zap size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-green-700">Corre Pocha</h2>
            <p className="text-sm text-gray-600 font-medium">Esquiva lo malo, coge lo bueno</p>
          </div>
        </div>
        <Link href="/juegos/run" className="block w-full text-center bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all hover:from-green-600 hover:to-emerald-700">
          ⚡ Jugar
        </Link>
      </div>

      {/* JUEGO 3: Quiz (Próximamente) */}
      <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-3xl shadow-md border-2 border-purple-200 opacity-70 cursor-not-allowed">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-full shadow-lg">
            <HelpCircle size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-purple-700">Quiz Nerea</h2>
            <p className="text-sm text-purple-600 font-medium">Demuestra lo que sabes</p>
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-purple-300 to-purple-400 text-purple-700 py-4 rounded-2xl font-bold cursor-not-allowed text-lg">
          🔒 Próximamente
        </button>
      </div>

    </div>
  );
}