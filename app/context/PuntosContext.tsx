'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PuntosContextType {
  puntos: number;
  setPuntos: (puntos: number) => void;
  agregarPuntos: (cantidad: number) => void;
  usarPuntos: (cantidad: number) => boolean;
}

const PuntosContext = createContext<PuntosContextType | undefined>(undefined);

export function PuntosProvider({ children }: { children: React.ReactNode }) {
  const [puntos, setPuntosState] = useState(0);
  const [cargado, setCargado] = useState(false);

  // Cargar puntos del localStorage al montar
  useEffect(() => {
    const puntosGuardados = localStorage.getItem('puntos_nerea');
    if (puntosGuardados) {
      setPuntosState(parseInt(puntosGuardados, 10));
    }
    setCargado(true);
  }, []);

  // Guardar puntos en localStorage cada vez que cambien
  useEffect(() => {
    if (cargado) {
      localStorage.setItem('puntos_nerea', puntos.toString());
    }
  }, [puntos, cargado]);

  const setPuntos = (cantidad: number) => {
    setPuntosState(Math.max(0, cantidad));
  };

  const agregarPuntos = (cantidad: number) => {
    setPuntosState((prev) => prev + cantidad);
  };

  const usarPuntos = (cantidad: number): boolean => {
    if (puntos >= cantidad) {
      setPuntosState((prev) => prev - cantidad);
      return true;
    }
    return false;
  };

  return (
    <PuntosContext.Provider value={{ puntos, setPuntos, agregarPuntos, usarPuntos }}>
      {children}
    </PuntosContext.Provider>
  );
}

export function usePuntos() {
  const context = useContext(PuntosContext);
  if (!context) {
    throw new Error('usePuntos debe ser usado dentro de PuntosProvider');
  }
  return context;
}
