'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Plus, X, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

// --- CONFIGURACIÓN DE LA CARRETERA ---
const Y_INICIO = 60;    
const Y_PASO = 160;     
const X_IZQ = 25;       
const X_DER = 75;      

// TUS NIVELES INICIALES
const DATOS_INICIALES_PARA_SUBIR = [
  {
    orden: 1, 
    fecha: "2025-10-07", 
    fechaTexto: "7-10-2025", 
    titulo: "El comienzo",
    descripcion: "Este fue el día que empezamos a hablar, puto mvrk. Aún no me creo la suerte que tuve.",
    img: "/run/foto1.png", 
    pregunta: "¿De qué tema hablamos primero?",
    opciones: ["De música", "Del gimnasio", "De comida"],
    correcta: 1 
  },
  {
    orden: 2,
    fecha: "2025-10-18",
    fechaTexto: "18-10-2025",
    titulo: "Nuestra primera cita",
    descripcion: "Estaba súper nervioso y cuando vi que ni me miraste me puse más. Pero estabas preciosa.",
    img: "/run/foto2.png",
    pregunta: "¿Dónde fue nuestra primera parada?",
    opciones: ["El Valle", "Santa Bárbara", "Safón"],
    correcta: 0
  },
  {
    orden: 3,
    fecha: "2025-10-19",
    fechaTexto: "19-10-2025",
    titulo: "Primer beso",
    descripcion: "Uno de los mejores días de mi vida. Lo que vas a leer ahora no te lo había contado...",
    img: "/run/foto3.png",
    pregunta: "¿Por qué dije de llevarte a casa?",
    opciones: ["Tenía hambre", "Peos", "Tenía frío"],
    correcta: 1
  },
];

