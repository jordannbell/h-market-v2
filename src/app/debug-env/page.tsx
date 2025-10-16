'use client'

export default function DebugEnvPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug - Variables d'environnement</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Variables Stripe :</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY :</strong>
              <p className="text-sm text-gray-600 break-all">
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '❌ Non définie'}
              </p>
            </div>
            
            <div>
              <strong>STRIPE_PUBLISHABLE_KEY :</strong>
              <p className="text-sm text-gray-600 break-all">
                {process.env.STRIPE_PUBLISHABLE_KEY || '❌ Non définie'}
              </p>
            </div>
            
            <div>
              <strong>STRIPE_SECRET_KEY :</strong>
              <p className="text-sm text-gray-600 break-all">
                {process.env.STRIPE_SECRET_KEY ? '✅ Définie' : '❌ Non définie'}
              </p>
            </div>
            
            <div>
              <strong>MONGODB_URI :</strong>
              <p className="text-sm text-gray-600 break-all">
                {process.env.MONGODB_URI ? '✅ Définie' : '❌ Non définie'}
              </p>
            </div>
            
            <div>
              <strong>JWT_SECRET :</strong>
              <p className="text-sm text-gray-600 break-all">
                {process.env.JWT_SECRET ? '✅ Définie' : '❌ Non définie'}
              </p>
            </div>
            
            <div>
              <strong>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY :</strong>
              <p className="text-sm text-gray-600 break-all">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '❌ Non définie'}
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800">Instructions :</h3>
            <p className="text-sm text-yellow-700 mt-2">
              Si NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY est "Non définie", allez sur Vercel → 
              Settings → Environment Variables et ajoutez votre clé Stripe publique.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
