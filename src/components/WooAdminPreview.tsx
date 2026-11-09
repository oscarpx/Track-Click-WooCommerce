import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar, 
  PieChart, 
  ExternalLink, 
  Check, 
  Clock, 
  Info,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Award
} from 'lucide-react';

export function WooAdminPreview() {
  const [selectedPreset, setSelectedPreset] = useState<'instagram' | 'tiktok' | 'google_cpc' | 'direct'>('instagram');

  const presets = {
    instagram: {
      source: 'instagram',
      medium: 'paid_social',
      campaign: 'black_friday_vip',
      term: 'zapatillas_running',
      content: 'video_carousel_feed',
      referrer: 'https://l.instagram.com/',
      landing: 'https://mitienda.com/producto/pro-runner-v2',
      adId: 'fbclid:IwAR3kX9sQ2...',
      date: '2026-11-08 14:22:10 UTC',
      lag: '1.42',
      revenue: '$189.00',
      lastClickWas: 'google / organic',
    },
    tiktok: {
      source: 'tiktok',
      medium: 'cpc',
      campaign: 'viral_challenge_2026',
      term: 'moda_urbana',
      content: 'creator_spark_ad_04',
      referrer: 'https://www.tiktok.com/',
      landing: 'https://mitienda.com/coleccion/invierno',
      adId: 'ttclid:98342890123...',
      date: '2026-11-05 09:12:44 UTC',
      lag: '4.10',
      revenue: '$320.00',
      lastClickWas: 'direct / none',
    },
    google_cpc: {
      source: 'google',
      medium: 'cpc',
      campaign: 'search_high_intent_shoes',
      term: 'comprar zapatillas running hombre',
      content: 'rsa_ad_variant_a',
      referrer: 'https://www.google.com/',
      landing: 'https://mitienda.com/shop',
      adId: 'gclid:CjwKCAjw...',
      date: '2026-11-09 01:15:20 UTC',
      lag: '0.35',
      revenue: '$149.00',
      lastClickWas: 'google / cpc',
    },
    direct: {
      source: 'direct',
      medium: 'none',
      campaign: '(direct)',
      term: '',
      content: '',
      referrer: '',
      landing: 'https://mitienda.com/',
      adId: '',
      date: '2026-11-09 06:10:00 UTC',
      lag: '0.12',
      revenue: '$95.00',
      lastClickWas: 'direct / none',
    },
  };

  const active = presets[selectedPreset];

  return (
    <div className="space-y-6">
      {/* Selector header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Simulador del Panel de Control de WordPress (WP-Admin)
          </h3>
          <p className="text-xs text-slate-500">
            Observa cómo el administrador de la tienda visualiza con claridad meridiana los datos del First-Click en los detalles del pedido.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['instagram', 'tiktok', 'google_cpc', 'direct'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPreset(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                selectedPreset === key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {key === 'instagram' && 'Instagram Ad'}
              {key === 'tiktok' && 'TikTok Spark'}
              {key === 'google_cpc' && 'Google Search'}
              {key === 'direct' && 'Directo'}
            </button>
          ))}
        </div>
      </div>

      {/* WordPress Admin Shell */}
      <div className="bg-[#f0f0f1] border border-slate-300 rounded-xl overflow-hidden shadow-lg font-sans text-slate-800">
        {/* WP Top Bar */}
        <div className="bg-[#1d2327] text-slate-300 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Mi Tienda WooCommerce
            </span>
            <span className="text-slate-500">|</span>
            <span>WooCommerce &gt; Pedidos &gt; Editar Pedido #1042</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Hola, Administrador</span>
            <div className="w-5 h-5 rounded-full bg-slate-700 text-[10px] flex items-center justify-center text-white">
              A
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 space-y-6">
          {/* Order Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-300">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">
                Pedido #1042 detalles
              </h1>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300">
                Completado
              </span>
              <span className="text-xs text-slate-500">
                Compatible con HPOS (High-Performance Order Storage)
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Pago completado vía Tarjeta de Crédito (Stripe)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Order Details Box (Left 8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-300 rounded-md p-5 shadow-sm space-y-6">
              {/* Columns: General, Billing, Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    General
                  </h4>
                  <p><strong>Fecha de creación:</strong> Hoy a las 11:34</p>
                  <p><strong>Estado:</strong> Completado</p>
                  <p><strong>Cliente:</strong> Carlos Gómez</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    Facturación
                  </h4>
                  <p>Carlos Gómez</p>
                  <p>Calle Gran Vía 28, 4º B</p>
                  <p>28013 Madrid, España</p>
                  <p>carlos.gomez@ejemplo.com</p>
                  <p>+34 600 123 456</p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                    Envío
                  </h4>
                  <p>Misma dirección de facturación</p>
                  <p><strong>Método:</strong> Envío Express (24-48h)</p>
                </div>
              </div>

              {/* THIS IS THE EXACT UI HOOK INJECTED BY OUR PLUGIN:
                  woocommerce_admin_order_data_after_billing_address */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 rounded bg-blue-100 text-blue-700">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Atribución de Marketing (First-Click)
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Inyectado vía hook <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">woocommerce_admin_order_data_after_billing_address</code>
                    </span>
                  </div>
                </div>

                {/* The Styled Attribution Card */}
                <div className="bg-[#f6f7f7] border border-[#c3c4c7] border-l-4 border-l-[#2271b1] p-4 rounded text-xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <span className="font-semibold text-slate-700">Fuente (UTM Source): </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-[#e7f3ff] text-[#185a9d] border border-blue-200">
                        {active.source}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700">Medio (UTM Medium): </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#f0f0f1] text-[#2c3338] border border-slate-300">
                        {active.medium}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700">Campaña (UTM Campaign): </span>
                      <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-mono text-[11px]">
                        {active.campaign}
                      </code>
                    </div>

                    {active.term && (
                      <div>
                        <span className="font-semibold text-slate-700">Término (UTM Term): </span>
                        <span className="text-slate-800">{active.term}</span>
                      </div>
                    )}

                    {active.content && (
                      <div>
                        <span className="font-semibold text-slate-700">Contenido (UTM Content): </span>
                        <span className="text-slate-800">{active.content}</span>
                      </div>
                    )}

                    {active.adId && (
                      <div>
                        <span className="font-semibold text-slate-700">Click ID (Ad Identifier): </span>
                        <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-purple-700 font-mono text-[11px]">
                          {active.adId}
                        </code>
                      </div>
                    )}
                  </div>

                  {active.referrer && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-semibold text-slate-700">Referer Inicial: </span>
                      <a
                        href={active.referrer}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2271b1] hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                      >
                        {active.referrer}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {active.landing && (
                    <div>
                      <span className="font-semibold text-slate-700">Landing Page Inicial: </span>
                      <a
                        href={active.landing}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2271b1] hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                      >
                        {active.landing}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-700">Primer Contacto Registrado: </span>
                      <span className="text-slate-600 font-mono">{active.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 text-[#135e96] font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{active.lag} días de latencia hasta la compra</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Artículos del Pedido</h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2.5">Artículo</th>
                        <th className="p-2.5 text-center">Coste</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-medium text-slate-900">
                          Zapatillas Pro Runner V2 (Talla 42 - Edición Limitada)
                        </td>
                        <td className="p-2.5 text-center">{active.revenue}</td>
                        <td className="p-2.5 text-center">1</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{active.revenue}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Meta Box (Right 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Custom Meta Box */}
              <div className="bg-white border border-slate-300 rounded-md shadow-sm">
                <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                    Atribución First-Touch
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] uppercase font-semibold">Canal Original:</span>
                    <div className="font-mono font-bold text-indigo-700 text-sm mt-0.5">
                      {active.source} / {active.medium}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px] uppercase font-semibold">Campaña:</span>
                    <div className="font-medium text-slate-800 mt-0.5 truncate">
                      {active.campaign}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500">Latencia:</span>
                    <span className="font-bold text-slate-900">{active.lag} días</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500">Last-Click Real:</span>
                    <span className="text-slate-600 line-through text-[11px]">{active.lastClickWas}</span>
                  </div>

                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-800 flex items-start gap-1.5 mt-2">
                    <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Ingreso de <strong>{active.revenue}</strong> protegido y acreditado a la fuente originaria.
                    </span>
                  </div>
                </div>
              </div>

              {/* HPOS & CRUD Security Verification Card */}
              <div className="bg-slate-900 text-white rounded-md p-4 text-xs space-y-2 border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Seguridad y HPOS Verificado</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Todos los metadatos se leen y escriben a través de <code className="text-emerald-300 font-mono">$order-&gt;get_meta()</code> y <code className="text-emerald-300 font-mono">$order-&gt;update_meta_data()</code>. Cero consultas directas <code className="text-rose-400">$wpdb</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
