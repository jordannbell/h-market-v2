/**
 * API Route pour rechercher des images Unsplash
 * Évite d'exposer la clé API côté client
 */

import { NextRequest, NextResponse } from 'next/server'
import { searchImages } from '@/lib/unsplash'

/**
 * GET /api/unsplash/search
 * Ligne 11-13 : Route pour rechercher des images Unsplash
 * Query params: query, page, perPage, orientation, color
 */
export async function GET(request: NextRequest) {
  try {
    // Ligne 18-19 : Extraire les paramètres de recherche depuis l'URL
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')

    // Ligne 22-27 : Valider que le terme de recherche est présent
    if (!query) {
      return NextResponse.json(
        { error: 'Paramètre "query" requis' },
        { status: 400 }
      )
    }

    // Ligne 30-35 : Paramètres optionnels avec valeurs par défaut
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '10')
    const orientation = searchParams.get('orientation') as 'landscape' | 'portrait' | 'squarish' | undefined
    const color = searchParams.get('color') || undefined

    // Ligne 38-44 : Appeler le service Unsplash
    const images = await searchImages({
      query,
      page,
      perPage,
      orientation,
      color,
    })

    // Ligne 47-52 : Vérifier si des résultats ont été trouvés
    if (!images) {
      return NextResponse.json(
        { error: 'Erreur lors de la recherche d\'images' },
        { status: 500 }
      )
    }

    // Ligne 55-59 : Retourner les résultats
    return NextResponse.json({
      success: true,
      images,
      total: images.length,
    })
  } catch (error) {
    console.error('Erreur API Unsplash:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}



