'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Timer, Move } from 'lucide-react';
import { usePuntos } from '@/app/context/PuntosContext';
import confetti from 'canvas-confetti';
import Image from 'next/image';

// 1. TUS ELEMENTOS (Manteniendo tus nombres exactos)
const ELEMENTOS = [
  { id: 1, type: 'img', content: "/run/foto1.png", alt: "Nerea" },
  { id: 2, type: 'img', content: "/run/foto2.png", alt: "Dani" },
  { id: 3, type: 'img', content: "/run/foto3.png", alt: "Bimba" },
  { id: 4, type: 'img', content: "/run/foto4.png", alt: "Dylan" },
  { id: 5, type: 'img', content: "/run/foto5.png", alt: "Lamine" }, 
  { id: 6, type: 'img', content: "/run/foto6.png", alt: "Corazon" }, 
];

export default function MemoryGame() {
  const { agregarPuntos } = usePuntos();
  const [cartas, setCartas] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]); 
  const [solved, setSolved] = useState<number[]>([]);   
  const [bloqueo, setBloqueo] = useState(false);        
  const [premioOtorgado, setPremioOtorgado] = useState(false);
  
  // ESTADÍSTICAS
  const [movimientos, setMovimientos] = useState(0);
  const [tiempo, setTiempo] = useState(0);
  const [juegoActivo, setJuegoActivo] = useState(false);
  const [puntosGanados, setPuntosGanados] = useState(0); 

  // Cronómetro
  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (juegoActivo && !premioOtorgado) {
      intervalo = setInterval(() => {
        setTiempo((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [juegoActivo, premioOtorgado]);

  const iniciarJuego = () => {
    const mazo = [...ELEMENTOS, ...ELEMENTOS]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ ...item, uniqueId: index }));
    
    setCartas(mazo);
    setFlipped([]);
    setSolved([]);
    setBloqueo(false);
    setPremioOtorgado(false);
    setMovimientos(0);
    setTiempo(0);
    setPuntosGanados(0);
    setJuegoActivo(true);
  };

  useEffect(() => {
    iniciarJuego();
  }, []);

  // LÓGICA DE VICTORIA Y PUNTOS
  useEffect(() => {
    if (cartas.length > 0 && solved.length === ELEMENTOS.length && !premioOtorgado) {
      setPremioOtorgado(true);
      setJuegoActivo(false);

      const movimientosExtra = Math.max(0, movimientos - 6);
      const puntosCalculados = Math.max(10, 100 - (movimientosExtra * 5));
      
      setPuntosGanados(puntosCalculados);
      agregarPuntos(puntosCalculados); 

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
         navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  }, [solved, premioOtorgado, agregarPuntos, cartas.length, movimientos]);

  const handleCardClick = (uniqueId: number, id: number) => {
    if (bloqueo || flipped.includes(uniqueId) || solved.includes(id)) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);

    const nuevosFlipped = [...flipped, uniqueId];
    setFlipped(nuevosFlipped);

    if (nuevosFlipped.length === 2) {
      setBloqueo(true);
      setMovimientos(prev => prev + 1); 
      
      const primerId = cartas.find(c => c.uniqueId === nuevosFlipped[0]).id;
      
      if (primerId === id) {
        setSolved([...solved, id]);
        setFlipped([]);
        setBloqueo(false);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 50]);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setBloqueo(false);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-pink-50 to-pink-100 flex flex-col">
      
      {/* Cabecera */}
      <div className="p-4 flex justify-between items-center shrink-0">
        <Link href="/juegos" className="p-2 bg-white rounded-xl shadow-sm text-pink-500 hover:scale-105 transition">
            <ArrowLeft size={24} />
        </Link>
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-black text-pink-600 tracking-tight">MEMORY</h1>
            <span className="text-xs text-pink-400 font-medium tracking-widest uppercase">Love Edition</span>
        </div>
        <button onClick={iniciarJuego} className="p-2 bg-white rounded-xl shadow-sm text-pink-500 hover:rotate-180 transition duration-500">
            <RefreshCw size={24} />
        </button>
      </div>

      {/* Barra de Estadísticas */}
      <div className="flex justify-center gap-6 mb-2 text-pink-700 font-bold text-sm shrink-0">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Timer size={16} /> {formatTime(tiempo)}
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <Move size={16} /> {movimientos}
        </div>
      </div>

      {/* Tablero de Cartas Ajustado */}
      <div className="flex-1 flex items-center justify-center p-2">
        {/* CAMBIO: max-w-xs (más pequeño) y gap-2 (más junto) */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-xs perspective-1000">
            {cartas.map((carta) => {
            const estaGirada = flipped.includes(carta.uniqueId) || solved.includes(carta.id);
            const estaResuelta = solved.includes(carta.id);

            return (
                <div
                key={carta.uniqueId}
                onClick={() => handleCardClick(carta.uniqueId, carta.id)}
                className={`
                    aspect-square relative cursor-pointer group perspective-1000
                `}
                style={{ transformStyle: 'preserve-3d' }}
                >
                <div className={`
                    w-full h-full duration-500 preserve-3d absolute
                    ${estaGirada ? 'rotate-y-180' : ''}
                    transition-transform
                `}
                style={{ 
                    transform: estaGirada ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transformStyle: 'preserve-3d'
                }}>
                    
                    {/* PARTE TRASERA */}
                    <div className={`
                        absolute w-full h-full backface-hidden
                        bg-white border-4 border-pink-200 rounded-xl flex items-center justify-center shadow-md
                    `}
                    style={{ backfaceVisibility: 'hidden' }}
                    >
                    <span className="text-2xl opacity-50">🌸</span>
                    </div>

                    {/* PARTE DELANTERA */}
                    <div className={`
                        absolute w-full h-full backface-hidden
                        rounded-xl flex items-center justify-center shadow-xl overflow-hidden
                        ${estaResuelta ? 'ring-2 ring-green-400 shadow-green-200' : 'ring-2 ring-pink-500'}
                        bg-white
                    `}
                    style={{ 
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden' 
                    }}
                    >
                        {carta.type === 'img' ? (
                            <div className="relative w-full h-full p-0.5">
                                <Image 
                                    src={carta.content} 
                                    alt={carta.alt || "foto"}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                        ) : (
                            <span className="text-3xl">{carta.content}</span>
                        )}
                        
                        {estaResuelta && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            );
            })}
        </div>
      </div>
      
      {/* Mensaje Flotante */}
      {premioOtorgado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-pink-100 transform animate-bounce-in">
                <h2 className="text-3xl font-black text-pink-600 mb-2">
                    ¡GANASTE! 🎉
                </h2>
                <div className="text-gray-600 space-y-2 mb-6 text-lg">
                    <p>Tiempo: <b>{formatTime(tiempo)}</b></p>
                    <p>Movimientos: <b>{movimientos}</b></p>
                </div>
                
                <div className="flex flex-col gap-3">
                    <div className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold text-xl border border-yellow-200 shadow-sm">
                        +{puntosGanados} puntos 💰
                    </div>
                    <button 
                        onClick={iniciarJuego}
                        className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold shadow-lg hover:bg-pink-600 transition active:scale-95"
                    >
                        Jugar otra vez
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}