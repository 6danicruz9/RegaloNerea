'use client';
import { useState, useEffect } from 'react';
import { Gift, Utensils, Plane, MonitorPlay } from 'lucide-react';
import { usePuntos } from '@/app/context/PuntosContext';
import confetti from 'canvas-confetti'; // Importamos el confeti
import { db } from '@/app/lib/firebase'; // Importamos Firebase
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';

// TUS CUPONES
const VALES = [
  { id: 1, titulo: "Cena Romántica", desc: "Donde tú elijas, yo invito.", icon: <Utensils />, costo: 300 },
  { id: 2, titulo: "Masaje 20min", desc: "Sin quejas, solo relax.", icon: <Gift />, costo: 150 },
  { id: 3, titulo: "Noche de Cine", desc: "Tú eliges la peli y las snacks.", icon: <MonitorPlay />, costo: 200 },
  { id: 4, titulo: "Escapada", desc: "Un fin de semana sorpresa.", icon: <Plane />, costo: 500 },
];

const NUMERO_WHATSAPP = "+34629429882"; // Tu número

export default function Regalos() {
  const { puntos, agregarPuntos } = usePuntos();
  const [gastados, setGastados] = useState<number[]>([]);
  const [mensajeError, setMensajeError] = useState("");

  // 1. ESCUCHAR EL HISTORIAL DE COMPRAS (Persistencia)
  useEffect(() => {
    const q = query(collection(db, "historial_canjes"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Sacamos los IDs de los regalos que ya están en la base de datos
      const idsGastados = snapshot.docs.map(doc => doc.data().idRegalo);
      setGastados(idsGastados);
    });
    return () => unsubscribe();
  }, []);

  const canjear = async (id: number, titulo: string, costo: number) => {
    setMensajeError("");

    if (gastados.includes(id)) {
      setMensajeError("Este vale ya ha sido canjeado.");
      return;
    }

    if (puntos < costo) {
      setMensajeError(`Te faltan ${costo - puntos} puntos para canjear este vale.`);
      return;
    }

    if (confirm(`¿Seguro que quieres gastar ${costo} puntos para canjear "${titulo}"?`)) {
      agregarPuntos(-costo);
      setGastados([...gastados, id]);
      
      // A) ¡LANZAR CONFETI! 🎉
      confetti({ 
          particleCount: 150, 
          spread: 70, 
          origin: { y: 0.6 },
          colors: ['#ec4899', '#fbbf24', '#ffffff']
      });

      // B) GUARDAR EN FIREBASE
      await addDoc(collection(db, "historial_canjes"), {
          idRegalo: id,
          titulo: titulo,
          fecha: new Date(),
          costo: costo
      });

      // C) AVISAR POR WHATSAPP
      const mensaje = `¡Hola! Acabo de canjear mis puntos por: "${titulo}". ¡Prepárate! 🎁`;
      const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
      
      setTimeout(() => {
           window.open(urlWhatsApp, '_blank');
      }, 1500);
    }
  };

  return (
    <div className="p-6 pt-10 pb-0 min-h-screen bg-pink-50">
      {/* Contador global de puntos */}
      <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-2xl text-center shadow-sm">
        <p className="text-gray-600 text-sm font-bold uppercase tracking-wide">Puntos disponibles</p>
        <p className="text-4xl font-black text-yellow-600">💰 {puntos}</p>
      </div>

      <h1 className="text-3xl font-black text-pink-600 mb-2 text-center font-[family-name:var(--font-pacifico)]">Tus Regalos</h1>
      <p className="text-center text-gray-500 mb-8 font-medium">Canjea tus puntos por estos premios</p>

      {mensajeError && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg text-center font-bold animate-pulse">
          {mensajeError}
        </div>
      )}

      <div className="grid gap-4">
        {VALES.map((vale) => {
          const estaGastado = gastados.includes(vale.id);
          const puntosInsuficientes = puntos < vale.costo && !estaGastado;
          
          return (
            <div 
              key={vale.id}
              onClick={() => !estaGastado && canjear(vale.id, vale.titulo, vale.costo)}
              className={`
                relative p-6 rounded-2xl shadow-md border-2 transition-all duration-300 flex items-center gap-4 cursor-pointer overflow-hidden
                ${estaGastado 
                  ? 'bg-gray-100 border-gray-200 opacity-60 grayscale' 
                  : puntosInsuficientes
                  ? 'bg-white border-gray-200 opacity-70' // Cambio visual sutil si no tiene puntos
                  : 'bg-white border-pink-200 hover:border-pink-400 hover:shadow-xl hover:scale-[1.02] active:scale-95'
                }
              `}
            >
              <div className={`p-4 rounded-full text-2xl ${estaGastado ? 'bg-gray-200' : 'bg-pink-100 text-pink-500'}`}>
                {vale.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${estaGastado ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {vale.titulo}
                </h3>
                <p className="text-xs text-gray-400 font-medium">{vale.desc}</p>
              </div>
              
              <div className="text-right">
                <p className={`font-black text-xl ${puntosInsuficientes ? 'text-red-400' : 'text-pink-600'}`}>
                  {vale.costo}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">puntos</p>
              </div>
              
              {estaGastado && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-[1px]">
                     <span className="text-sm font-black text-red-500 border-2 border-red-500 px-3 py-1 rounded-lg bg-white -rotate-12 shadow-lg">
                    CANJEADO
                    </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}