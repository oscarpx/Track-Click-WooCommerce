import React, { useState } from 'react';
import { 
  FileCode, 
  PlayCircle, 
  Layers, 
  ShoppingBag, 
  ShieldCheck, 
  Download, 
  Sparkles,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  GitBranch,
  Sliders
} from 'lucide-react';
import { AttributionSimulator } from './components/AttributionSimulator';
import { PluginCodeViewer } from './components/PluginCodeViewer';
import { WooAdminPreview } from './components/WooAdminPreview';
import { DataLayerInspector } from './components/DataLayerInspector';
import { SecurityAudit } from './components/SecurityAudit';
import { PluginConfig, defaultConfig } from './utils/generatePhpCode';
import { generatePluginZip } from './utils/zipGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'admin' | 'gtm' | 'security'>('simulator');
  const [config, setConfig] = useState<PluginConfig>(defaultConfig);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleQuickDownload = async () => {
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
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm md:text-base leading-none">
                  WooCommerce First-Click Attribution
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200">
                  v1.0.0 • Por OscarPx (oscarpx.com)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block mt-0.5">
                Solución de atribución multitoque, persistencia de 90 días, compatibilidad HPOS y GTM Data Layer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('code')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <FileCode className="w-3.5 h-3.5" />
              Ver Código PHP
            </button>
            <button
              onClick={handleQuickDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generando...' : 'Descargar Plugin .ZIP'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          {[
            { id: 'simulator', label: '1. Simulador de Atribución (Journey)', icon: PlayCircle },
            { id: 'code', label: '2. Código PHP del Plugin (Completo)', icon: FileCode },
            { id: 'admin', label: '3. Vista en WP-Admin (Pedido)', icon: ShoppingBag },
            { id: 'gtm', label: '4. GTM Data Layer & Anti-Duplicidad', icon: Layers },
            { id: 'security', label: '5. Auditoría de Seguridad & HPOS', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeTab === 'simulator' && <AttributionSimulator />}
        {activeTab === 'code' && <PluginCodeViewer config={config} onConfigChange={setConfig} />}
        {activeTab === 'admin' && <WooAdminPreview />}
        {activeTab === 'gtm' && <DataLayerInspector />}
        {activeTab === 'security' && <SecurityAudit />}
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">WooCommerce First-Click Attribution v1.0.0</span>
            <span>•</span>
            <span>Desarrollado por <a href="https://oscarpx.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold hover:underline">OscarPx</a></span>
            <span>•</span>
            <span>Text Domain: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono text-[10px]">woo-first-click</code></span>
          </div>
          <div className="text-slate-400 text-[11px]">
            Compatible con WooCommerce 5.0 - 9.3+ • HPOS (Custom Order Tables) • PHP 7.4 / 8.0 / 8.1 / 8.2 / 8.3
          </div>
        </div>
      </footer>
    </div>
  );
}
