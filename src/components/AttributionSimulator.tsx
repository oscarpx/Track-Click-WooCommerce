import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  Layers, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

interface AttributionData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_page?: string;
  timestamp: number;
  dateStr: string;
}

export function AttributionSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [cookieState, setCookieState] = useState<AttributionData | null>(null);
  const [sessionStoragePushed, setSessionStoragePushed] = useState<boolean>(false);
  const [dataLayerLog, setDataLayerLog] = useState<any[]>([]);
  const [orderCreated, setOrderCreated] = useState<boolean>(false);
  const [orderMeta, setOrderMeta] = useState<Record<string, string> | null>(null);

  // Custom UTM sandbox input
  const [customSource, setCustomSource] = useState('instagram');
  const [customMedium, setCustomMedium] = useState('paid_social');
  const [customCampaign, setCustomCampaign] = useState('summer_promo_2026');
  const [customContent, setCustomContent] = useState('reel_influencer_01');
  const [customReferrer, setCustomReferrer] = useState('https://l.instagram.com/');

  const resetSimulation = () => {
    setCurrentStep(0);
    setCookieState(null);
    setSessionStoragePushed(false);
    setDataLayerLog([]);
    setOrderCreated(false);
    setOrderMeta(null);
  };

  // Step 1: User arrives via Instagram Ad
  const runStep1 = () => {
    const now = Date.now();
    const data: AttributionData = {
      utm_source: customSource,
      utm_medium: customMedium,
      utm_campaign: customCampaign,
      utm_content: customContent,
      utm_term: 'summer_shoes',
      referrer: customReferrer,
      landing_page: 'https://mitienda.com/producto/zapatillas-pro',
      timestamp: now,
      dateStr: new Date(now).toUTCString(),
    };

    setCookieState(data);

    // GTM Data Layer trigger with sessionStorage anti-duplication
    if (!sessionStoragePushed) {
      const eventPayload = {
        event: 'first_click_ready',
        first_click_source: data.utm_source,
        first_click_medium: data.utm_medium,
        first_click_campaign: data.utm_campaign,
        first_click_term: data.utm_term,
        first_click_content: data.utm_content,
        first_click_referrer: data.referrer,
        first_click_landing: data.landing_page,
        first_click_timestamp: Math.floor(data.timestamp / 1000),
      };
      setDataLayerLog((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          time: new Date().toLocaleTimeString(),
          action: 'dataLayer.push (INJECTED via wp_head)',
          payload: eventPayload,
          status: 'success',
        },
      ]);
      setSessionStoragePushed(true);
    }

    setCurrentStep(1);
  };

  // Step 2: User browses site on same day (Anti-duplicity check)
  const runStep2 = () => {
    // User visits /categoria/calzado
    // PHP runs wp_head.
    // Script checks sessionStorage.getItem('first_click_pushed') -> returns 'true'
    setDataLayerLog((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        time: new Date().toLocaleTimeString(),
        action: 'wp_head Script Evaluated on Navegación Interna',
        payload: {
          note: "sessionStorage.getItem('first_click_pushed') === 'true' -> EXECUTION BLOCKED",
        },
        status: 'blocked',
      },
    ]);
    setCurrentStep(2);
  };

  // Step 3: Next day, user searches Google Organic
  const runStep3 = () => {
    // New session on Day 2:
    // User clicked google.es -> ?utm_source=google&utm_medium=organic
    // Plugin checks: !empty($_COOKIE['wc_first_click_attribution'])
    // COOKIE ALREADY EXISTS! Script aborts setting cookie.
    setDataLayerLog((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        time: new Date().toLocaleTimeString(),
        action: 'Día 2: Visita por Google Orgánico detectada',
        payload: {
          note: 'Cookie wc_first_click_attribution ya existe en el navegador. REGLA DE ORO: NO SOBREESCRIBIR.',
          retained_first_click: cookieState?.utm_source,
        },
        status: 'protected',
      },
    ]);
    setCurrentStep(3);
  };

  // Step 4: User checkouts on WooCommerce
  const runStep4 = () => {
    if (!cookieState) return;

    // Simulate lag of 1.25 days
    const lagDays = '1.25';
    const meta: Record<string, string> = {
      _first_click_utm_source: cookieState.utm_source,
      _first_click_utm_medium: cookieState.utm_medium,
      _first_click_utm_campaign: cookieState.utm_campaign,
      _first_click_utm_term: cookieState.utm_term || '',
      _first_click_utm_content: cookieState.utm_content || '',
      _first_click_referrer: cookieState.referrer || '',
      _first_click_landing_page: cookieState.landing_page || '',
      _first_click_lag_days: lagDays,
      _first_click_timestamp: Math.floor(cookieState.timestamp / 1000).toString(),
      _first_click_date_utc: cookieState.dateStr,
    };

    setOrderMeta(meta);
    setOrderCreated(true);
    setCurrentStep(4);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Simulador Interactivo de Atribución Multitoque
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Prueba la Lógica: Instagram Ad (Día 1) → Google Orgánico (Día 2) → Compra
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Experimenta cómo el plugin protege la fuente originaria del cliente, previene duplicados en el Data Layer y garantiza que el retorno publicitario (ROAS) sea adjudicado a la campaña real que generó el descubrimiento.
            </p>
          </div>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl border border-slate-700 transition shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar Viaje
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                step: 1,
                title: '1. Primer Clic (Instagram)',
                desc: 'Captura UTM + Cookie 90d + GTM',
              },
              {
                step: 2,
                title: '2. Navegación (Día 1)',
                desc: 'Anti-Duplicidad sessionStorage',
              },
              {
                step: 3,
                title: '3. Regreso (Google)',
                desc: 'Regla de Oro: NO Sobreescribir',
              },
              {
                step: 4,
                title: '4. Pedido WooCommerce',
                desc: 'CRUD $order->update_meta_data',
              },
            ].map((s) => {
              const isPast = currentStep > s.step;
              const isCurrent = currentStep === s.step;
              return (
                <div
                  key={s.step}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg ring-1 ring-indigo-400'
                      : isPast
                      ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Paso {s.step}
                    </span>
                    {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />}
                  </div>
                  <div className="text-sm font-bold truncate">{s.title}</div>
                  <div className="text-xs text-slate-300/80 truncate mt-0.5">{s.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Controller Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Journey Simulation Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Play className="w-4 h-4 text-indigo-600" />
              Línea de Tiempo del Comportamiento del Cliente
            </h3>

            {/* Step 1 Controller */}
            <div className={`p-4 rounded-xl border transition-all mb-3 ${
              currentStep === 0 ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="font-semibold text-slate-900 text-sm">Día 1: Usuario hace clic en Anuncio de Instagram</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    La URL incluye: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-indigo-700">?utm_source={customSource}&utm_medium={customMedium}&utm_campaign={customCampaign}</code>
                  </p>
                </div>
                <button
                  disabled={currentStep !== 0}
                  onClick={runStep1}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold rounded-lg shadow transition shrink-0 flex items-center gap-1.5"
                >
                  Ejecutar Clic Inicial
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editable UTMs if at step 0 */}
              {currentStep === 0 && (
                <div className="mt-3 pt-3 border-t border-indigo-100 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">utm_source</label>
                    <input
                      type="text"
                      value={customSource}
                      onChange={(e) => setCustomSource(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">utm_medium</label>
                    <input
                      type="text"
                      value={customMedium}
                      onChange={(e) => setCustomMedium(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">utm_campaign</label>
                    <input
                      type="text"
                      value={customCampaign}
                      onChange={(e) => setCustomCampaign(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 Controller */}
            <div className={`p-4 rounded-xl border transition-all mb-3 ${
              currentStep === 1 ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="font-semibold text-slate-900 text-sm">Día 1: Navega a otra página de la tienda</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    El usuario visita <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">/categoria/calzado</code> en la misma sesión. Comprueba que el Data Layer no duplique el evento.
                  </p>
                </div>
                <button
                  disabled={currentStep !== 1}
                  onClick={runStep2}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold rounded-lg shadow transition shrink-0 flex items-center gap-1.5"
                >
                  Navegar Página
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 3 Controller */}
            <div className={`p-4 rounded-xl border transition-all mb-3 ${
              currentStep === 2 ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">3</span>
                    <h4 className="font-semibold text-slate-900 text-sm">Día 2: Regresa desde Google Orgánico</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    URL: <code className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">/?utm_source=google&utm_medium=organic</code>. El script evalúa si ya existe la cookie.
                  </p>
                </div>
                <button
                  disabled={currentStep !== 2}
                  onClick={runStep3}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold rounded-lg shadow transition shrink-0 flex items-center gap-1.5"
                >
                  Simular Google Organic
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step 4 Controller */}
            <div className={`p-4 rounded-xl border transition-all ${
              currentStep === 3 ? 'bg-indigo-50/70 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">4</span>
                    <h4 className="font-semibold text-slate-900 text-sm">Día 2: Completa Pedido WooCommerce #1042 ($189.00)</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-8">
                    Se dispara el hook <code className="bg-white px-1.5 py-0.5 rounded text-indigo-700">woocommerce_checkout_create_order</code> y vincula los metadatos CRUD al pedido.
                  </p>
                </div>
                <button
                  disabled={currentStep !== 3}
                  onClick={runStep4}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold rounded-lg shadow transition shrink-0 flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Crear Pedido
                </button>
              </div>
            </div>
          </div>

          {/* Attribution Comparison Card (After Checkout) */}
          {currentStep === 4 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-base mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ¡Problema de Atribución Resuelto con Éxito!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Default WooCommerce Flaw */}
                <div className="p-4 bg-white/90 rounded-xl border border-rose-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                      Sin este Plugin (Last-Click Nativo)
                    </span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="space-y-1 text-xs text-slate-700">
                    <p>• <strong>Canal Atribuido:</strong> Google Orgánico</p>
                    <p>• <strong>Ingreso Registrado para Instagram:</strong> $0.00 (ROAS: 0.0x)</p>
                    <p>• <strong>Impacto Negativo:</strong> El equipo de marketing concluye falsamente que Instagram Ads no funciona y apaga la campaña ganadora.</p>
                  </div>
                </div>

                {/* Our Plugin Solution */}
                <div className="p-4 bg-white/90 rounded-xl border border-emerald-300 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Con Nuestro Plugin (First-Click)
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="space-y-1 text-xs text-slate-700">
                    <p>• <strong>Canal Atribuido:</strong> <span className="text-indigo-700 font-bold">Instagram Ads (Paid Social)</span></p>
                    <p>• <strong>Ingreso Atribuido:</strong> <span className="text-emerald-700 font-bold">$189.00</span></p>
                    <p>• <strong>Latencia Registrada:</strong> 1.25 días de consideración</p>
                    <p>• <strong>Decisión Correcta:</strong> Se escala el presupuesto publicitario en Instagram al probar su papel detonante.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Real-time Memory & Storage Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {/* Cookie Inspector */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Cookie: wc_first_click_attribution
                </h4>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
                cookieState ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {cookieState ? '90 Días • HttpOnly' : 'Vacía (No Set)'}
              </span>
            </div>

            <div className="mt-3">
              {cookieState ? (
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>utm_source:</span>
                      <span className="text-emerald-400 font-bold">{cookieState.utm_source}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>utm_medium:</span>
                      <span className="text-indigo-300 font-bold">{cookieState.utm_medium}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>utm_campaign:</span>
                      <span className="text-amber-300">{cookieState.utm_campaign}</span>
                    </div>
                    {cookieState.utm_content && (
                      <div className="flex justify-between text-slate-400">
                        <span>utm_content:</span>
                        <span className="text-slate-300">{cookieState.utm_content}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-400">
                      <span>referrer:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{cookieState.referrer}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>expires:</span>
                      <span className="text-slate-400">+90 días (7,776,000s)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Regla de Oro: Inmutable. No será sobrescrita.</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  El visitante no ha interactuado aún con un enlace de campaña.
                </p>
              )}
            </div>
          </div>

          {/* SessionStorage & Anti-Duplicity Status */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  sessionStorage: 'first_click_pushed'
                </h4>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold ${
                sessionStoragePushed ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {sessionStoragePushed ? "'true' (Bloquea Duplicados)" : 'null (Pendiente)'}
              </span>
            </div>

            <div className="mt-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                Control de disparo estricto: Una vez que el navegador ejecuta el <code>dataLayer.push</code> en la primera carga, se escribe la llave en el <code>sessionStorage</code>. Cualquier navegación posterior en la pestaña queda protegida de inflar métricas en GTM/GA4.
              </p>
            </div>
          </div>

          {/* Data Layer Live Console */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Registro en Vivo de window.dataLayer
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {dataLayerLog.length} evento(s)
              </span>
            </div>

            <div className="mt-3 max-h-56 overflow-y-auto space-y-2 pr-1 font-mono text-xs">
              {dataLayerLog.length === 0 ? (
                <p className="text-slate-500 italic py-4 text-center">
                  Esperando disparos en window.dataLayer...
                </p>
              ) : (
                dataLayerLog.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-lg border text-[11px] ${
                      log.status === 'success'
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                        : log.status === 'blocked'
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                        : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-200'
                    }`}
                  >
                    <div className="flex justify-between font-bold mb-1">
                      <span>{log.action}</span>
                      <span className="opacity-70 text-[10px]">{log.time}</span>
                    </div>
                    <pre className="text-[10px] overflow-x-auto whitespace-pre-wrap opacity-90">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
