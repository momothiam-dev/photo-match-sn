import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center p-8">
        <h1 className="text-3xl font-display font-bold mb-4">Photo-Match SN</h1>
        <p className="text-gray-600 mb-6">Bienvenue — choisissez votre espace</p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/user" className="btn-primary px-6 py-3">Espace invité</Link>
          <Link href="/admin" className="btn-secondary px-6 py-3">Espace photographe</Link>
        </div>
      </div>
    </div>
  )
}
