import React, { useState } from 'react';
import { 
  Layers, 
  Terminal, 
  ShieldCheck, 
  RotateCw, 
  Trash2, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  Play,
  Zap,
  HelpCircle
} from 'lucide-react';

export function DataLayerInspector() {
  const [sessionStoragePushed, setSessionStoragePushed] = useState(true);
  const [copiedScript, setCopiedScript] = useState(false);
  const [events, setEvents] = useState<any[]>([
    {
      id: 1,
      type: 'dataLayer.push',
      event: 'first_click_ready',
      timestamp: '11:02:14.321',
      data: {
        event: 'first_click_ready',
        first_click_source: 'instagram',
        first_click_medium: 'paid_social',
        first_click_campaign: 'black_friday_vip',
        first_click_term: 'zapatillas_running',
        first_click_content: 'video_carousel_feed',
        first_click_referrer: 'https://l.instagram.com/',
        first_click_landing: 'https://mitienda.com/producto/pro-runner-v2',
        first_click_timestamp: 1731154934,
        first_click_date_utc: '2026-11-08 14:22:10 UTC',
      },
      status: 'pushed',
      note: 'Inyectado en wp_head (prioridad 1) antes del snippet de GTM',
    },
  ]);

  const simulateNewPageview = () => {
    const time = new Date().toLocaleTimeString() + '.' + Math.floor(Math.random() * 900 + 100);
    if (sessionStoragePushed) {
      setEvents((prev) => [
        {
          id: prev.length + 1,
          type: 'eval_wp_head',
          event: 'DUPLICADO EVITADO',
          timestamp: time,
          data: {
            sessionStorage_key: 'first_click_pushed',
            current_value: 'true',
            action: 'BLOQUEADO: No se ejecuta dataLayer.push',
          },
          status: 'blocked',
          note: 'Anti-Duplicidad activa: Previene inflar eventos en GTM/GA4',
        },
        ...prev,
      ]);
    } else {
      setEvents((prev) => [
        {
          id: prev.length + 1,
          type: 'dataLayer.push',
          event: 'first_click_ready',
          timestamp: time,
          data: {
            event: 'first_click_ready',
            first_click_source: 'instagram',
            first_click_medium: 'paid_social',
            first_click_campaign: 'black_friday_vip',
            first_click_timestamp: 1731154934,
          },
          status: 'pushed',
          note: 'Nueva sesión detectada: evento empujado exitosamente',
        },
        ...prev,
      ]);
      setSessionStoragePushed(true);
    }
  };

  const clearSession = () => {
    setSessionStoragePushed(false);
  };

  const sampleInlineScript = `<!-- WooCommerce First-Click Marketing Attribution -> GTM Data Layer (Priority 1) -->
<script id="woo-first-click-datalayer">
(function() {
    'use strict';
    try {
        var storageKey = 'first_click_pushed';
        // Control Anti-Duplicidad: verificar si ya fue disparado en esta sesión de navegación
        if (!window.sessionStorage || !window.sessionStorage.getItem(storageKey)) {
            window.dataLayer = window.dataLayer || [];
            
            // Inyección del evento first_click_ready con payload saneado
            var firstClickPayload = {
                "event": "first_click_ready",
                "first_click_source": "instagram",
                "first_click_medium": "paid_social",
                "first_click_campaign": "black_friday_vip",
                "first_click_term": "zapatillas_running",
                "first_click_content": "video_carousel_feed",
                "first_click_referrer": "https://l.instagram.com/",
                "first_click_landing": "https://mitienda.com/producto/pro-runner-v2",
                "first_click_timestamp": 1731154934,
                "first_click_date_utc": "2026-11-08 14:22:10 UTC"
            };
            window.dataLayer.push(firstClickPayload);

            // Marcar en sessionStorage para garantizar que solo se dispare 1 vez por sesión
            if (window.sessionStorage) {
                window.sessionStorage.setItem(storageKey, 'true');
            }
        }
    } catch (err) {
        if (window.console && typeof window.console.warn === 'function') {
            window.console.warn('[WooFirstClick] SessionStorage no accesible:', err);
        }
    }
})();
</script>`;

  const copyScript = () => {
    navigator.clipboard.writeText(sampleInlineScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-500/30">
              <Zap className="w-3.5 h-3.5" />
              Google Tag Manager & Data Layer Engine
            </div>
            <h2 className="text-xl font-bold text-white">
              Inyección Prioritaria en wp_head con Anti-Duplicidad por sessionStorage
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              El script corre con prioridad <code>1</code> en <code>wp_head</code>, asegurando que <code>dataLayer.push</code> se ejecute <em>antes</em> de que el contenedor de GTM inicie su evaluación de activadores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={simulateNewPageview}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Simular Carga de Página
            </button>
            <button
              onClick={clearSession}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              title="Borra la llave first_click_pushed para simular una nueva sesión de navegador"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset sessionStorage
            </button>
          </div>
        </div>

        {/* Status badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">wp_head Priority:</span>
            <span className="text-amber-400 font-bold">1 (Pre-GTM Header)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">sessionStorage State:</span>
            <span className={sessionStoragePushed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {sessionStoragePushed ? "'first_click_pushed': 'true'" : 'vacío (no-pushed)'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">XSS Sanitization:</span>
            <span className="text-emerald-400 font-bold">wp_json_encode() Safe</span>
          </div>
        </div>
      </div>

      {/* Two columns: Real-time Feed & Rendered HTML/Script snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Stream of Events */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Monitor del Data Layer en Tiempo Real
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {events.length} logs
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {events.map((ev) => (
              <div
                key={ev.id}
                className={`p-3.5 rounded-xl border text-xs transition-all ${
                  ev.status === 'pushed'
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50/70 border-amber-300 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    {ev.status === 'pushed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="font-mono">{ev.event}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{ev.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-600 mb-2 italic">
                  {ev.note}
                </p>
                <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(ev.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Exact Injected Code & GTM Variable Map */}
        <div className="lg:col-span-5 space-y-4">
          {/* HTML snippet box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Script HTML Inyectado en &lt;head&gt;
                </h4>
              </div>
              <button
                onClick={copyScript}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedScript ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="text-[10px] leading-relaxed font-mono p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-indigo-300 overflow-x-auto max-h-72">
              {sampleInlineScript}
            </pre>
          </div>

          {/* GTM Variable Mapping helper */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Mapeo de Variables en Google Tag Manager
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { name: 'dlv - first_click_source', key: 'first_click_source', desc: 'Fuente (ej: instagram, google)' },
                { name: 'dlv - first_click_medium', key: 'first_click_medium', desc: 'Medio (ej: paid_social, cpc)' },
                { name: 'dlv - first_click_campaign', key: 'first_click_campaign', desc: 'Nombre de la campaña' },
                { name: 'dlv - first_click_referrer', key: 'first_click_referrer', desc: 'URL del Referer inicial' },
                { name: 'dlv - first_click_lag_days', key: 'first_click_timestamp', desc: 'Timestamp para calcular latencia' },
              ].map((item, idx) => (
                <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-mono font-semibold text-indigo-900 text-[11px]">{item.name}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </div>
                  <code className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono">
                    {item.key}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
