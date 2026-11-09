=== WooCommerce First-Click Attribution ===
Contributors: oscarpx
Tags: woocommerce, attribution, first-click, utm, gtm, data layer, marketing-analytics
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Captura y atribuye el primer contacto (First-Click) de marketing mediante parámetros UTM y referrers en WooCommerce. Persistencia de 90 días, compatibilidad nativa con HPOS y sincronización en tiempo real con Google Tag Manager (Data Layer) con control anti-duplicidad.

== Description ==

Por defecto, WooCommerce y la mayoría de herramientas de comercio electrónico registran únicamente el "Last-Click". Si un cliente potencial descubre tu tienda hoy a través de un anuncio pagado en Instagram (Instagram Ads), pero no compra de inmediato y regresa mañana buscando tu marca en Google Orgánico, el pedido de WooCommerce y los reportes tradicionales asignan el 100% del mérito y los ingresos a Google Orgánico. Esto genera una atribución sesgada y una toma de decisiones errónea al recortar presupuestos en canales de descubrimiento.

Este plugin soluciona el problema de atribución:
1. **Captura en First-Click Inmutable**: Si el usuario entra con parámetros UTM o un referrer externo, se almacena en una cookie segura HttpOnly de 90 días. Si la cookie ya existe, **NUNCA** se sobrescribe.
2. **Asociación en Pedidos WooCommerce**: En el hook `woocommerce_checkout_create_order`, se leen los datos y se guardan mediante la API CRUD nativa de WooCommerce (`$order->update_meta_data()`), sin consultar `$wpdb` y compatible con High-Performance Order Storage (HPOS).
3. **Visualización en Pedidos de Administrador**: Muestra un bloque informativo enriquecido bajo la dirección de facturación y un Meta Box con Fuente, Medio, Campaña, Término, Contenido, Referrer, Landing Page y Días de Latencia (Conversion Lag).
4. **Data Layer de GTM Anti-Duplicado**: En `wp_head` con prioridad 1, inyecta `window.dataLayer.push({ event: 'first_click_ready', ... })`. Utiliza `sessionStorage` para dispararse exactamente una sola vez por sesión de navegación.

== Installation ==

1. Sube la carpeta `woo-first-click-attribution` al directorio `/wp-content/plugins/` o sube el archivo ZIP desde Plugins > Añadir nuevo > Subir plugin.
2. Activa el plugin a través del menú 'Plugins' en WordPress.
3. Asegúrate de tener WooCommerce activo.
4. En Google Tag Manager, crea un activador de tipo "Evento Personalizado" llamado `first_click_ready`.
5. Lee las variables del Data Layer:
   - `first_click_source`
   - `first_click_medium`
   - `first_click_campaign`
   - `first_click_term`
   - `first_click_content`
   - `first_click_referrer`
   - `first_click_landing`
   - `first_click_timestamp`

== Frequently Asked Questions ==

= ¿Qué ocurre si un usuario entra por Instagram y luego por Google? =
El plugin detecta que ya existe la cookie `wc_first_click_attribution` y omite cualquier sobreescritura. El pedido final mantendrá la atribución original de Instagram.

= ¿Es compatible con High-Performance Order Storage (HPOS)? =
Sí, el plugin declara explícitamente compatibilidad con `custom_order_tables` y utiliza métodos CRUD de `WC_Order`.

= ¿Por qué la cookie es HttpOnly? =
Para evitar vulnerabilidades de robo de cookies mediante XSS en el navegador. La inyección en el Data Layer es efectuada de forma segura desde el backend en PHP con `wp_json_encode()`.
