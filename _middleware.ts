import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. On récupère le token et le rôle depuis les cookies sécurisés
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // 2. CAS 1 : L'utilisateur est connecté et tente d'aller sur /login
  if (pathname === '/login' && token && role) {
    // Effet boomerang 🪃 : On le renvoie directement sur son tableau de bord
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  // 3. CAS 2 : L'utilisateur n'est PAS connecté et tente d'entrer dans un dashboard
  const isDashboardRoute = pathname.startsWith('/admin') || 
                           pathname.startsWith('/enseignant') || 
                           pathname.startsWith('/etudiant');

  if (isDashboardRoute && !token) {
    // Accès refusé ❌ : On le renvoie à l'accueil ou au login
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si tout est en ordre, on laisse passer la requête normalement
  return NextResponse.next();
}

// 🚀 CRUCIAL : Le matcher filtre les routes pour éviter que Next.js ne tourne en boucle
export const config = {
  matcher: [
    '/login',
    '/admin/:path*',
    '/enseignant/:path*',
    '/etudiant/:path*',
  ],
};