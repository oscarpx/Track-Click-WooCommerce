import JSZip from 'jszip';
import { PluginConfig, generatePhpPluginCode } from './generatePhpCode';

export async function generatePluginZip(config: PluginConfig): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder('woo-first-click-attribution');

  const phpCode = generatePhpPluginCode(config);
  const readmeContent = `=== WooCommerce First-Click Attribution ===
Contributors: oscarpx
Tags: woocommerce, attribution, first-click, utm, gtm, data layer, marketing-analytics
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Captura y atribuye el primer contacto (First-Click) de marketing mediante parámetros UTM y referrers en WooCommerce. Persistencia de ${config.cookieDays} días, compatibilidad nativa con HPOS y sincronización en tiempo real con Google Tag Manager (Data Layer) con control anti-duplicidad.

== Description ==

Por defecto, WooCommerce y la mayoría de herramientas de comercio electrónico registran únicamente el "Last-Click". Si un cliente potencial descubre tu tienda hoy a través de un anuncio pagado en Instagram (Instagram Ads), pero no compra de inmediato y regresa mañana buscando tu marca en Google Orgánico, el pedido de WooCommerce y los reportes tradicionales asignan el 100% del mérito y los ingresos a Google Orgánico. Esto genera una atribución sesgada y una toma de decisiones errónea al recortar presupuestos en canales de descubrimiento.

Este plugin soluciona el problema de atribución:
1. **Captura en First-Click Inmutable**: Si el usuario entra con parámetros UTM o un referrer externo, se almacena en una cookie segura HttpOnly de ${config.cookieDays} días. Si la cookie ya existe, **NUNCA** se sobrescribe.
2. **Asociación en Pedidos WooCommerce**: En el hook \`woocommerce_checkout_create_order\`, se leen los datos y se guardan mediante la API CRUD nativa de WooCommerce (\`$order->update_meta_data()\`), sin consultar \`$wpdb\` y compatible con High-Performance Order Storage (HPOS).
3. **Visualización en Pedidos de Administrador**: Muestra un bloque informativo enriquecido bajo la dirección de facturación y un Meta Box con Fuente, Medio, Campaña, Término, Contenido, Referrer, Landing Page y Días de Latencia (Conversion Lag).
4. **Data Layer de GTM Anti-Duplicado**: En \`wp_head\` con prioridad 1, inyecta \`window.dataLayer.push({ event: 'first_click_ready', ... })\`. Utiliza \`sessionStorage\` para dispararse exactamente una sola vez por sesión de navegación.

== Installation ==

1. Sube este archivo ZIP desde WordPress Admin > Plugins > Añadir nuevo > Subir plugin.
2. Activa el plugin.
3. Asegúrate de tener WooCommerce activo.
4. En Google Tag Manager, crea un activador de tipo "Evento Personalizado" llamado \`first_click_ready\`.
`;

  const gtmRecipe = JSON.stringify(
    {
      exportFormatVersion: 2,
      exportTime: new Date().toISOString(),
      containerVersion: {
        path: 'accounts/000000/containers/000000/versions/0',
        accountId: '000000',
        containerId: '000000',
        container: {
          name: 'First-Click Marketing Attribution Recipe',
          publicId: 'GTM-FIRSTCLICK',
          usageContext: ['WEB'],
        },
        tag: [
          {
            name: 'c_dl - First Click to GA4 User Properties',
            type: 'gaawe',
            parameter: [
              { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'false' },
              { type: 'TEMPLATE', key: 'eventName', value: 'first_click_attribution' },
            ],
          },
        ],
        trigger: [
          {
            name: 'Event - first_click_ready',
            type: 'CUSTOM_EVENT',
            customEventFilter: [
              {
                type: 'EQUALS',
                parameter: [
                  { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
                  { type: 'TEMPLATE', key: 'arg1', value: 'first_click_ready' },
                ],
              },
            ],
          },
        ],
        variable: [
          { name: 'dlv - first_click_source', type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, { type: 'TEMPLATE', key: 'name', value: 'first_click_source' }] },
          { name: 'dlv - first_click_medium', type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, { type: 'TEMPLATE', key: 'name', value: 'first_click_medium' }] },
          { name: 'dlv - first_click_campaign', type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, { type: 'TEMPLATE', key: 'name', value: 'first_click_campaign' }] },
          { name: 'dlv - first_click_term', type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, { type: 'TEMPLATE', key: 'name', value: 'first_click_term' }] },
          { name: 'dlv - first_click_content', type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, { type: 'TEMPLATE', key: 'name', value: 'first_click_content' }] },
          { name: 'dlv - first_click_referrer', type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, { type: 'TEMPLATE', key: 'name', value: 'first_click_referrer' }] },
          { name: 'dlv - first_click_landing', type: 'v', parameter: [{ type: 'INTEGER', key: 'dataLayerVersion', value: '2' }, { type: 'TEMPLATE', key: 'name', value: 'first_click_landing' }] },
        ],
      },
    },
    null,
    2
  );

  folder?.file('woo-first-click-attribution.php', phpCode);
  folder?.file('readme.txt', readmeContent);
  folder?.file('gtm-recipe-first-click.json', gtmRecipe);

  return await zip.generateAsync({ type: 'blob' });
}
