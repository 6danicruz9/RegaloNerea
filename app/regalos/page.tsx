'use client';
import { useState } from 'react';
import { Gift, Utensils, Plane, MonitorPlay } from 'lucide-react'; // Iconos
import { usePuntos } from '@/app/context/PuntosContext';

// TUS CUPONES (Ahora con costo en puntos)
const VALES = [
  { id: 1, titulo: "Cena Romántica", desc: "Donde tú elijas, yo invito.", icon: <Utensils />, costo: 300 },
  { id: 2, titulo: "Masaje 20min", desc: "Sin quejas, solo relax.", icon: <Gift />, costo: 150 },
  { id: 3, titulo: "Noche de Cine", desc: "Tú eliges la peli y las snacks.", icon: <MonitorPlay />, costo: 200 },
  { id: 4, titulo: "Escapada", desc: "Un fin de semana sorpresa.", icon: <Plane />, costo: 500 },
];

const NUMERO_WHATSAPP = "+34629429882"; // <-- CAMBIAR POR TU NÚMERO

export default function Regalos() {
  const { puntos, usarPuntos } = usePuntos();
  const [gastados, setGastados] = useState<number[]>([]);
  const [mensajeError, setMensajeError] = useState("");

  const canjear = (id: number, titulo: string, costo: number) => {
    // Limpiar mensaje anterior
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
      if (usarPuntos(costo)) {
        setGastados([...gastados, id]);
        // Enviar WhatsApp automático
        const mensaje = `¡Hola! Quiero canjear mi vale: "${titulo} jambo"`;
        const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
      }
    }
  };

  return (
    <div className="p-6 pt-10 pb-24 min-h-screen bg-pink-50">
      {/* Contador global de puntos */}
      <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-2xl text-center">
        <p className="text-gray-600 text-sm">Puntos disponibles</p>
        <p className="text-4xl font-bold text-yellow-600">💰 {puntos}</p>
      </div>

      <h1 className="text-3xl font-bold text-pink-600 mb-2 text-center">Tus Regalos</h1>
      <p className="text-center text-gray-500 mb-8">Canjea tus puntos por estos premios</p>

      {mensajeError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
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
                relative p-6 rounded-2xl shadow-md border-2 transition-all duration-300 flex items-center gap-4 cursor-pointer
                ${estaGastado 
                  ? 'bg-gray-100 border-gray-200 opacity-60 grayscale' 
                  : puntosInsuficientes
                  ? 'bg-gray-50 border-gray-300 opacity-70'
                  : 'bg-white border-pink-100 active:scale-95 hover:shadow-lg'
                }
              `}
            >
              <div className={`p-4 rounded-full ${estaGastado ? 'bg-gray-200' : 'bg-pink-100 text-pink-500'}`}>
                {vale.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${estaGastado ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {vale.titulo}
                </h3>
                <p className="text-xs text-gray-400">{vale.desc}</p>
              </div>
              
              <div className="text-right">
                <p className={`font-bold text-lg ${puntosInsuficientes ? 'text-red-500' : 'text-pink-600'}`}>
                  {vale.costo}
                </p>
                <p className="text-xs text-gray-500">puntos</p>
              </div>
              
              {estaGastado && (
                <span className="absolute top-2 right-2 text-xs font-bold text-red-400 border border-red-200 px-2 py-1 rounded bg-red-50 rotate-12">
                  CANJEADO
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}