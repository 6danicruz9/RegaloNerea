'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { usePuntos } from '@/app/context/PuntosContext';
import confetti from 'canvas-confetti';

interface Cancion {
  id: string;
  titulo: string;
  artista: string;
  audioUrl: string;
  dificultad: 'facil' | 'dificil';
  opciones: string[];
  correcta: number;
}

// TUS CANCIONES (Asegúrate de que los archivos .mp3 existen en /public/canciones/)
const CANCIONES_EJEMPLO: Cancion[] = [
  {
    id: '1',
    titulo: 'Heartbreaker',
    artista: 'D.Valentino',
    audioUrl: '/canciones/heartbreaker.mp3',
    dificultad: 'facil',
    opciones: ['fvck', 'DAMN', 'Heartbreaker', 'Amor de ganster'],
    correcta: 2,
  },
  {
    id: '2',
    titulo: 'AMOR DE GANSTER',
    artista: 'Bon calso',
    audioUrl: '/canciones/amordeganster.mp3',
    dificultad: 'facil',
    opciones: ['Acelerá', 'Amor de ganster', 'MiShawty', 'Niebla'],
    correcta: 1,
  },
  {
    id: '3',
    titulo: 'Nolahay',
    artista: 'Nirvana',
    audioUrl: '/canciones/Nolahay.mp3',
    dificultad: 'dificil',
    opciones: ['Nolahay', 'Consentia', 'Si me miras asi', 'B A E 2.0'],
    correcta: 0,
  },
  {
    id: '4',
    titulo: 'Tengan Mi Sangre',
    artista: 'DELLAFUENTE',
    audioUrl: '/canciones/tenganmisangre.mp3',
    dificultad: 'dificil',
    opciones: ['Tengan Mi Sangre', 'Nolahay', 'Cuando me acerco a ti', 'No importa que llueva'],
    correcta: 0,
  },
  {
    id: '5',
    titulo: 'Mi Teatro',
    artista: 'Dani Martin',
    audioUrl: '/canciones/miteatro.mp3',
    dificultad: 'facil',
    opciones: ['Mi Teatro', 'Te Como La Cara', 'Emocional', 'Como te amo yo'],
    correcta: 0,
  },
  {
    id: '6',
    titulo: 'Te Como La Cara',
    artista: 'DELLAFUENTE',
    audioUrl: '/canciones/tecomolacara.mp3',
    dificultad: 'facil',
    opciones: ['Mi Teatro', 'Te Como La Cara', 'Emocional', 'Tocate Sola'],
    correcta: 1,
  },
  {
    id: '7',
    titulo: 'Emocional',
    artista: 'Dani Martin',
    audioUrl: '/canciones/emocional.mp3',
    dificultad: 'dificil',
    opciones: ['Nolahay', 'Te Como La Cara', 'Emocional', 'Amor de ganster'],
    correcta: 2,
  },
  {
    id: '8',
    titulo: 'Every Breath You Take',
    artista: 'The Police',
    audioUrl: '/canciones/EveryBreathYouTake.mp3',
    dificultad: 'dificil',
    opciones: ['Every Breath You Take', 'Siempre sale el sol', 'Kisiera yo saber', 'De MENoS'],
    correcta: 0,
  },
  {
    id: '9',
    titulo: 'MAI',
    artista: 'Milo J',
    audioUrl: '/canciones/mai.mp3',
    dificultad: 'dificil',
    opciones: ['Si me miras asi', 'Aiunii', 'MAI', 'De MENoS'],
    correcta: 2,
  },
  {
    id: '10',
    titulo: 'B A E 2.0',
    artista: 'Yapi',
    audioUrl: '/canciones/bae2.mp3',
    dificultad: 'dificil',
    opciones: ['B A E 2.0', 'Seduceme', 'MAI', 'CRACY'],
    correcta: 0,
  },
  {
    id: '11',
    titulo: 'Cuando me acerco a ti',
    artista: 'Danny Ocean',
    audioUrl: '/canciones/cuandomeacercoati.mp3',
    dificultad: 'dificil',
    opciones: ['FREE LOVE', 'Cuando me acerco a ti', 'Aiunii', 'BoKeTe'],
    correcta: 1,
  },
  {
    id: '12',
    titulo: 'Aunii',
    artista: 'Jay Wheeler',
    audioUrl: '/canciones/aiunii.mp3',
    dificultad: 'dificil',
    opciones: ['Tengan mi sangre', 'No le caigo', 'Aiunii', 'Ven abrazame'],
    correcta: 2,
  },
  
];

