'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase'; // Importamos la conexión que acabas de crear
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface PuntosContextType {
  puntos: number;
  sumarPuntos: (cantidad: number) => void;
  agregarPuntos: (cantidad: number) => void;
}

const PuntosContext = createContext<PuntosContextType | undefined>(undefined);

export function PuntosProvider({ children }: { children: ReactNode }) {
  const [puntos, setPuntos] = useState(0);

  // 1. ESCUCHAR PUNTOS EN TIEMPO REAL (Al cargar la web)
  useEffect(() => {
    // Nos conectamos al documento 'puntuaciones/nerea' en la base de datos
    const unsubscribe = onSnapshot(doc(db, "puntuaciones", "nerea"), (docSnap) => {
      if (docSnap.exists()) {
        // Si ya existen puntos guardados, los ponemos en la web
        setPuntos(docSnap.data().total || 0);
      } else {
        // Si es la primera vez que se entra, creamos el documento con 0
        setDoc(docSnap.ref, { total: 0 });
      }
    });
    
    // Esto corta la conexión cuando se cierra la web para no gastar datos
    return () => unsubscribe();
  }, []);

  // 2. GUARDAR PUNTOS (Cuando gana)
  const sumarPuntos = async (cantidad: number) => {
    // Calculamos la nueva suma
    const nuevoTotal = puntos + cantidad;
    
    // Lo subimos a la nube de Google
    try {
      await setDoc(doc(db, "puntuaciones", "nerea"), { 
        total: nuevoTotal
      }, { merge: true }); // 'merge: true' respeta otros datos si los hubiera
    } catch (e) {
      console.error("Error guardando en la nube:", e);
    }
  };

  return (
    <PuntosContext.Provider value={{ puntos, sumarPuntos, agregarPuntos: sumarPuntos }}>
      {children}
    </PuntosContext.Provider>
  );
}

// Hook para usar los puntos en cualquier parte de la web
export function usePuntos() {
  const context = useContext(PuntosContext);
  if (!context) throw new Error('usePuntos debe usarse dentro de PuntosProvider');
  return context;
}