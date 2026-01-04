'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Lock } from 'lucide-react';

export default function Login() {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  // --- CONFIGURA AQUÍ TU CONTRASEÑA ---
  const CONTRASEÑA_CORRECTA = "28112025"; 

  const intentarEntrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === CONTRASEÑA_CORRECTA) {
      document.cookie = `acceso_nerea=true; path=/; max-age=${60 * 60 * 24 * 365}`;
      router.push('/');
      router.refresh();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    // CAMBIO AQUÍ: 'h-screen' y 'overflow-hidden' bloquean el scroll
    <div className="h-screen w-screen overflow-hidden bg-pink-50 flex flex-col items-center justify-center p-6 fixed inset-0">
      
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border-2 border-pink-100 relative z-10">
        <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-pink-500" size={32} />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Zona Privada</h1>
        <p className="text-gray-400 text-sm mb-6">Solo para la pochilla</p>

        <form onSubmit={intentarEntrar} className="flex flex-col gap-4">
          <input 
            type="password" 
            placeholder="Contraseña..." 
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className={`w-full p-4 bg-gray-50 rounded-xl border-2 outline-none transition-all text-center text-lg tracking-widest
              ${error ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 focus:border-pink-400'}
            `}
          />

          <button 
            type="submit"
            className="bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Heart fill="white" size={20} /> Entrar
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-4 animate-bounce font-medium">
            ¡Esa no es! Piensa en nuestra fecha... 🤔
          </p>
        )}
      </div>
    </div>
  );
}