export default function AdivinaCancion() {
  const { puntos, agregarPuntos } = usePuntos();
  
  // ESTADOS
  const [canciones, setCanciones] = useState<Cancion[]>(CANCIONES_EJEMPLO);
  const [cancionActual, setCancionActual] = useState<Cancion | null>(null);
  
  // NUEVO: Historial de canciones jugadas para no repetir
  const [jugadas, setJugadas] = useState<string[]>([]); 

  const [reproduciendo, setReproduciendo] = useState(false);
  const [racha, setRacha] = useState(0);
  const [respondido, setRespondido] = useState(false);
  const [respuestaCorrecta, setRespuestaCorrecta] = useState<boolean | null>(null);
  const [dificultad, setDificultad] = useState<'facil' | 'dificil' | 'todas'>('todas');
  const [puntosTotales, setPuntosTotales] = useState(0);
  const [cancionTerminada, setCancionTerminada] = useState(false);
  const [todasJugadas, setTodasJugadas] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- LÓGICA DE SELECCIÓN INTELIGENTE ---
  const cargarCancion = () => {
    if (canciones.length === 0) return;
    
    // 1. Filtramos por dificultad si hiciera falta
    let cancionesDisponibles = canciones;
    if (dificultad !== 'todas') {
      cancionesDisponibles = canciones.filter(c => c.dificultad === dificultad);
    }
    
    if (cancionesDisponibles.length === 0) return;

    // 2. Filtramos las que NO se han jugado todavía
    const cancionesNoJugadas = cancionesDisponibles.filter(c => !jugadas.includes(c.id));

    let nuevaCancion: Cancion;

    // 3. Si ya salieron todas, mostramos el mensaje de límite
    if (cancionesNoJugadas.length === 0) {
      setTodasJugadas(true); // Mostrar modal de límite alcanzado
      return;
    } else {
      // 4. Si quedan libres, elegimos una al azar de esas
      const random = Math.floor(Math.random() * cancionesNoJugadas.length);
      nuevaCancion = cancionesNoJugadas[random];
      // La añadimos al historial
      setJugadas([...jugadas, nuevaCancion.id]);
    }

    setCancionActual(nuevaCancion);
    
    // Reseteamos interfaz
    setRespondido(false);
    setRespuestaCorrecta(null);
    setReproduciendo(false);
    setPuntosTotales(0);
    setCancionTerminada(false);
  };

  useEffect(() => {
    // Cargar primera canción al entrar
    if (canciones.length > 0 && !cancionActual) {
      cargarCancion();
    }
  }, [canciones]);

  const reproducirCancion = () => {
    if (!audioRef.current || !cancionActual) return;
    
    if (reproduciendo) {
      audioRef.current.pause();
      setReproduciendo(false);
      // Cancelamos el timeout si el usuario pausa manual
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Error audio:", e));
      setReproduciendo(true);
      
      // Detener después de 3 segundos
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        audioRef.current?.pause();
        setReproduciendo(false);
        setCancionTerminada(true);
      }, 3000); // 3000ms = 3 segundos
    }
  };

  const responder = (indice: number) => {
    if (respondido || !cancionActual) return;
    
    const esCorrecta = indice === cancionActual.correcta;
    setRespuestaCorrecta(esCorrecta);
    setRespondido(true);

    if (esCorrecta) {
      // Cálculo de puntos: base 10 + racha + bonus dificultad
      const multiplicador = 1 + racha * 0.1;
      const puntosGanados = Math.floor(10 * multiplicador * (cancionActual.dificultad === 'dificil' ? 1.5 : 1));
      
      agregarPuntos(puntosGanados);
      setPuntosTotales(puntosGanados);
      setRacha(racha + 1);
      
      confetti({ 
        particleCount: 100, 
        spread: 60, 
        origin: { y: 0.6 }, 
        colors: ['#ec4899', '#fbbf24'] 
      });
    } else {
      setRacha(0);
    }
  };

  const siguienteCancion = () => {
    cargarCancion();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-6 pb-24 font-[family-name:var(--font-nunito)]">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center mb-8 pt-4">
        <Link href="/juegos" className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow">
          <Home size={24} className="text-purple-600" />
        </Link>
        <div className="text-center">
          <h1 className="text-3xl font-black text-purple-600 font-[family-name:var(--font-pacifico)]">Adivina la Canción</h1>
          <p className="text-sm text-gray-500 font-bold">Racha: {racha} 🔥 | Puntos: {puntos}</p>
        </div>
        <div className="w-20 h-20 bg-yellow-100 rounded-full shadow-md flex items-center justify-center border-2 border-yellow-200">
          <div className="text-center">
            <p className="text-2xl">💰</p>
            <p className="text-sm font-black text-yellow-700">{puntos}</p>
          </div>
        </div>
      </div>

      {/* JUEGO */}
      {cancionActual ? (
        <motion.div 
          key={cancionActual.id} // Clave para animar cambio de canción
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md mx-auto"
        >
          {/* TARJETA REPRODUCTOR */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-3xl shadow-2xl mb-8 border-4 border-purple-300 relative overflow-hidden">
            {/* Círculos decorativos fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
            
            <div className="text-center mb-8 relative z-10">
              <motion.div
                animate={{ scale: reproduciendo ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 0.6, repeat: reproduciendo ? Infinity : 0 }}
                className="text-8xl mb-4 drop-shadow-lg"
              >
                🎧
              </motion.div>
              <h2 className="text-white text-xl font-bold mb-1">Escucha 3 segundos</h2>
              <p className="text-purple-200 text-xs uppercase tracking-widest font-semibold">¿Te suena?</p>
            </div>

            <button
              onClick={reproducirCancion}
              disabled={respondido}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg ${
                respondido
                  ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                  : reproduciendo
                  ? 'bg-red-500 hover:bg-red-600 ring-2 ring-red-300'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:brightness-110 ring-2 ring-purple-400'
              }`}
            >
              {reproduciendo ? (
                <> <Pause size={24} fill="currentColor" /> Pausar </>
              ) : (
                <> <Play size={24} fill="currentColor" /> Reproducir </>
              )}
            </button>

            <audio ref={audioRef} src={cancionActual.audioUrl} crossOrigin="anonymous" />
          </div>

          {/* OPCIONES DE RESPUESTA */}
          {cancionTerminada && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mb-8"
            >
              {cancionActual.opciones.map((opcion, idx) => {
                const esSeleccionada = respondido && idx === cancionActual.correcta;
                const esIncorrecta = respondido && idx !== cancionActual.correcta && respuestaCorrecta === false;

                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: respondido ? 1 : 1.02 }}
                    whileTap={{ scale: respondido ? 1 : 0.98 }}
                    onClick={() => responder(idx)}
                    disabled={respondido}
                    className={`w-full p-4 rounded-xl font-bold text-lg text-left transition-all shadow-sm flex justify-between items-center ${
                      esSeleccionada
                        ? 'bg-green-500 text-white ring-4 ring-green-200 shadow-green-200'
                        : esIncorrecta
                        ? 'bg-red-100 text-gray-400 opacity-60 border-2 border-red-200'
                        : respondido
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-purple-100 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <span>{opcion}</span>
                    {esSeleccionada && <span>✅</span>}
                    {esIncorrecta && <span>❌</span>}
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* RESULTADO Y SIGUIENTE */}
          <AnimatePresence>
            {respondido && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className={`p-6 rounded-2xl text-center font-bold shadow-md border-2 ${
                  respuestaCorrecta
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}>
                  {respuestaCorrecta ? (
                    <div>
                      <p className="text-2xl mb-1">🎉 ¡Correcto!</p>
                      <p className="text-sm font-medium">+{puntosTotales} puntos</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl mb-1">Oh no... 😢</p>
                      <p className="text-sm text-gray-600">Era: <span className="font-black">{cancionActual.titulo}</span></p>
                    </div>
                  )}
                </div>

                <button
                  onClick={siguienteCancion}
                  className="w-full bg-gray-800 text-white py-4 px-6 rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} /> Siguiente Canción
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="animate-spin text-4xl mb-4">💿</div>
            <p className="font-bold">Cargando temazos...</p>
        </div>
      )}

      {/* MODAL: LÍMITE ALCANZADO */}
      <AnimatePresence>
        {todasJugadas && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 20, opacity: 0 }}
              className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-3xl p-8 max-w-sm shadow-2xl border-4 border-purple-300 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              
              <h2 className="text-3xl font-black text-purple-600 mb-2 font-[family-name:var(--font-pacifico)]">
                ¡Lo hiciste!
              </h2>
              
              <p className="text-gray-700 font-bold mb-2">
                Alcanzaste el límite de canciones
              </p>
              
              <div className="bg-white rounded-2xl p-4 mb-6 border-2 border-purple-200 shadow-md">
                <p className="text-sm text-gray-600 mb-1">Puntos totales</p>
                <p className="text-4xl font-black text-purple-600">💰 {puntos}</p>
              </div>
              
              <p className="text-gray-700 font-semibold mb-6">
                ✨ Próximamente se añadirán más canciones ✨
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setTodasJugadas(false);
                  setJugadas([]);
                  cargarCancion();
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:brightness-110 transition-all"
              >
                Empezar De Nuevo
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}