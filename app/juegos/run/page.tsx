'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
// Asegúrate de que la ruta es correcta (si usas @/ o ../..)
import { usePuntos } from '../../context/PuntosContext';

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
  // 1. CORRECCIÓN: Usamos 'sumarPuntos' que es como se llama en el Contexto
  const { puntos: puntosGlobales, sumarPuntos } = usePuntos();
  
  const [jugando, setJugando] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [puntosPartida, setPuntosPartida] = useState(0); // Para ver los puntos MIENTRAS juegas
  
  const personajeRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const scoreRef = useRef(0);
  const distanciaRef = useRef(0); 
  
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
    const velocidadActual = VELOCIDAD_BASE + (distanciaRef.current / 5000) * 1;
    const frecuenciaObstaculos = 0.015 + (distanciaRef.current / 5000) * 0.003;
    
    distanciaRef.current += velocidadActual * 0.5;
    
    // SISTEMA DE PUNTOS: Suma automática por distancia (como el dino de Google)
    // Por cada 100 unidades de distancia, suma 1 punto (ajustado a la velocidad del juego)
    const puntosDistancia = Math.floor(distanciaRef.current / 100);
    if (puntosDistancia > scoreRef.current) {
      scoreRef.current = puntosDistancia;
      setPuntosPartida(scoreRef.current);
    }
    
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

    // 2. Mover Obstáculos
    gameState.current.obstaculos.forEach(obs => {
        obs.x -= velocidadActual;
    });
    
    gameState.current.obstaculos = gameState.current.obstaculos.filter(obs => obs.x > -50);

    // --- GENERACIÓN ---
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
            const esMalo = Math.random() > 0.3; // Ajustado a 30% bueno / 70% malo
            const lista = esMalo ? FOTOS_MALAS : FOTOS_BUENAS;
            
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
                    // Al coger un objeto bueno, suma +5 puntos
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
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [jugando, gameOver]);

  const morir = () => {
    setGameOver(true);
    setJugando(false);
    
    // 2. CORRECCIÓN: Guardamos los puntos en Firebase al morir
    if (scoreRef.current > 0) {
        sumarPuntos(scoreRef.current);
    }
    
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const reiniciar = () => {
    gameState.current.obstaculos = [];
    gameState.current.personajeY = 0;
    gameState.current.velocidadY = 0;
    scoreRef.current = 0;
    distanciaRef.current = 0;
    setPuntosPartida(0); // Reiniciar marcador visual
    setGameOver(false);
    setJugando(true);
  };

  return (
    <div 
        className="min-h-screen bg-blue-50 flex flex-col items-center overflow-hidden pb-24 touch-none select-none" 
        onPointerDown={saltar} 
    >
      {/* Contador GLOBAL (Total acumulado) */}
      <div className="absolute top-4 left-4 bg-yellow-400 px-4 py-2 rounded-full shadow font-bold text-lg text-gray-800 z-10 border-2 border-yellow-500">
        💰 {puntosGlobales}
      </div>
      
      {/* Marcador ACTUAL (Partida en curso) */}
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow font-bold text-xl text-blue-600 z-10 border border-blue-100">
        {/* 3. CORRECCIÓN: Usamos el estado local 'puntosPartida' */}
        +{puntosPartida} pts
      </div>

      <div className="absolute top-4 left-4 z-10 mt-12">
         <Link href="/juegos" className="p-2 bg-white rounded-full shadow text-gray-600 block">
            <ArrowLeft />
         </Link>
      </div>

      <h1 className="mt-24 text-2xl font-bold text-blue-300 opacity-50">Toca para saltar</h1>

      <div className="relative w-full max-w-2xl h-64 bg-white border-b-4 border-gray-400 mt-8 overflow-hidden">
        
        {/* PERSONAJE */}
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

        {/* OBJETOS */}
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
        <div className="mt-8 text-center bg-red-600 p-8 rounded-3xl shadow-2xl z-30 max-w-xl mx-auto border-4 border-red-800">
            <img 
                src={FOTO_GAME_OVER} 
                alt="Game Over"
                className="w-32 h-32 object-contain mx-auto mb-4 bg-white rounded-full p-2" 
            />
            <h2 className="text-4xl font-bold text-white mb-2">¡GAME OVER!</h2>
            <p className="text-white text-lg mb-4">¡Has conseguido {puntosPartida} puntos!</p>
            
            <button 
                onPointerDown={(e) => { e.stopPropagation(); reiniciar(); }} 
                className="bg-white text-red-600 px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-2 mx-auto hover:bg-gray-100 transition shadow-lg"
            >
                <RotateCcw /> Reintentar
            </button>
        </div>
      )}
    </div>
  );
}