export default function HistoriaPage() {
  const [nivelMaximo, setNivelMaximo] = useState(1); 
  const [niveles, setNiveles] = useState<any[]>([]); 
  const [nivelSeleccionado, setNivelSeleccionado] = useState<any>(null);
  const [modoNuevoRecuerdo, setModoNuevoRecuerdo] = useState(false);
  
  const [nuevoFecha, setNuevoFecha] = useState('');
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoDesc, setNuevoDesc] = useState('');

  // 1. CARGA DE DATOS
  useEffect(() => {
    const cargarProgreso = async () => {
      const docRef = doc(db, "puntuaciones", "nerea_historia");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setNivelMaximo(docSnap.data().nivelActual || 1);
      } else {
        await setDoc(docRef, { nivelActual: 1 });
      }
    };

    const q = query(collection(db, "historia"), orderBy("fecha", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
            const statsRef = doc(db, "puntuaciones", "nerea_historia");
            const statsSnap = await getDoc(statsRef);
            const yaIniciada = statsSnap.exists() && statsSnap.data().historiaIniciada;

            if (!yaIniciada) {
                 for (const nivel of DATOS_INICIALES_PARA_SUBIR) {
                    await addDoc(collection(db, "historia"), { ...nivel, timestamp: new Date() });
                 }
                 await setDoc(statsRef, { historiaIniciada: true }, { merge: true });
                 return; 
            }
            setNiveles([]);
            return;
        }

        const nivelesCargados = snapshot.docs.map((doc, index) => ({
            id: index + 1,
            dbId: doc.id,
            ...doc.data()
        }));
        setNiveles(nivelesCargados);
    });

    cargarProgreso();
    return () => unsubscribe();
  }, []);

  // 2. BLOQUEO DE SCROLL
  useEffect(() => {
    if (nivelSeleccionado || modoNuevoRecuerdo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [nivelSeleccionado, modoNuevoRecuerdo]);

  const responder = async (indexOpcion: number) => {
    if (!nivelSeleccionado) return;

    if (indexOpcion === nivelSeleccionado.correcta) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      
      if (nivelSeleccionado.id === nivelMaximo) {
        const nuevoNivel = nivelMaximo + 1;
        setNivelMaximo(nuevoNivel);
        await updateDoc(doc(db, "puntuaciones", "nerea_historia"), { nivelActual: nuevoNivel });
      }
      setNivelSeleccionado(null);
    } else {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
      alert("¡Mec! Inténtalo otra vez, mi amor 😜");
    }
  };

  const guardarRecuerdo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTitulo || !nuevoDesc) return;
    
    await addDoc(collection(db, "historia"), {
      fecha: nuevoFecha, 
      fechaTexto: nuevoFecha.split('-').reverse().join('-'), 
      titulo: nuevoTitulo, 
      descripcion: nuevoDesc, 
      timestamp: new Date(),
      esRecuerdoExtra: true 
    });
    
    setModoNuevoRecuerdo(false);
    setNuevoFecha(''); setNuevoTitulo(''); setNuevoDesc('');
    confetti();
  };

  // --- SOLUCIÓN AL SCROLL EXCESIVO ---
  // Altura exacta basada en el número de niveles
  const alturaTotal = niveles.length > 0 
    ? Y_INICIO + (niveles.length) * Y_PASO + 140 
    : 300; 

  return (
    <div className="min-h-screen bg-[#fff0f5] relative overflow-x-hidden font-[family-name:var(--font-nunito)]">
      
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#db2777 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* CABECERA (LIMPIA) */}
      <div className="pt-6 pb-4 px-6 sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm transition-all">
         <div className="flex justify-between items-center max-w-md mx-auto">
            <h1 className="text-2xl font-black text-pink-600 font-[family-name:var(--font-pacifico)]">
               Nuestra Historia
            </h1>
            
            <div className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                <MapPin size={12} /> Nivel {nivelMaximo}
            </div>
         </div>
      </div>

      {/* --- MAPA --- */}
      {/* Margen inferior ajustado (mb-24) para que no choque con el menú pero no deje hueco enorme */}
      <div 
         className="relative w-full max-w-md mx-auto mt-4 z-10 mb-24"
         style={{ height: `${alturaTotal}px` }}
      >
        {niveles.length > 0 && (
            <svg 
                className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
                viewBox={`0 0 100 ${alturaTotal}`} 
                preserveAspectRatio="none"
            >
            <path d={generarCaminoSVG(niveles.length)} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="20" strokeLinecap="round" />
            <path d={generarCaminoSVG(niveles.length)} fill="none" stroke="#be185d" strokeWidth="16" strokeLinecap="round" />
            <path d={generarCaminoSVG(niveles.length)} fill="none" stroke="#ec4899" strokeWidth="12" strokeLinecap="round" />
            <path d={generarCaminoSVG(niveles.length)} fill="none" stroke="white" strokeWidth="2" strokeDasharray="6 6" strokeLinecap="round" opacity="0.8" />
            </svg>
        )}

        {/* NIVELES */}
        {niveles.map((nivel, index) => {
          const desbloqueado = nivel.id <= nivelMaximo || nivel.esRecuerdoExtra;
          const completado = nivel.id < nivelMaximo || nivel.esRecuerdoExtra;
          
          const posY = Y_INICIO + index * Y_PASO;
          const posX = index % 2 === 0 ? X_IZQ : X_DER;

          return (
            <motion.div 
              key={nivel.dbId || index}
              className="absolute"
              style={{ 
                  top: posY, 
                  left: `${posX}%`, 
                  transform: 'translate(-50%, -50%)', 
                  zIndex: 20 
              }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => { if(desbloqueado) setNivelSeleccionado(nivel); }}
                className={`
                  w-20 h-20 rounded-full border-4 shadow-xl flex items-center justify-center relative overflow-visible group
                  transition-all duration-300
                  ${desbloqueado 
                    ? completado 
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-white ring-4 ring-green-200' 
                        : 'bg-gradient-to-br from-pink-500 to-rose-500 border-white ring-4 ring-pink-200 animate-pulse' 
                    : 'bg-gray-300 border-gray-100 cursor-not-allowed grayscale'
                  }
                `}
              >
                {desbloqueado ? (
                  completado ? <Star fill="white" className="text-white w-8 h-8 drop-shadow-md" /> : <span className="text-white font-black text-3xl drop-shadow-md">{nivel.id}</span>
                ) : (
                  <Lock className="text-gray-400 w-8 h-8" />
                )}

                <div className={`
                    absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold shadow-md whitespace-nowrap
                    bg-white text-pink-600 border border-pink-100 z-30
                `}>
                  {nivel.fechaTexto || nivel.fecha}
                </div>
              </motion.button>
            </motion.div>
          );
        })}

        {/* BOTÓN "+" */}
        <motion.div 
            className="absolute"
            style={{ 
                top: niveles.length > 0 ? Y_INICIO + niveles.length * Y_PASO : Y_INICIO, 
                left: `${niveles.length % 2 === 0 ? X_IZQ : X_DER}%`, 
                transform: 'translate(-50%, -50%)',
                zIndex: 20
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
        >
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setModoNuevoRecuerdo(true)}
                className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-yellow-400 text-yellow-500 ring-4 ring-yellow-100"
            >
                <Plus size={32} strokeWidth={4} />
            </motion.button>
        </motion.div>
      </div>

      {/* --- MODAL DETALLE --- */}
      <AnimatePresence>
        {nivelSeleccionado && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNivelSeleccionado(null)} />

            <motion.div 
              initial={{ scale: 0.8, y: 30, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.8, y: 30, opacity: 0 }}
              className="bg-white w-[90%] max-w-[320px] max-h-[80vh] flex flex-col rounded-[1.5rem] shadow-2xl overflow-hidden relative z-10"
            >
              <div className="overflow-y-auto custom-scrollbar">
                  
                  {/* IMAGEN */}
                  <div className="h-40 bg-gray-100 relative group">
                     {nivelSeleccionado.img ? (
                        <img src={nivelSeleccionado.img} alt="Recuerdo" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-pink-100 text-4xl">📸</div>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                        <h3 className="text-xl font-bold text-white font-[family-name:var(--font-pacifico)] drop-shadow-md leading-tight">
                            {nivelSeleccionado.titulo}
                        </h3>
                     </div>
                     <button onClick={() => setNivelSeleccionado(null)} className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"><X size={16}/></button>
                  </div>

                  <div className="p-5">
                    <p className="text-gray-600 mb-6 text-sm font-medium leading-relaxed">
                      "{nivelSeleccionado.descripcion}"
                    </p>

                    {nivelSeleccionado.pregunta ? (
                        nivelSeleccionado.id < nivelMaximo ? (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm font-bold shadow-sm">
                                <Star size={16} fill="currentColor" />
                                <span>¡Recuerdo desbloqueado!</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm">
                                    <span className="bg-yellow-400 text-yellow-900 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">?</span>
                                    {nivelSeleccionado.pregunta}
                                </p>
                                {nivelSeleccionado.opciones?.map((opcion: string, idx: number) => (
                                    <button 
                                    key={idx}
                                    onClick={() => responder(idx)}
                                    className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-500 hover:bg-pink-50 transition-all text-left text-sm font-medium text-gray-700 active:scale-95 flex justify-between group"
                                    >
                                    {opcion}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-400">➜</span>
                                    </button>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl flex items-center gap-2 text-pink-700 text-sm font-bold shadow-sm">
                            <Star size={16} fill="currentColor" />
                            <span>Recuerdo Guardado</span>
                        </div>
                    )}
                  </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL AÑADIR --- */}
      <AnimatePresence>
        {modoNuevoRecuerdo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <form onSubmit={guardarRecuerdo} className="bg-white w-[90%] max-w-[320px] rounded-[1.5rem] p-5 shadow-2xl border-4 border-yellow-200 relative">
                <button type="button" onClick={() => setModoNuevoRecuerdo(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X size={20}/></button>
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><Plus size={20} strokeWidth={3} /></div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Nuevo Recuerdo</h3>
                        <p className="text-[10px] text-gray-500 font-medium">Para siempre en la nube</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <input required type="date" value={nuevoFecha} onChange={e => setNuevoFecha(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-yellow-500 outline-none text-gray-800 text-sm font-bold" />
                    <input required type="text" placeholder="Título" value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-yellow-500 outline-none text-gray-800 text-sm font-bold" />
                    <textarea required placeholder="Cuéntame..." value={nuevoDesc} onChange={e => setNuevoDesc(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-yellow-500 outline-none h-20 text-gray-800 resize-none text-sm font-medium"></textarea>
                    
                    <button type="submit" className="w-full bg-yellow-400 text-yellow-900 font-black py-3 rounded-xl shadow-lg hover:bg-yellow-500 transition-transform active:scale-95 text-sm">
                        GUARDAR EN NUBE ☁️
                    </button>
                </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function generarCaminoSVG(cantidad: number) {
   let path = `M 50 0`; 
   path += ` C 50 ${Y_INICIO/2}, ${X_IZQ} ${Y_INICIO/2}, ${X_IZQ} ${Y_INICIO}`;

   for(let i=0; i < cantidad; i++) {
      const xActual = (i % 2 === 0) ? X_IZQ : X_DER;
      const yActual = Y_INICIO + i * Y_PASO;
      const xSiguiente = ((i+1) % 2 === 0) ? X_IZQ : X_DER;
      const ySiguiente = Y_INICIO + (i+1) * Y_PASO;
      const yControl = (yActual + ySiguiente) / 2;
      path += ` C ${xActual} ${yControl}, ${xSiguiente} ${yControl}, ${xSiguiente} ${ySiguiente}`;
   }
   return path;
}