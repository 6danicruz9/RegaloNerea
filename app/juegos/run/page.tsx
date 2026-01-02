'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';

// --- CONFIGURACIÓN DE FOTOS ---
const FOTO_ELLA = "/run/nerea.png"; 
const FOTO_GAME_OVER = "/run/lamine.png";

const FOTOS_MALAS = [
  "/run/dani.png"
  // Añade más aquí...
]; 

const FOTOS_BUENAS = [
  "/run/dylan.png",
  "/run/bimba.png"  
  // Añade más aquí...
]; 

const VELOCIDAD_BASE = 5;  
const GRAVEDAD = 0.6;
const FUERZA_SALTO = 12;
const MIN_DISTANCIA = 350; 

export default function RunnerGame() {
  const [jugando, setJugando] = useState(false);
  const [puntos, setPuntos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  const personajeRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const scoreRef = useRef(0);
  
  const gameState = useRef({
    personajeY: 0,
    velocidadY: 0,
    saltando: false,
    obstaculos: [] as { id: number, x: number, tipo: 'malo'|'bueno', emoji: string, colisionado: boolean }[],
    lastTime: 0
  });

  // --- SALTAR ---
  const saltar = () => {
    if (!jugando || gameOver) return;
    if (gameState.current.personajeY <= 0) {
      gameState.current.velocidadY = FUERZA_SALTO;
      gameState.current.saltando = true;
    }
  };

  // --- MOTOR DEL JUEGO ---
  const update = (time: number) => {
    // Calcular velocidad actual basada en puntos (aumenta cada 50 puntos)
    const velocidadActual = VELOCIDAD_BASE + (scoreRef.current / 50) * 1.5;
    const frecuenciaObstaculos = 0.015 + (scoreRef.current / 100) * 0.005; // También aumenta la frecuencia
    
    // 1. Físicas Personaje
    gameState.current.personajeY += gameState.current.velocidadY;
    gameState.current.velocidadY -= GRAVEDAD;

    if (gameState.current.personajeY <= 0) {
      gameState.current.personajeY = 0;
      gameState.current.velocidadY = 0;
      gameState.current.saltando = false;
    }

    if (personajeRef.current) {
        personajeRef.current.style.bottom = `${gameState.current.personajeY}px`;
    }

    // 2. Mover Obstáculos (con velocidad dinámica)
    gameState.current.obstaculos.forEach(obs => {
        obs.x -= velocidadActual;
    });
    
    gameState.current.obstaculos = gameState.current.obstaculos.filter(obs => obs.x > -50);

    // --- GENERACIÓN INTELIGENTE ---
    const ultimo = gameState.current.obstaculos[gameState.current.obstaculos.length - 1];
    
    let puedeGenerar = false;
    if (!ultimo) {
        puedeGenerar = true;
    } else {
        if (800 - ultimo.x > MIN_DISTANCIA) {
            puedeGenerar = true;
        }
    }

    if (puedeGenerar) {
        if (Math.random() < frecuenciaObstaculos) {
            const esMalo = Math.random() > 0.4;
            const lista = esMalo ? FOTOS_MALAS : FOTOS_BUENAS; // <--- CORREGIDO: Usamos las listas de fotos
            
            gameState.current.obstaculos.push({
                id: Date.now() + Math.random(),
                x: 800, 
                tipo: esMalo ? 'malo' : 'bueno',
                emoji: lista[Math.floor(Math.random() * lista.length)],
                colisionado: false
            });
        }
    }

    // 3. Colisiones
    const pX = 50; 
    const pAncho = 40; 
    
    for (let obs of gameState.current.obstaculos) {
        if (obs.x > pX && obs.x < pX + pAncho) {
            if (gameState.current.personajeY < 40) {
                if (obs.tipo === 'malo') {
                    morir();
                    return; 
                } else if (!obs.colisionado && obs.tipo === 'bueno') {
                    obs.colisionado = true;
                    // obs.emoji = "✨"; // <--- COMENTADO: No sobreescribimos la ruta con un emoji para no romper la imagen
                    scoreRef.current += 10;
                    setPuntos(scoreRef.current);
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
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [jugando, gameOver]);

  const morir = () => {
    setGameOver(true);
    setJugando(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const reiniciar = () => {
    gameState.current.obstaculos = [];
    gameState.current.personajeY = 0;
    gameState.current.velocidadY = 0;
    scoreRef.current = 0;
    setPuntos(0);
    setGameOver(false);
    setJugando(true);
  };

  return (
    <div 
        className="min-h-screen bg-blue-50 flex flex-col items-center overflow-hidden pb-24 touch-none select-none" 
        onPointerDown={saltar} 
    >
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow font-bold text-xl text-blue-600 z-10">
        Puntos: {puntos}
      </div>

      <div className="absolute top-4 left-4 z-10">
         <Link href="/juegos" className="p-2 bg-white rounded-full shadow text-gray-600 block">
            <ArrowLeft />
         </Link>
      </div>

      <h1 className="mt-16 text-2xl font-bold text-blue-300 opacity-50">Toca para saltar</h1>

      <div className="relative w-full max-w-2xl h-64 bg-white border-b-4 border-gray-400 mt-8 overflow-hidden">
        
        {/* --- CAMBIO PRINCIPAL AQUÍ (FOTOS DEL PERSONAJE) --- */}
        <div 
            ref={personajeRef}
            className="absolute left-12 z-20 will-change-transform"
            style={{ bottom: '0px' }} 
        >
            <img 
                src={gameOver ? FOTO_GAME_OVER : FOTO_ELLA} 
                alt="Personaje"
                className="w-20 h-20 object-contain pointer-events-none" 
            />
        </div>

        {/* --- CAMBIO PRINCIPAL AQUÍ (FOTOS DE OBJETOS) --- */}
        {objetos.map(obj => (
            <div 
                key={obj.id}
                className="absolute will-change-transform flex items-end"
                style={{ left: `${obj.x}px`, bottom: '0px', height: '60px' }}
            >
               {obj.colisionado ? (
                  <span className="text-4xl animate-ping">✨</span>
               ) : (
                  <img 
                    src={obj.emoji} 
                    alt="Objeto"
                    className="w-14 h-14 object-contain pointer-events-none"
                  />
               )}
            </div>
        ))}

      </div>

      {!jugando && !gameOver && (
         <button 
            onPointerDown={(e) => { e.stopPropagation(); setJugando(true); }} 
            className="mt-8 bg-green-500 text-white px-8 py-3 rounded-xl font-bold text-xl shadow-lg animate-pulse flex items-center gap-2 z-30"
         >
            <Play fill="white" /> EMPEZAR
         </button>
      )}

      {gameOver && (
        <div className="mt-8 text-center bg-red-600 p-8 rounded-3xl shadow-2xl z-30 max-w-xl mx-auto">
            <img 
                src={FOTO_GAME_OVER} 
                alt="Game Over"
                className="w-48 h-48 object-contain mx-auto mb-6" 
            />
            <h2 className="text-5xl font-bold text-white mb-4">¡GAME OVER!</h2>
            <p className="text-white text-lg mb-4">Te chocaste.</p>
            <p className="text-2xl font-bold mb-6 text-yellow-300">Puntuación: {puntos}</p>
            <button 
                onPointerDown={(e) => { e.stopPropagation(); reiniciar(); }} 
                className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto hover:bg-blue-600 transition"
            >
                <RotateCcw /> Reintentar
            </button>
        </div>
      )}
    </div>
  );
}