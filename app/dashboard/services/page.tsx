'use client'
import { useEffect, useState, useCallback } from 'react'
import { getMyServices } from '@/lib/queries'
import { Service } from '@/types'
import ServiceForm from '@/components/ServiceForm'
import ServiceList from '@/components/ServiceList'
import { MAX_SERVICES } from '@/lib/constants'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => { setServices(await getMyServices()); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Mes prestations</h1><p className="text-sm text-gray-500 mt-1">Renseigne tes services avec leurs tarifs</p></div>
      <div className="card p-6 space-y-5">
        {services.length >= MAX_SERVICES && <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700">Maximum {MAX_SERVICES} prestations atteint</div>}
        <ServiceForm onAdded={load} disabled={services.length >= MAX_SERVICES} />
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Mes prestations ({services.length}/{MAX_SERVICES})</p>
          {loading ? <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div> : <ServiceList services={services} editable onUpdate={load} />}
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl">🔒</span>
        <div><p className="text-sm font-medium text-gray-700">Paiement en ligne — Bientôt disponible</p><p className="text-xs text-gray-400 mt-0.5">Tes clientes pourront bientôt réserver et payer sur BeautyConnect.</p></div>
      </div>
    </div>
  )
}
