/**
 * Service Unsplash pour récupérer des images de haute qualité
 * Documentation: https://unsplash.com/documentation
 */

import { createApi } from 'unsplash-js';

// Initialiser le client Unsplash
// Ligne 8 : Crée une instance du client Unsplash avec la clé API depuis les variables d'environnement
const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
});

/**
 * Interface pour les paramètres de recherche d'images
 */
export interface ImageSearchParams {
  query: string;           // Le terme de recherche (ex: "fruits africains")
  page?: number;           // Numéro de page (défaut: 1)
  perPage?: number;        // Nombre d'images par page (défaut: 10, max: 30)
  orientation?: 'landscape' | 'portrait' | 'squarish'; // Orientation souhaitée
  color?: string;          // Couleur dominante (ex: "green", "red")
}

/**
 * Interface pour une image Unsplash simplifiée
 */
export interface UnsplashImage {
  id: string;
  description: string | null;
  alt: string | null;
  urls: {
    raw: string;           // URL originale haute résolution
    full: string;          // Haute résolution (2048px)
    regular: string;       // Résolution standard (1080px)
    small: string;         // Petite résolution (400px)
    thumb: string;         // Miniature (200px)
  };
  user: {
    name: string;
    username: string;
    portfolioUrl: string | null;
  };
  links: {
    download: string;
    html: string;
  };
}

/**
 * Rechercher des images sur Unsplash
 * Ligne 56-62 : Fonction pour rechercher des images selon des critères
 * @param params - Paramètres de recherche
 * @returns Promise avec les résultats ou null en cas d'erreur
 */
export async function searchImages(
  params: ImageSearchParams
): Promise<UnsplashImage[] | null> {
  try {
    // Ligne 66-72 : Appel à l'API Unsplash pour rechercher des photos
    const result = await unsplash.search.getPhotos({
      query: params.query,
      page: params.page || 1,
      perPage: params.perPage || 10,
      orientation: params.orientation,
      color: params.color,
    });

    // Ligne 75-76 : Vérifier si la requête a réussi
    if (result.errors) {
      console.error('Erreur Unsplash:', result.errors);
      return null;
    }

    // Ligne 81-95 : Transformer les résultats au format simplifié
    const images: UnsplashImage[] = result.response.results.map((photo) => ({
      id: photo.id,
      description: photo.description,
      alt: photo.alt_description,
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
      },
      user: {
        name: photo.user.name,
        username: photo.user.username,
        portfolioUrl: photo.user.portfolio_url,
      },
      links: {
        download: photo.links.download,
        html: photo.links.html,
      },
    }));

    return images;
  } catch (error) {
    console.error('Erreur lors de la recherche d\'images:', error);
    return null;
  }
}

/**
 * Récupérer une image aléatoire selon un thème
 * Ligne 110-114 : Fonction pour obtenir une image aléatoire
 * @param query - Terme de recherche (ex: "african food")
 * @returns Promise avec l'image ou null
 */
export async function getRandomImage(
  query: string
): Promise<UnsplashImage | null> {
  try {
    // Ligne 119-121 : Appel à l'API pour une photo aléatoire
    const result = await unsplash.photos.getRandom({
      query,
      count: 1,
    });

    if (result.errors) {
      console.error('Erreur Unsplash:', result.errors);
      return null;
    }

    // Ligne 130-131 : Vérifier que le résultat est un tableau
    if (!Array.isArray(result.response)) {
      return null;
    }

    const photo = result.response[0];

    // Ligne 137-152 : Transformer le résultat au format simplifié
    return {
      id: photo.id,
      description: photo.description,
      alt: photo.alt_description,
      urls: {
        raw: photo.urls.raw,
        full: photo.urls.full,
        regular: photo.urls.regular,
        small: photo.urls.small,
        thumb: photo.urls.thumb,
      },
      user: {
        name: photo.user.name,
        username: photo.user.username,
        portfolioUrl: photo.user.portfolio_url,
      },
      links: {
        download: photo.links.download,
        html: photo.links.html,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération d\'une image aléatoire:', error);
    return null;
  }
}

/**
 * Récupérer des images par catégories de produits africains
 * Ligne 170-174 : Fonction pour obtenir des images thématiques prédéfinies
 * @param category - Catégorie de produit
 * @returns Promise avec les images
 */
export async function getProductImagesByCategory(
  category: string
): Promise<UnsplashImage[] | null> {
  // Ligne 179-186 : Mapping des catégories vers des termes de recherche optimisés
  const categoryQueries: Record<string, string> = {
    'Fruits & Légumes': 'african fresh fruits vegetables market',
    'Épices & Condiments': 'african spices colorful market',
    'Céréales & Grains': 'african grains cereals traditional',
    'Boissons': 'african drinks beverages traditional',
    'Huiles & Beurres': 'african oils butter traditional',
    'Produits Transformés': 'african food products',
  };

  const query = categoryQueries[category] || 'african food products';

  return searchImages({
    query,
    perPage: 20,
    orientation: 'landscape',
  });
}

/**
 * Télécharger et signaler l'utilisation d'une image (requis par Unsplash)
 * Ligne 201-205 : Fonction pour notifier Unsplash du téléchargement (requis par leurs conditions)
 * @param downloadLocation - URL de téléchargement de l'image
 */
export async function trackDownload(downloadLocation: string): Promise<void> {
  try {
    // Ligne 209 : Notifier Unsplash du téléchargement (requis par leurs API guidelines)
    await fetch(downloadLocation);
  } catch (error) {
    console.error('Erreur lors du tracking de téléchargement:', error);
  }
}

/**
 * Obtenir l'URL optimisée d'une image avec paramètres personnalisés
 * Ligne 219-225 : Fonction utilitaire pour construire une URL d'image optimisée
 * @param baseUrl - URL de base de l'image
 * @param width - Largeur souhaitée
 * @param height - Hauteur souhaitée (optionnel)
 * @param quality - Qualité (1-100, défaut: 80)
 * @returns URL optimisée
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  width: number,
  height?: number,
  quality: number = 80
): string {
  const url = new URL(baseUrl);
  url.searchParams.set('w', width.toString());
  if (height) {
    url.searchParams.set('h', height.toString());
  }
  url.searchParams.set('q', quality.toString());
  url.searchParams.set('auto', 'format'); // Format automatique (WebP si supporté)
  url.searchParams.set('fit', 'crop');    // Recadrage intelligent
  
  return url.toString();
}

// Export du client pour utilisation avancée si nécessaire
export { unsplash };





