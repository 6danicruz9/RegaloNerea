export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-pink-50 p-6">
      
      {/* Título Principal */}
      <h1 className="text-4xl font-bold text-pink-600 text-center mb-4">
        Hola Nerea ❤️
      </h1>

      {/* Subtítulo */}
      <p className="text-gray-700 text-lg text-center max-w-md">
        Estoy creando algo especial para ti...
      </p>

      {/* Un botón de prueba */}
      <button className="mt-8 bg-pink-500 text-white font-bold py-3 px-6 rounded-full shadow-lg active:scale-95 transition-transform">
        ¿Qué es esto?
      </button>

    </main>
  );
}