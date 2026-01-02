import Link from "next/link";
import { Puzzle, HelpCircle, Zap } from "lucide-react"; // Importamos Zap para el icono del rayo

export default function MenuJuegos() {
  return (
    <div className="p-6 flex flex-col gap-6 pt-10">
      <h1 className="text-3xl font-bold text-pink-600 mb-2 text-center">Zona de Juegos</h1>
      <p className="text-center text-gray-500 mb-4">Gana puntos para desbloquear tu regalo final</p>
      
      {/* JUEGO 1: Memory */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Puzzle size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Memory Love</h2>
            <p className="text-xs text-gray-400">Encuentra las parejas</p>
          </div>
        </div>
        <Link href="/juegos/memory" className="block w-full text-center bg-blue-500 text-white py-3 rounded-xl font-bold shadow active:scale-95 transition-transform">
          Jugar Ahora
        </Link>
      </div>

      {/* JUEGO 2: Runner (NUEVO) */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-pink-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <Zap size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Runner Nerea</h2>
            <p className="text-xs text-gray-400">Esquiva lo malo, coge lo bueno</p>
          </div>
        </div>
        <Link href="/juegos/run" className="block w-full text-center bg-green-500 text-white py-3 rounded-xl font-bold shadow active:scale-95 transition-transform">
          Jugar Ahora
        </Link>
      </div>

      {/* JUEGO 3: Quiz (Próximamente) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 opacity-60">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <HelpCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Quiz Nerea</h2>
        </div>
        <button className="w-full bg-gray-200 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed">
          Próximamente
        </button>
      </div>

    </div>
  );
}