/**
 * Hook personnalisé pour utiliser Unsplash côté client
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Interface pour une image simplifiée
 */
interface UnsplashImage {
  id: string
  description: string | null
  alt: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  user: {
    name: string
    username: string
    portfolioUrl: string | null
  }
  links: {
    download: string
    html: string
  }
}

/**
 * Hook useUnsplash
 * Ligne 36-39 : Hook pour rechercher des images Unsplash
 * @param query - Terme de recherche initial
 * @returns État et fonctions pour gérer les images
 */
export function useUnsplash(initialQuery?: string) {
  // Ligne 43-46 : États pour gérer les images et le chargement
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState(initialQuery || '')

  /**
   * Rechercher des images
   * Ligne 51-55 : Fonction pour rechercher des images selon un terme
   */
  const searchImages = useCallback(async (searchQuery: string, page: number = 1) => {
    if (!searchQuery.trim()) {
      setImages([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Ligne 64-69 : Appel à notre API interne qui utilise Unsplash
      const response = await fetch(
        `/api/unsplash/search?query=${encodeURIComponent(searchQuery)}&page=${page}&perPage=20`
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche')
      }

      const data = await response.json()

      // Ligne 77-78 : Mettre à jour l'état avec les résultats
      if (data.success) {
        setImages(data.images)
      } else {
        setError(data.error || 'Erreur inconnue')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Obtenir une image aléatoire
   * Ligne 93-96 : Fonction pour obtenir une image aléatoire
   */
  const getRandomImage = useCallback(async (searchQuery: string = 'african food') => {
    setLoading(true)
    setError(null)

    try {
      // Ligne 102-103 : Appel à notre API pour une image aléatoire
      const response = await fetch(
        `/api/unsplash/random?query=${encodeURIComponent(searchQuery)}`
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération')
      }

      const data = await response.json()

      // Ligne 113-114 : Retourner l'image unique
      if (data.success) {
        return data.image
      } else {
        setError(data.error || 'Erreur inconnue')
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Rechercher automatiquement au changement de query
   * Ligne 131-135 : Effet pour lancer une recherche automatique
   */
  useEffect(() => {
    if (query && initialQuery) {
      searchImages(query)
    }
  }, [query, searchImages, initialQuery])

  return {
    images,          // Liste des images trouvées
    loading,         // État de chargement
    error,           // Message d'erreur éventuel
    query,           // Terme de recherche actuel
    setQuery,        // Fonction pour changer le terme de recherche
    searchImages,    // Fonction pour rechercher manuellement
    getRandomImage,  // Fonction pour obtenir une image aléatoire
  }
}





