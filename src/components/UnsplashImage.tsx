/**
 * Composant pour afficher des images Unsplash optimisées
 * Utilise next/image pour de meilleures performances
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getOptimizedImageUrl } from '@/lib/unsplash'

interface UnsplashImageProps {
  src: string;                      // URL de l'image
  alt: string;                      // Texte alternatif
  width?: number;                   // Largeur souhaitée (défaut: 800)
  height?: number;                  // Hauteur souhaitée (défaut: 600)
  className?: string;               // Classes CSS personnalisées
  quality?: number;                 // Qualité de l'image (1-100, défaut: 80)
  priority?: boolean;               // Priorité de chargement
  onLoad?: () => void;              // Callback après chargement
  showCredit?: boolean;             // Afficher le crédit du photographe
  photographerName?: string;        // Nom du photographe
  photographerUrl?: string;         // URL du profil du photographe
}

/**
 * Composant UnsplashImage
 * Ligne 27-30 : Définition du composant avec ses props
 * Affiche une image optimisée avec next/image et crédit optionnel
 */
export default function UnsplashImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  quality = 80,
  priority = false,
  onLoad,
  showCredit = false,
  photographerName,
  photographerUrl,
}: UnsplashImageProps) {
  // Ligne 43-44 : État pour gérer le chargement et les erreurs
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Ligne 47-48 : Optimiser l'URL de l'image avec les dimensions souhaitées
  const optimizedSrc = src.startsWith('http')
    ? getOptimizedImageUrl(src, width, height, quality)
    : src

  // Ligne 52-55 : Gérer le chargement réussi
  const handleLoad = () => {
    setIsLoading(false)
    if (onLoad) {
      onLoad()
    }
  }

  // Ligne 60-62 : Gérer les erreurs de chargement
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // Ligne 66-69 : Réinitialiser l'état quand la source change
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
  }, [src])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Ligne 75-76 : Afficher un loader pendant le chargement */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      )}

      {/* Ligne 82-83 : Afficher un placeholder en cas d'erreur */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center p-4">
            <p className="text-sm">Image non disponible</p>
            <p className="text-xs mt-1">Impossible de charger l'image</p>
          </div>
        </div>
      )}

      {/* Ligne 93-105 : Composant next/image pour performances optimales */}
      {!hasError && (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${width}px`}
          quality={quality}
        />
      )}

      {/* Ligne 108-119 : Afficher le crédit du photographe si demandé (requis par Unsplash) */}
      {showCredit && photographerName && !hasError && !isLoading && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs">
            Photo par{' '}
            {photographerUrl ? (
              <a href={photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">
                {photographerName}
              </a>
            ) : (
              photographerName
            )}{' '}
            sur Unsplash
          </p>
        </div>
      )}
    </div>
  )
}



