/**
 * Page de test pour Unsplash
 * Démo d'utilisation de la bibliothèque d'images
 */

'use client'

import { useState } from 'react'
import { useUnsplash } from '@/hooks/useUnsplash'
import UnsplashImage from '@/components/UnsplashImage'
import { FiSearch } from 'react-icons/fi'

export default function TestUnsplashPage() {
  // Ligne 15-16 : Hook personnalisé pour gérer Unsplash
  const { images, loading, error, searchImages, getRandomImage } = useUnsplash()
  const [searchTerm, setSearchTerm] = useState('african fruits')

  // Ligne 19-21 : Fonction pour lancer une recherche
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await searchImages(searchTerm)
  }

  // Ligne 25-27 : Fonction pour obtenir une image aléatoire
  const handleRandomImage = async () => {
    const randomImg = await getRandomImage('african food market')
    if (randomImg) {
      alert(`Image aléatoire: ${randomImg.alt}`)
    }
  }

  // Catégories prédéfinies pour tests rapides
  const quickSearches = [
    'african mangoes',
    'african spices market',
    'african rice grains',
    'fresh vegetables africa',
    'african street food',
    'tropical fruits',
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Test Unsplash Integration
          </h1>
          <p className="text-gray-600">
            Démonstration de la bibliothèque d'images Unsplash pour H-Market
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher des images (ex: african mangoes)..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
            <button
              type="button"
              onClick={handleRandomImage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Image Aléatoire
            </button>
          </form>

          {/* Recherches rapides */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Recherches rapides :</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term)
                    searchImages(term)
                  }}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* État de chargement */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Recherche d'images en cours...</p>
          </div>
        )}

        {/* Résultats */}
        {!loading && images.length > 0 && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {images.length} image{images.length > 1 ? 's' : ''} trouvée{images.length > 1 ? 's' : ''}
              </h2>
              <p className="text-gray-600">Cliquez sur une image pour voir les détails</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-64">
                    <UnsplashImage
                      src={image.urls.regular}
                      alt={image.alt || 'Image Unsplash'}
                      width={400}
                      height={300}
                      className="w-full h-full"
                      showCredit={true}
                      photographerName={image.user.name}
                      photographerUrl={`https://unsplash.com/@${image.user.username}`}
                    />
                  </div>

                  {/* Informations */}
                  <div className="p-4">
                    <p className="text-sm text-gray-700 mb-2">
                      {image.description || image.alt || 'Sans description'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Par {image.user.name}</span>
                      <a
                        href={image.links.html}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 underline"
                      >
                        Voir sur Unsplash
                      </a>
                    </div>

                    {/* Bouton pour copier l'URL */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(image.urls.regular)
                        alert('URL copiée dans le presse-papiers !')
                      }}
                      className="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded text-sm transition-colors"
                    >
                      Copier l'URL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aucun résultat */}
        {!loading && images.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucune image trouvée pour "{searchTerm}"
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Essayez avec un autre terme de recherche
            </p>
          </div>
        )}

        {/* Guide d'utilisation */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Guide d'Utilisation
          </h3>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">1. Configuration</p>
              <p>Ajoutez votre clé API Unsplash dans .env :</p>
              <code className="block bg-blue-100 p-2 rounded mt-1 text-xs">
                NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=votre_cle_ici
              </code>
            </div>

            <div>
              <p className="font-medium mb-1">2. Utilisation dans vos pages</p>
              <code className="block bg-blue-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {`import UnsplashImage from '@/components/UnsplashImage'

<UnsplashImage
  src="https://images.unsplash.com/photo-..."
  alt="Produit"
  width={800}
  height={600}
  showCredit={true}
/>`}
              </code>
            </div>

            <div>
              <p className="font-medium mb-1">3. Hook personnalisé</p>
              <code className="block bg-blue-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                {`import { useUnsplash } from '@/hooks/useUnsplash'

const { images, searchImages } = useUnsplash()
await searchImages('african food')`}
              </code>
            </div>

            <div className="pt-4 border-t border-blue-200">
              <p className="font-medium">Documentation complète :</p>
              <p className="mt-1">Consultez le fichier <code className="bg-blue-100 px-2 py-1 rounded">GUIDE_UNSPLASH.md</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




