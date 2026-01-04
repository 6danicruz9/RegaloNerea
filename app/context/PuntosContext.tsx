'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

interface PuntosContextType {
  puntos: number;
  sumarPuntos: (cantidad: number) => void;
  agregarPuntos: (cantidad: number) => void;
  usarPuntos: (cantidad: number) => Promise<boolean>; // Nueva función
}

const PuntosContext = createContext<PuntosContextType | undefined>(undefined);

export function PuntosProvider({ children }: { children: ReactNode }) {
  const [puntos, setPuntos] = useState(0);

  // 1. ESCUCHAR PUNTOS
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "puntuaciones", "nerea"), (docSnap) => {
      if (docSnap.exists()) {
        setPuntos(docSnap.data().total || 0);
      } else {
        setDoc(docSnap.ref, { total: 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. SUMAR PUNTOS
  const sumarPuntos = async (cantidad: number) => {
    const nuevoTotal = puntos + cantidad;
    try {
      await setDoc(doc(db, "puntuaciones", "nerea"), { total: nuevoTotal }, { merge: true });
    } catch (e) {
      console.error("Error guardando:", e);
    }
  };

  // 3. USAR PUNTOS (GASTAR) - ¡NUEVO!
  const usarPuntos = async (cantidad: number): Promise<boolean> => {
    if (puntos >= cantidad) {
      const nuevoTotal = puntos - cantidad;
      try {
        await setDoc(doc(db, "puntuaciones", "nerea"), { total: nuevoTotal }, { merge: true });
        return true; // Compra exitosa
      } catch (e) {
        console.error("Error restando puntos:", e);
        return false;
      }
    }
    return false; // No hay saldo suficiente
  };

  return (
    <PuntosContext.Provider value={{ puntos, sumarPuntos, agregarPuntos: sumarPuntos, usarPuntos }}>
      {children}
    </PuntosContext.Provider>
  );
}

export function usePuntos() {
  const context = useContext(PuntosContext);
  if (!context) throw new Error('usePuntos debe usarse dentro de PuntosProvider');
  return context;
}