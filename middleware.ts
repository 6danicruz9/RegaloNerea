import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Buscamos si tiene la "cookie" de acceso
  const acceso = request.cookies.get('acceso_nerea');

  // 2. Definimos dónde está intentando ir
  const url = request.nextUrl.pathname;

  // Si NO tiene acceso y NO está en la página de login... ¡Fuera!
  if (!acceso && url !== '/login') {
    // Permitimos cargar imágenes y archivos de sistema para que no se vea feo
    if (url.startsWith('/_next') || url.startsWith('/run') || url.includes('.')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si SÍ tiene acceso y está intentando ir al login... ¡Para adentro!
  if (acceso && url === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configuración: A qué rutas afecta
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto las que empiezan por:
     * - api (rutas API)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}