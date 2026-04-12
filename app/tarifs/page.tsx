import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { PLANS } from '@/lib/constants'

export default function TarifsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 text-xs font-bold px-4 py-2 rounded-full border border-pink-100">
            💼 Pour les prestataires
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Des offres simples et<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
              sans surprise.
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">
            Commence gratuitement, passe à la vitesse supérieure quand tu veux.
          </p>
        </div>

        {/* Plans */}
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              name: 'Gratuit',
              price: '0€',
              period: 'pour toujours',
              color: 'border-gray-200',
              headerBg: 'bg-gray-50',
              badge: null,
              features: [
                'Profil public visible',
                'Jusqu\'à 5 photos',
                '10 prestations max',
                'Contact WhatsApp direct',
                'Avis clients',
              ],
              missing: ['Mise en avant', 'Réservations en ligne', 'Statistiques'],
              cta: 'Créer mon profil',
              href: '/auth/register',
              btnClass: 'btn-secondary',
            },
            {
              name: 'En vedette',
              price: '15€',
              period: '/mois',
              color: 'border-pink-300 ring-2 ring-pink-200',
              headerBg: 'bg-gradient-to-r from-pink-500 to-pink-600',
              badge: '⭐ Le plus populaire',
              features: [
                'Tout le plan Gratuit',
                'Badge ⭐ "En vedette" doré',
                'Apparaît en 1er dans les résultats',
                'Statistiques de vues basiques',
                'Support par email',
              ],
              missing: ['Réservations en ligne'],
              cta: 'Passer en vedette',
              href: '/auth/register',
              btnClass: 'btn-primary',
            },
            {
              name: 'Premium',
              price: '35€',
              period: '/mois',
              color: 'border-amber-400 ring-2 ring-amber-200',
              headerBg: 'bg-gradient-to-r from-amber-400 to-amber-500',
              badge: '🏆 Tout inclus',
              features: [
                'Tout le plan En vedette',
                'Badge 🏆 Premium exclusif',
                'Réservations en ligne',
                'Paiement d\'acompte sécurisé',
                'Dashboard statistiques avancé',
                'Support prioritaire 24h',
              ],
              missing: [],
              cta: 'Devenir Premium',
              href: '/auth/register',
              btnClass: 'btn-gold',
            },
          ].map(plan => (
            <div key={plan.name} className={`rounded-3xl border-2 ${plan.color} overflow-hidden flex flex-col`}>
              {/* Header */}
              <div className={`${plan.headerBg} p-6 ${plan.name === 'Gratuit' ? 'text-gray-700' : 'text-white'}`}>
                {plan.badge && (
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-current text-xs font-bold px-3 py-1 rounded-full mb-3">
                    {plan.badge}
                  </span>
                )}
                <p className="font-extrabold text-xl">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-sm opacity-75">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 flex-1 space-y-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>{f}
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="font-bold mt-0.5 flex-shrink-0">✕</span>{f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <Link href={plan.href} className={`${plan.btnClass} block text-center w-full py-3`}>
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Questions fréquentes</h2>
          {[
            { q: 'La commission s\'applique-t-elle aux clientes ?', a: 'Non, BeautyConnect est 100% gratuit pour les clientes. La commission de 10% est prélevée sur l\'acompte des réservations en ligne uniquement (plans Premium).' },
            { q: 'Puis-je annuler mon abonnement à tout moment ?', a: 'Oui, sans engagement. Tu peux annuler depuis ton tableau de bord et ton profil restera actif jusqu\'à la fin de la période payée.' },
            { q: 'Comment fonctionne l\'acompte ?', a: 'La cliente paie 30% du montant de la prestation en ligne via Stripe. Le reste (70%) est réglé directement avec toi lors du rendez-vous.' },
          ].map(({ q, a }) => (
            <details key={q} className="card p-5 group">
              <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                {q}
                <span className="text-pink-500 text-xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
