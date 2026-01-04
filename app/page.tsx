'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { HelpCircle, Heart } from 'lucide-react';

// --- CONFIGURACIÓN ---
const DURACION_VUELO = 6; 

const contenedorHumoVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: DURACION_VUELO / 10, delayChildren: 0.5 }
  }
};

const puffHumoVariants: Variants = {
  hidden: { scale: 0, opacity: 0, y: 20 },
  visible: { 
    scale: [0.5, 1.2, 1], opacity: [0, 0.8, 0.6], y: 0,
    transition: { duration: 1.5, ease: "easeOut" }
  }
};

export default function Home() {
  const [activarEscena, setActivarEscena] = useState(false);

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-sky-300 to-sky-100 flex flex-col items-center justify-center relative overflow-hidden font-[family-name:var(--font-nunito)]">

      <AnimatePresence mode="wait">
        {!activarEscena ? (
          <motion.div
            key="inicio"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.5 } }}
            className="text-center z-20 bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-xl"
          >
            <h1 className="text-4xl font-bold text-sky-600 mb-6 font-[family-name:var(--font-pacifico)]">
              Atención
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              que coño es eso que viene por ahí
            </p>
            
            <motion.button
              onClick={() => setActivarEscena(true)}
              whileHover={{ scale: 1.05, backgroundColor: '#0284c7' }}
              whileTap={{ scale: 0.95 }}
              className="bg-sky-500 text-white font-bold py-4 px-8 rounded-full shadow-lg flex items-center gap-3 mx-auto text-xl transition-colors"
            >
              <HelpCircle size={24} /> A ver
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="escena"
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
             {/* NUBES DE FONDO */}
             <motion.div 
               className="absolute top-20 left-0 text-white opacity-50 text-6xl"
               initial={{ x: "100vw" }} animate={{ x: "-100vw" }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             >☁️☁️</motion.div>

            {/* HUMO */}
            <motion.div 
              className="absolute top-1/2 left-0 w-full flex justify-center items-center gap-2 -translate-y-4 z-0"
              variants={contenedorHumoVariants}
              initial="hidden" animate="visible"
            >
              {[...Array(10)].map((_, i) => (
                <motion.div key={i} variants={puffHumoVariants} className="w-16 h-16 bg-white rounded-full blur-md" />
              ))}
            </motion.div>

             {/* TEXTO FINAL */}
            <motion.div
              className="absolute top-1/2 left-0 w-full text-center z-10 -translate-y-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: DURACION_VUELO - 1.5, duration: 1, type: "spring" }}
            >
               <h2 className="text-5xl md:text-7xl font-bold text-pink-500 font-[family-name:var(--font-pacifico)] drop-shadow-lg flex items-center justify-center gap-4">
                  <Heart className="fill-pink-500 animate-bounce" /> TE QUIERO <Heart className="fill-pink-500 animate-bounce" />
               </h2>
            </motion.div>

            {/* PERSONAJES */}
            <div className="absolute top-1/2 w-full z-20 pointer-events-none">
              
              {/* NEREA (Corregida la ruta a /run/nerea.png) */}
              <motion.div
                className="absolute left-0"
                initial={{ x: -200, y: 50 }}
                animate={{ x: "110vw", y: [50, 40, 50] }} 
                transition={{ x: { duration: DURACION_VUELO, ease: "linear" }, y: { repeat: Infinity, duration: 0.5 } }}
              >
                <img src="/run/nerea.png" alt="Nerea" className="w-32 h-auto object-contain drop-shadow-xl" />
              </motion.div>

               {/* LAMINE EN AVIÓN (Corregida ruta y añadido emoji de avión) */}
              <motion.div
                className="absolute left-0 relative"
                initial={{ x: -400, y: -50, rotate: -5 }}
                animate={{ x: "120vw", y: [-50, -60, -50], rotate: 0 }}
                transition={{ x: { duration: DURACION_VUELO + 0.5, ease: "linear", delay: 0.3 }, y: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
              >
                 <div className="relative">
                    {/* He puesto un emoji gigante de avión porque no tienes la foto avion.png */}
                    {/* Si encuentras una foto, descomenta la línea de abajo y borra el span del emoji */}
                    
                    <span className="text-[10rem] relative z-10 block leading-none">✈️</span>
                    
                    {/* <img src="/run/avion.png" alt="Avión" className="w-64 h-auto object-contain relative z-10 drop-shadow-2xl" /> */}

                    {/* Lamine sentado encima (Ruta corregida) */}
                    <img 
                        src="/run/lamine.png" 
                        alt="Lamine" 
                        className="w-20 h-20 object-contain absolute -top-4 left-10 z-20 rotate-12"
                    />
                 </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}