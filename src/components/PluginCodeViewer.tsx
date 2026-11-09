import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Sliders, 
  Search, 
  FileText, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { PluginConfig, generatePhpPluginCode, defaultConfig } from '../utils/generatePhpCode';
import { generatePluginZip } from '../utils/zipGenerator';

interface PluginCodeViewerProps {
  config: PluginConfig;
  onConfigChange: (config: PluginConfig) => void;
}

export function PluginCodeViewer({ config, onConfigChange }: PluginCodeViewerProps) {
  const [activeTab, setActiveTab] = useState<'php' | 'readme' | 'gtm' | 'install'>('php');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const phpCode = useMemo(() => generatePhpPluginCode(config), [config]);

  const handleCopy = () => {
    let contentToCopy = phpCode;
    if (activeTab === 'readme') contentToCopy = '...';
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generatePluginZip(config);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'woo-first-click-attribution.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const lines = useMemo(() => phpCode.split('\n'), [phpCode]);

  return (
    <div className="space-y-6">
      {/* Configuration Customizer Ribbon */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Personalizador de Parámetros del Plugin (Reactivo en Vivo)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Cualquier cambio actualiza el código PHP generado y el archivo ZIP instantáneamente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Duración de la Cookie (Días):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="30"
                max="365"
                step="30"
                value={config.cookieDays}
                onChange={(e) => onConfigChange({ ...config, cookieDays: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-indigo-600 w-12 text-right">
                {config.cookieDays}d
              </span>
            </div>
            <span className="text-[10px] text-slate-500">
              Recomendado: 90 días ({config.cookieDays * 86400} seg)
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Nombre de la Cookie:
            </label>
            <input
              type="text"
              value={config.cookieName}
              onChange={(e) => onConfigChange({ ...config, cookieName: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Capturar Ad Click IDs:
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={config.captureAdIds}
                onChange={(e) => onConfigChange({ ...config, captureAdIds: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
              />
              <span className="text-slate-700 font-medium">gclid, fbclid, ttclid</span>
            </label>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Fallback Tráfico Directo:
            </label>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={config.defaultDirectFallback}
                onChange={(e) => onConfigChange({ ...config, defaultDirectFallback: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
              />
              <span className="text-slate-700 font-medium">Registrar "direct / none"</span>
            </label>
          </div>
        </div>
      </div>

      {/* Code Header Bar with Tabs and Download */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 border-b border-slate-800 bg-slate-950/80 gap-3">
          {/* File Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('php')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition shrink-0 ${
                activeTab === 'php'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              woo-first-click-attribution.php
            </button>
            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition shrink-0 ${
                activeTab === 'readme'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              readme.txt
            </button>
            <button
              onClick={() => setActiveTab('install')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition shrink-0 ${
                activeTab === 'install'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Instrucciones de Instalación
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado al Portapapeles' : 'Copiar Código'}
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isDownloading ? 'Generando ZIP...' : 'Descargar Plugin (.ZIP)'}
            </button>
          </div>
        </div>

        {/* Search bar inside code viewer */}
        {activeTab === 'php' && (
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 w-full max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar o buscar función (ej. woocommerce_checkout_create_order, sanitize, wp_head)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {lines.length} líneas • PHP 7.4+ • HPOS Compatible
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 overflow-x-auto max-h-[600px] font-mono text-xs leading-relaxed">
          {activeTab === 'php' && (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());
                  return (
                    <tr
                      key={lineNum}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isHighlighted ? 'bg-indigo-900/40 border-l-2 border-indigo-400' : ''
                      }`}
                    >
                      <td className="w-12 text-right pr-4 text-slate-600 select-none text-[11px]">
                        {lineNum}
                      </td>
                      <td className="text-slate-200 whitespace-pre">
                        {line}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'readme' && (
            <div className="text-slate-300 font-mono text-xs whitespace-pre-wrap p-2 leading-relaxed">
{`=== WooCommerce First-Click Attribution ===
Contributors: oscarpx
Tags: woocommerce, attribution, first-click, utm, gtm, data layer, marketing-analytics
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later

== Description ==
Captura y atribuye el primer contacto (First-Click) de marketing mediante parámetros UTM y referrers en WooCommerce. Persistencia de ${config.cookieDays} días en cookies seguras HttpOnly, compatibilidad nativa con HPOS y sincronización en tiempo real con Google Tag Manager (Data Layer) con control anti-duplicidad por sessionStorage.

Autor: OscarPx (https://oscarpx.com)
Text Domain: woo-first-click`}
            </div>
          )}

          {activeTab === 'install' && (
            <div className="font-sans text-slate-200 space-y-4 p-2 max-w-3xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Guía Paso a Paso para Desplegar en tu WordPress / WooCommerce
              </h3>

              <ol className="space-y-4 text-xs text-slate-300 list-decimal pl-5">
                <li>
                  <strong>Descarga el archivo ZIP:</strong> Haz clic en el botón verde superior <code>Descargar Plugin (.ZIP)</code> para obtener <code>woo-first-click-attribution.zip</code>.
                </li>
                <li>
                  <strong>Súbelo a WordPress:</strong> Ve a tu panel de administración en <code>Plugins &gt; Añadir nuevo &gt; Subir plugin</code>, selecciona el ZIP y haz clic en <code>Instalar ahora</code>.
                </li>
                <li>
                  <strong>Activa el plugin:</strong> Pulsa en <code>Activar plugin</code>. El plugin verificará automáticamente que WooCommerce esté activo y declarará compatibilidad con HPOS.
                </li>
                <li>
                  <strong>Configura Google Tag Manager (GTM):</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-400">
                    <li>Crea un Activador de tipo <strong>Evento Personalizado</strong> con el nombre de evento: <code>first_click_ready</code>.</li>
                    <li>Crea Variables de Capa de Datos (Data Layer Variables) para: <code>first_click_source</code>, <code>first_click_medium</code>, <code>first_click_campaign</code>, <code>first_click_term</code>, <code>first_click_content</code>, <code>first_click_referrer</code>.</li>
                    <li>Crea una etiqueta de Evento GA4 vinculada al activador <code>first_click_ready</code> para enviar estos parámetros como Propiedades de Usuario (User-scoped properties) en Google Analytics 4.</li>
                  </ul>
                </li>
                <li>
                  <strong>¡Listo!</strong> Realiza un pedido de prueba entrando con <code>?utm_source=instagram&utm_medium=paid_social</code> y verifícalo en los detalles del pedido en WP-Admin.
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
