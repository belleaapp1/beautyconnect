import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="text-center space-y-5">
        <span className="text-7xl">🌸</span>
        <h1 className="text-3xl font-bold text-gray-900">Page introuvable</h1>
        <p className="text-gray-500">Ce profil n&apos;existe pas ou a été supprimé.</p>
        <Link href="/" className="btn-primary inline-block">Retour à l&apos;accueil</Link>
      </div>
    </div>
  )
}
