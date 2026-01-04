'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, Trophy, Star } from 'lucide-react';
import { usePuntos } from '../../context/PuntosContext';

// --- CONFIGURACIÓN FOTOS ---
const FOTO_ELLA = "/run/nerea.png"; 
const FOTO_GAME_OVER = "/run/lamine.png";
const FOTOS_MALAS = ["/run/dani.png"]; 
const FOTOS_BUENAS = ["/run/dylan.png", "/run/bimba.png"]; 

// --- VARIABLES FÍSICAS ---
const VELOCIDAD_BASE = 5;  
const GRAVEDAD = 0.6;
const FUERZA_SALTO = 12; 
const MIN_DISTANCIA = 350; 

export default function RunnerGame() {
  const { puntos: puntosGlobales, sumarPuntos } = usePuntos();
  
  const [jugando, setJugando] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [puntosPartida, setPuntosPartida] = useState(0);
  
  const personajeRef = useRef<HTMLDivElement>(null);
  const sombraRef = useRef<HTMLDivElement>(null);
  const montañasRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const scoreRef = useRef(0);
  const distanciaRef = useRef(0); 
  
  const gameState = useRef({
    personajeY: 0,
    velocidadY: 0,
    saltando: false,
    obstaculos: [] as { id: number, x: number, tipo: 'malo'|'bueno', emoji: string, colisionado: boolean }[],
    montañasX: 0
  });

  const saltar = () => {
    if (!jugando || gameOver) return;
    if (gameState.current.personajeY <= 0) {
      gameState.current.velocidadY = FUERZA_SALTO;
      gameState.current.saltando = true;
    }
  };

  // --- MOTOR DEL JUEGO ---
  const update = (time: number) => {
    const velocidadActual = VELOCIDAD_BASE + (distanciaRef.current / 5000) * 1;
    const frecuenciaObstaculos = 0.015 + (distanciaRef.current / 5000) * 0.003;
    
    distanciaRef.current += velocidadActual * 0.5;

    const puntosDistancia = Math.floor(distanciaRef.current / 100);
    if (puntosDistancia > scoreRef.current) {
      scoreRef.current = puntosDistancia;
      setPuntosPartida(scoreRef.current);
    }
    
    gameState.current.personajeY += gameState.current.velocidadY;
    gameState.current.velocidadY -= GRAVEDAD;

    if (gameState.current.personajeY <= 0) {
      gameState.current.personajeY = 0;
      gameState.current.velocidadY = 0;
      gameState.current.saltando = false;
    }

    gameState.current.montañasX -= velocidadActual / 5;
    if (montañasRef.current) {
        montañasRef.current.style.backgroundPositionX = `${gameState.current.montañasX}px`;
    }

    // --- RENDERIZADO VISUAL MEJORADO ---
    if (personajeRef.current) {
        // SOLUCIÓN 2: "Vida" (Bobbing)
        // Calculamos un pequeño movimiento de sube y baja usando el tiempo
        const bobbing = gameState.current.saltando ? 0 : Math.sin(time / 150) * 5; // 5px de movimiento
        
        // Aplicamos la posición Y + el pequeño movimiento de correr
        personajeRef.current.style.transform = `translateY(${-gameState.current.personajeY - bobbing}px)`;
        
        // Rotación al saltar
        personajeRef.current.style.rotate = gameState.current.personajeY > 0 ? '-5deg' : '0deg';
    }

    if (sombraRef.current) {
        // La sombra también se anima ligeramente con el bobbing para más realismo
        const bobbingScale = gameState.current.saltando ? 0 : Math.sin(time / 150) * 0.05;
        const scale = 1 - (gameState.current.personajeY / 150) + bobbingScale;
        const opacity = 0.5 - (gameState.current.personajeY / 200);
        sombraRef.current.style.transform = `scale(${Math.max(0.5, scale)})`; 
        sombraRef.current.style.opacity = `${Math.max(0.2, opacity)}`;
    }

    gameState.current.obstaculos.forEach(obs => {
        obs.x -= velocidadActual;
    });
    
    gameState.current.obstaculos = gameState.current.obstaculos.filter(obs => obs.x > -100);

    const ultimo = gameState.current.obstaculos[gameState.current.obstaculos.length - 1];
    let puedeGenerar = false;
    if (!ultimo || 900 - ultimo.x > MIN_DISTANCIA) {
        puedeGenerar = true;
    }

    if (puedeGenerar && Math.random() < frecuenciaObstaculos) {
        const esMalo = Math.random() > 0.15;
        const lista = esMalo ? FOTOS_MALAS : FOTOS_BUENAS;
        gameState.current.obstaculos.push({
            id: Date.now() + Math.random(),
            x: 1000, 
            tipo: esMalo ? 'malo' : 'bueno',
            emoji: lista[Math.floor(Math.random() * lista.length)],
            colisionado: false
        });
    }

    const pX = 50; const pAncho = 40; const pAlto = 40;  
    for (let obs of gameState.current.obstaculos) {
        if (obs.x > pX - 5 && obs.x < pX + pAncho - 10) {
            if (gameState.current.personajeY < pAlto) {
                if (obs.tipo === 'malo') { dying(); return; } 
                else if (!obs.colisionado && obs.tipo === 'bueno') {
                    obs.colisionado = true;
                    scoreRef.current += 5;
                    setPuntosPartida(scoreRef.current);
                }
            }
        }
    }

    setObjetos([...gameState.current.obstaculos]);
    requestRef.current = requestAnimationFrame(update);
  };

  const [objetos, setObjetos] = useState<any[]>([]);

  useEffect(() => {
    if (jugando && !gameOver) {
        requestRef.current = requestAnimationFrame(update);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [jugando, gameOver]);

  const dying = () => {
    setGameOver(true); setJugando(false);
    if (scoreRef.current > 0) sumarPuntos(scoreRef.current);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const reiniciar = () => {
    gameState.current.obstaculos = []; gameState.current.personajeY = 0; gameState.current.velocidadY = 0; gameState.current.montañasX = 0;
    scoreRef.current = 0; distanciaRef.current = 0; setPuntosPartida(0); setGameOver(false); setJugando(true);
  };

  return (
    <div 
        className="fixed inset-0 w-full h-full overflow-hidden bg-[#87CEEB] touch-none select-none overscroll-none"
        onPointerDown={saltar} 
    >
      <style jsx>{`
        @keyframes moveCloud { from { transform: translateX(100vw); } to { transform: translateX(-150vw); } }
        /* SOLUCIÓN 3: Clase para el borde blanco estilo "Recorte" */
        .imagen-recorte {
            filter: drop-shadow(0 2px 1px rgba(0,0,0,0.1)) /* Sombra sutil abajo */
                    drop-shadow(1px 0 0 white) drop-shadow(-1px 0 0 white) drop-shadow(0 1px 0 white) drop-shadow(0 -1px 0 white); /* Borde blanco */
        }
      `}</style>

      {/* FONDO (CIELO, NUBES, MONTAÑAS) - IGUAL QUE ANTES */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#5F9EA0] to-[#87CEEB] z-0" />
      <div className="absolute top-10 text-white/50 text-7xl" style={{ animation: 'moveCloud 35s linear infinite', left: '-20vw' }}>☁️</div>
      <div className="absolute top-24 text-white/40 text-9xl" style={{ animation: 'moveCloud 25s linear infinite', animationDelay: '-10s', left: '-20vw' }}>☁️</div>
      <div className="absolute top-40 text-white/30 text-6xl" style={{ animation: 'moveCloud 20s linear infinite', animationDelay: '-5s', left: '-20vw' }}>☁️</div>
      <div ref={montañasRef} className="absolute bottom-24 w-full h-48 z-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 320'%3E%3Cpath fill='%234682B4' fill-opacity='0.5' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,256C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3Cpath fill='%236A5ACD' fill-opacity='0.3' d='M0,160L60,170.7C120,181,240,203,360,202.7C480,203,600,181,720,186.7C840,192,960,224,1080,218.7C1200,213,1320,171,1380,149.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: '0px bottom' }} />

      {/* HUD (IGUAL QUE ANTES) */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-40 pointer-events-none">
          <div className="pointer-events-auto">
             <Link href="/juegos" className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center text-sky-600 hover:scale-105 transition-transform border border-white/50">
                <ArrowLeft size={24} strokeWidth={3} />
             </Link>
          </div>
          <div className="flex gap-4">
              <div className="flex flex-col items-center bg-yellow-400/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-[0_4px_0_rgb(202,138,4)] border-2 border-yellow-300"><span className="text-[10px] font-bold text-yellow-900 uppercase tracking-wider">Total</span><div className="flex items-center gap-1 text-yellow-900 font-black text-xl leading-none"><Trophy size={16} /> {puntosGlobales}</div></div>
              <div className="flex flex-col items-center bg-white/80 backdrop-blur-md px-5 py-2 rounded-2xl shadow-lg border border-white/60"><span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider">Puntos</span><div className="flex items-center gap-1 text-sky-600 font-black text-2xl leading-none min-w-[30px] justify-center">{puntosPartida}</div></div>
          </div>
          <div className="w-12"></div>
      </div>

      {/* MUNDO DEL JUEGO */}
      <div className="absolute bottom-0 w-full h-64 z-20 flex items-end">
        <div className="absolute bottom-0 w-full h-28 bg-[#5D4037] border-t-[12px] border-[#7CB342] z-30 shadow-2xl"><div className="absolute top-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/grass.png')]"></div></div>

        {/* PERSONAJE */}
        <div className="absolute left-10 bottom-28 z-40 w-24 h-40 flex justify-center items-end">
             <div ref={sombraRef} className="absolute bottom-2 w-16 h-4 bg-black/30 rounded-[50%] blur-md transition-transform" />
             <div ref={personajeRef} className="relative will-change-transform">
                {/* SOLUCIÓN 1 & 3: Quitamos 'drop-shadow-xl' y añadimos 'imagen-recorte' */}
                <img 
                    src={gameOver ? FOTO_GAME_OVER : FOTO_ELLA} 
                    alt="Personaje"
                    className="w-20 h-20 object-contain imagen-recorte" 
                    style={{ filter: gameOver ? 'grayscale(100%) brightness(0.8)' : 'none', transition: 'filter 0.3s' }}
                />
             </div>
        </div>

        {/* OBSTÁCULOS */}
        {objetos.map(obj => (
            <div key={obj.id} className="absolute z-30 flex flex-col items-center justify-end" style={{ left: `${obj.x}px`, bottom: '110px', width: '60px', height: '60px' }}>
               {obj.colisionado ? (
                  <div className="absolute -top-12 flex flex-col items-center animate-bounce">
                      <span className="text-yellow-400 font-black text-xl text-shadow-sm">+5</span>
                      <Star fill="gold" className="text-yellow-400 w-8 h-8 drop-shadow-md" />
                  </div>
               ) : (
                  <>
                    {/* SOLUCIÓN 1 & 3: Quitamos 'drop-shadow-lg' y añadimos 'imagen-recorte' */}
                    <img 
                        src={obj.emoji} 
                        alt="Objeto"
                        className={`w-16 h-16 object-contain imagen-recorte ${obj.tipo === 'bueno' ? 'animate-pulse' : ''}`}
                    />
                    <div className="w-12 h-3 bg-black/20 rounded-[50%] blur-[2px] mt-[-8px]" />
                  </>
               )}
            </div>
        ))}
      </div>

      {/* MENÚS (IGUAL QUE ANTES) */}
      {!jugando && !gameOver && (
         <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] z-50 flex flex-col items-center justify-center">
             <div className="bg-white p-6 rounded-3xl shadow-2xl text-center border-4 border-white/50 animate-in zoom-in duration-300">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner"><Play className="text-green-500 ml-2" size={40} fill="currentColor" /></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Lista para correr?</h2>
                <button onPointerDown={(e) => { e.stopPropagation(); setJugando(true); }} className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-4 rounded-xl font-bold text-2xl shadow-lg active:scale-95 transition-transform border-b-4 border-green-700 mt-4">¡A CORRER!</button>
             </div>
         </div>
      )}

      {gameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-500/30 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-[85%] text-center border-4 border-red-100 animate-in slide-in-from-bottom duration-300">
                <div className="relative mx-auto mb-4 w-28 h-28">
                     <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20"></div>
                     {/* SOLUCIÓN 3: Borde también en el Game Over */}
                     <img src={FOTO_GAME_OVER} alt="Game Over" className="w-28 h-28 object-contain relative z-10 imagen-recorte rotate-12" />
                </div>
                <h2 className="text-3xl font-black text-red-500 mb-1 uppercase tracking-wider">¡Ups!</h2>
                <p className="text-gray-400 mb-4 font-medium text-lg">Puntuación: {puntosPartida}</p>
                <button onPointerDown={(e) => { e.stopPropagation(); reiniciar(); }} className="w-full bg-gradient-to-r from-sky-400 to-blue-600 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform border-b-4 border-blue-800"><RotateCcw size={20} strokeWidth={3} /> REINTENTAR</button>
            </div>
        </div>
      )}
    </div>
  );
}