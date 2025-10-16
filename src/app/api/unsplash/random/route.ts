/**
 * API Route pour obtenir une image aléatoire Unsplash
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRandomImage } from '@/lib/unsplash'

/**
 * GET /api/unsplash/random
 * Ligne 11-13 : Route pour obtenir une image aléatoire
 * Query params: query (optionnel)
 */
export async function GET(request: NextRequest) {
  try {
    // Ligne 18-19 : Extraire le terme de recherche (optionnel)
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query') || 'african food'

    // Ligne 22-23 : Appeler le service pour une image aléatoire
    const image = await getRandomImage(query)

    if (!image) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'image' },
        { status: 500 }
      )
    }

    // Ligne 31-35 : Retourner l'image
    return NextResponse.json({
      success: true,
      image,
    })
  } catch (error) {
    console.error('Erreur API Unsplash Random:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}



