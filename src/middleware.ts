import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'

/**
 * Middleware Next.js pour gérer l'authentification et les autorisations
 * Vérifie les tokens JWT et redirige les utilisateurs selon leur rôle
 */
export function middleware(request: NextRequest) {
 const { pathname } = request.nextUrl

 // Extraire le token depuis les cookies ou le header Authorization
 const cookieToken = request.cookies.get('token')?.value
 const headerToken = extractTokenFromHeader(request.headers.get('authorization'))
 const token = cookieToken || headerToken

 // Si un token est présent, le vérifier
 if (token && token.trim() !== '') {
 const decoded = verifyToken(token)

 if (decoded) {
 // Gestion des redirections selon le rôle de l'utilisateur
 const { role } = decoded

 // LIVREURS: Accès restreint uniquement aux pages /livreur
 if (role === 'livreur') {
 const allowedPaths = ['/livreur', '/auth', '/api']
 const isAllowedPath = allowedPaths.some((path) =>
 pathname.startsWith(path)
 )

 if (!isAllowedPath) {
 console.log(
 ` Livreur: Accès refusé à ${pathname} -> Redirection vers /livreur/dashboard`
 )
 return NextResponse.redirect(new URL('/livreur/dashboard', request.url))
 }

 // Rediriger la racine vers le dashboard livreur
 if (pathname === '/') {
 console.log(` Livreur: Redirection racine -> /livreur/dashboard`)
 return NextResponse.redirect(new URL('/livreur/dashboard', request.url))
 }
 }

 // CLIENTS: Pas d'accès aux pages livreur ni admin
 if (role === 'client') {
 if (pathname.startsWith('/livreur')) {
 console.log(` Client: Accès refusé à ${pathname} -> Redirection vers /`)
 return NextResponse.redirect(new URL('/', request.url))
 }
 if (pathname.startsWith('/admin')) {
 console.log(` Client: Accès refusé à ${pathname} -> Redirection vers /`)
 return NextResponse.redirect(new URL('/', request.url))
 }
 }

 // ADMINS: Pas d'accès aux pages livreur
 if (role === 'admin' && pathname.startsWith('/livreur')) {
 console.log(` Admin: Accès refusé à ${pathname} -> Redirection vers /admin`)
 return NextResponse.redirect(new URL('/admin', request.url))
 }

 // VENDEURS: Pas d'accès aux pages livreur ni admin
 if (role === 'vendeur') {
 if (pathname.startsWith('/livreur') || pathname.startsWith('/admin')) {
 console.log(` Vendeur: Accès refusé à ${pathname} -> Redirection vers /`)
 return NextResponse.redirect(new URL('/', request.url))
 }
 }
 }
 }

 // Continuer normalement si pas de redirection nécessaire
 return NextResponse.next()
}

export const config = {
 matcher: [
 /*
 * Match all request paths except for the ones starting with:
 * - api (API routes)
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 */
 '/((?!api|_next/static|_next/image|favicon.ico).*)',
 ],
}
