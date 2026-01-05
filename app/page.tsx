'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Heart, ArrowRight, Plane } from 'lucide-react';

// --- CONFIGURACIÓN ---
const FOTO_EL = "/run/danibien.png";   
const FOTO_ELLA = "/run/nereabien.png"; 

// --- VARIANTES DE ANIMACIÓN ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    }
  }
};

const popIn: Variants = {
  hidden: { scale: 0.5, opacity: 0, y: 20 },
  show: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
};

const photoEntrance: Variants = {
  hidden: { scale: 0, rotate: -20, opacity: 0 },
  show: { 
    scale: 1, 
    rotate: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 20, duration: 0.8 }
  }
};

const heartbeatLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { 
    pathLength: 1, 
    opacity: 0.6,
    transition: { duration: 1.5, ease: "easeInOut" } 
  }
};

// CORRECCIÓN AQUÍ: Añadimos 'as const' a 'ease' para solucionar el error de tipo
const floatingAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const 
  }
};

export default function Home() {
  const [avionVolando, setAvionVolando] = useState(false);
  const [corazones, setCorazones] = useState<any[]>([]);

  useEffect(() => {
    const nuevosCorazones = Array.from({ length: 6 }).map(() => ({
      x: Math.random() * 100 - 50 + 'vw',
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 5 + 10,
      delay: Math.random() * 5,
      size: Math.random() * 30 + 20
    }));
    setCorazones(nuevosCorazones);
  }, []);

  const lanzarAvionYEntrar = () => {
     setAvionVolando(true);
     setTimeout(() => {
        document.getElementById('link-final')?.click();
     }, 1500);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0 bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 overflow-hidden relative">
      
      {/* Fondo con corazones */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {corazones.map((corazon, i) => (
           <motion.div
             key={i}
             className="absolute text-pink-200/40"
             initial={{ y: '100vh', x: corazon.x, scale: corazon.scale }}
             animate={{ y: '-10vh' }}
             transition={{ duration: corazon.duration, repeat: Infinity, ease: 'linear', delay: corazon.delay }}
           >
             <Heart size={corazon.size} fill="currentColor" />
           </motion.div>
         ))}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="z-10 flex flex-col items-center text-center max-w-md"
      >
        {/* 1. Textos de bienvenida */}
        <motion.div variants={popIn}>
            <h3 className="text-pink-400 font-bold tracking-widest uppercase mb-2 text-sm">Bienvenida a tu Web</h3>
        </motion.div>

        <motion.div variants={popIn}>
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-8 drop-shadow-sm font-[family-name:var(--font-pacifico)] leading-tight">
            Hola, <span className="text-pink-500 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">Mi Chica</span>
            </h1>
        </motion.div>
        
        {/* 2. FOTOS Y CONEXIÓN */}
        <div className="flex items-center justify-center gap-4 mb-10 w-full relative py-8">
            
            {/* Foto ÉL */}
            <motion.div variants={photoEntrance} className="relative">
               <motion.div 
                  animate={floatingAnimation} 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden relative z-10 bg-blue-100 ring-4 ring-blue-50"
               >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FOTO_EL} alt="Él" className="w-full h-full object-cover" />
               </motion.div>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold text-blue-500 shadow-sm border border-blue-100 z-20">Yo</div>
            </motion.div>

            {/* Conector central */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 z-0">
               <svg width="100%" height="100%" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path 
                     variants={heartbeatLine}
                     d="M0 20H30L40 5L50 35L60 20H120" 
                     stroke="#ec4899" 
                     strokeWidth="3" 
                     strokeLinecap="round" 
                     strokeLinejoin="round"
                  />
               </svg>
                <motion.div 
                  variants={popIn}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10"
                >
                  <Heart className="text-pink-500 w-5 h-5" fill="currentColor" />
                </motion.div>
            </div>

             {/* Foto ELLA */}
            <motion.div variants={photoEntrance} className="relative">
               <motion.div 
                  animate={floatingAnimation} 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden relative z-10 bg-pink-100 ring-4 ring-pink-50"
               >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={FOTO_ELLA} alt="Ella" className="w-full h-full object-cover" />
               </motion.div>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-bold text-pink-500 shadow-sm border border-pink-100 z-20">Tú</div>
            </motion.div>

        </div>

        {/* 3. Texto final */}
        <motion.div variants={popIn} className="mb-8 space-y-2">
          <p className="text-xl text-gray-700 font-medium">
             He preparado esto para ti,
          </p>
          <p className="text-gray-500 text-sm">
             Juegos, regalos y mucho trabajo 
          </p>
        </motion.div>

        {/* 4. EL AVIÓN Y EL BOTÓN FINAL */}
        <motion.div 
            variants={popIn}
            className="relative w-full flex justify-center"
        >
             {/* Avión de papel */}
             <motion.div
                initial={{ x: -200, y: 50, opacity: 0, rotate: -10 }}
                animate={avionVolando ? { 
                    x: [null, 100, 400], 
                    y: [null, -50, -100], 
                    opacity: [null, 1, 0],
                    rotate: 20
                } : { 
                    x: 0, y: 0, opacity: 1, rotate: 0 
                }}
                transition={{ 
                    duration: avionVolando ? 1.5 : 0.8, 
                    delay: avionVolando ? 0 : 2.5, 
                    type: avionVolando ? "tween" : "spring",
                    ease: "easeInOut"
                }}
                className="absolute -left-16 top-0 z-20 text-pink-400 pointer-events-none"
             >
                <Plane size={40} strokeWidth={1.5} />
                <motion.div 
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 2.6, duration: 0.5 }}
                    className="absolute top-1/2 right-full h-0.5 w-24 bg-gradient-to-r from-transparent to-pink-300 origin-right"
                >
                </motion.div>
             </motion.div>

            {/* Botón principal */}
            <button
              onClick={lanzarAvionYEntrar}
              className="group relative bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95 overflow-hidden z-10"
            >
              <span className="relative z-10 flex items-center gap-2">
                 ¡Quiero verlo! <ArrowRight className="group-hover:translate-x-1 transition-transform"/>
              </span>
              <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30"></div>
            </button>
            
            <Link href="/juegos" id="link-final" className="hidden"></Link>

        </motion.div>
      </motion.div>
    </main>
  );
}