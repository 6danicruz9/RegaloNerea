'use client'; // Esto permite que el juego tenga lógica interactiva

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { usePuntos } from '@/app/context/PuntosContext';
import confetti from 'canvas-confetti';

// 1. TUS ELEMENTOS (Aquí puedes cambiar los emojis por lo que quieras)
const ELEMENTOS = [
  { id: 1, content: "🍕" },
  { id: 2, content: "✈️" },
  { id: 3, content: "😻" },
  { id: 4, content: "💍" },
  { id: 5, content: "🏠" },
  { id: 6, content: "🌹" },
];

export default function MemoryGame() {
  const { agregarPuntos } = usePuntos();
  const [cartas, setCartas] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]); // Cartas giradas
  const [solved, setSolved] = useState<number[]>([]);   // Parejas encontradas
  const [bloqueo, setBloqueo] = useState(false);        // Para que no pueda clicar rápido
  const [premioOtorgado, setPremioOtorgado] = useState(false); // Para evitar múltiples confeti

  // FUNCIÓN: Mezclar las cartas
  const iniciarJuego = () => {
    const mazo = [...ELEMENTOS, ...ELEMENTOS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ ...item, uniqueId: index }));
    
    setCartas(mazo);
    setFlipped([]);
    setSolved([]);
    setBloqueo(false);
  };

  // Arrancar el juego al entrar
  useEffect(() => {
    iniciarJuego();
  }, []);

  // Cuando ganas, mostrar confeti automáticamente
  useEffect(() => {
    if (solved.length === ELEMENTOS.length && !premioOtorgado) {
      setPremioOtorgado(true);
      agregarPuntos(75); // Agregar 75 puntos automáticamente
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [solved, premioOtorgado, agregarPuntos]);

  // LÓGICA: Cuando haces click en una carta
  const handleCardClick = (uniqueId: number, id: number) => {
    // Si ya está girada, o resuelta, o el tablero bloqueado -> No hacer nada
    if (bloqueo || flipped.includes(uniqueId) || solved.includes(id)) return;

    const nuevosFlipped = [...flipped, uniqueId];
    setFlipped(nuevosFlipped);

    // Si es la segunda carta...
    if (nuevosFlipped.length === 2) {
      setBloqueo(true);
      const primerId = cartas.find(c => c.uniqueId === nuevosFlipped[0]).id;
      
      if (primerId === id) {
        // ACIERTO
        setSolved([...solved, id]);
        setFlipped([]);
        setBloqueo(false);
      } else {
        // FALLO (Esperar 1 segundo y girar)
        setTimeout(() => {
          setFlipped([]);
          setBloqueo(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-2 pb-24">
      {/* Cabecera con botón de volver */}
      <div className="flex justify-between items-center mb-3 mt-2">
        <Link href="/juegos" className="p-1 bg-white rounded-full shadow text-pink-500">
            <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-pink-600">Memory</h1>
        <button onClick={iniciarJuego} className="p-1 bg-white rounded-full shadow text-pink-500">
            <RefreshCw size={20} />
        </button>
      </div>

      {/* Tablero de Cartas */}
      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {cartas.map((carta) => {
          const estaGirada = flipped.includes(carta.uniqueId) || solved.includes(carta.id);
          const estaResuelta = solved.includes(carta.id);

          return (
            <div
              key={carta.uniqueId}
              onClick={() => handleCardClick(carta.uniqueId, carta.id)}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-2xl shadow-sm cursor-pointer transition-all duration-500
                ${estaGirada ? 'bg-white rotate-0' : 'bg-pink-400 rotate-180'}
                ${estaResuelta ? 'opacity-0 scale-0' : ''} 
              `}
              // Nota: Cuando aciertas, la carta desaparece (opacity-0). Si prefieres que se quede, quita esa línea.
            >
              {estaGirada ? carta.content : '❓'}
            </div>
          );
        })}
      </div>
      
      {/* Mensaje si gana */}
      {solved.length === ELEMENTOS.length && (
        <div 
          className="mt-4 p-4 bg-white rounded-xl shadow-lg text-center animate-bounce max-w-sm mx-auto"
        >
            <h2 className="text-xl font-bold text-pink-600 mb-1">¡Lo conseguiste! 🎉</h2>
            <p className="text-sm text-gray-600 mb-1">Eres increíble.</p>
            <p className="text-base font-bold text-yellow-600">+75 puntos 💰</p>
        </div>
      )}
    </div>
  );
}