export interface PluginConfig {
  cookieName: string;
  cookieDays: number;
  captureAdIds: boolean;
  defaultDirectFallback: boolean;
  metaBoxPosition: 'side' | 'normal';
  captureLandingPage: boolean;
}

export const defaultConfig: PluginConfig = {
  cookieName: 'wc_first_click_attribution',
  cookieDays: 90,
  captureAdIds: true,
  defaultDirectFallback: true,
  metaBoxPosition: 'side',
  captureLandingPage: true,
};

export function generatePhpPluginCode(config: PluginConfig = defaultConfig): string {
  const lifespanSeconds = config.cookieDays * 86400;

  return `<?php
/**
 * Plugin Name: WooCommerce First-Click Attribution
 * Plugin URI:  https://oscarpx.com
 * Description: Captura y atribuye el primer contacto (First-Click) de marketing mediante parámetros UTM y referrers en WooCommerce. Persistencia de ${config.cookieDays} días, compatibilidad nativa con HPOS y sincronización en tiempo real con Google Tag Manager (Data Layer) con control anti-duplicidad.
 * Version:     1.0.0
 * Author:      OscarPx
 * Author URI:  https://oscarpx.com
 * License:     GPL-2.0-or-later
 * Text Domain: woo-first-click
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 9.3
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Evita el acceso directo si no se carga desde el núcleo de WordPress.
}

/**
 * Clase Principal: WC_First_Click_Attribution
 * Diseñada bajo arquitectura singleton y los más altos estándares de seguridad y rendimiento.
 */
final class WC_First_Click_Attribution {

    /**
     * Nombre de la cookie para almacenar la atribución de First-Click.
     * @var string
     */
    const COOKIE_NAME = '${config.cookieName}';

    /**
     * Duración de la cookie en segundos (${config.cookieDays} días).
     * @var int
     */
    const COOKIE_LIFESPAN = ${lifespanSeconds}; // ${config.cookieDays} * DAY_IN_SECONDS (${config.cookieDays} * 86400)

    /**
     * Instancia única del Singleton.
     * @var WC_First_Click_Attribution|null
     */
    private static $instance = null;

    /**
     * Cache en memoria de los datos del First Click durante la ejecución actual.
     * @var array|null
     */
    private $cached_first_click_data = null;

    /**
     * Obtiene la instancia única.
     * @return WC_First_Click_Attribution
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor privado: Registra hooks del ciclo de vida.
     */
    private function __construct() {
        // 1. Declarar compatibilidad con High-Performance Order Storage (HPOS) de WooCommerce
        add_action( 'before_woocommerce_init', array( $this, 'declare_hpos_compatibility' ) );

        // 2. Captura Inicial y Persistencia (First-Click): en 'init' antes de enviar headers
        add_action( 'init', array( $this, 'capture_first_click_visit' ), 1 );

        // 3. Vinculación con el Pedido WooCommerce (CRUD seguro)
        add_action( 'woocommerce_checkout_create_order', array( $this, 'attach_first_click_to_order' ), 20, 2 );

        // 4. Visualización en el Admin de WooCommerce (Detalle del pedido)
        add_action( 'woocommerce_admin_order_data_after_billing_address', array( $this, 'render_admin_order_attribution_fields' ), 10, 1 );

        // Soporte de Meta Box para WooCommerce (pantalla tradicional y HPOS)
        add_action( 'add_meta_boxes', array( $this, 'register_admin_attribution_metabox' ) );

        // 5. Inyección en el Data Layer de Google Tag Manager (wp_head con prioridad 1)
        add_action( 'wp_head', array( $this, 'inject_gtm_data_layer_script' ), 1 );
    }

    /**
     * Declara compatibilidad explícita con WooCommerce High-Performance Order Storage (HPOS / COT).
     */
    public function declare_hpos_compatibility() {
        if ( class_exists( '\\Automattic\\WooCommerce\\Utilities\\FeaturesUtil' ) ) {
            \\Automattic\\WooCommerce\\Utilities\\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
        }
    }

    /**
     * CAPTURA INICIAL Y PERSISTENCIA (FIRST-CLICK):
     * Evalúa si el visitante tiene parámetros UTM o viene de un referrer externo.
     * REGLA DE ORO: Si la cookie ya existe, JAMÁS se sobrescribe.
     */
    public function capture_first_click_visit() {
        // No ejecutar en WP-Cron, llamadas REST API o WP-CLI
        if ( ( defined( 'DOING_CRON' ) && DOING_CRON ) || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
            return;
        }

        // Si ya existe la cookie de First-Click, respetamos la regla inmutable: NO SOBREESCRIBIR
        if ( ! empty( $_COOKIE[ self::COOKIE_NAME ] ) ) {
            return;
        }

        // Inspeccionar parámetros UTM enviados en la URL
        $has_utm = false;
        $utm_params = array(
            'utm_source'   => '',
            'utm_medium'   => '',
            'utm_campaign' => '',
            'utm_term'     => '',
            'utm_content'  => '',
        );

        foreach ( $utm_params as $key => $default_val ) {
            if ( isset( $_GET[ $key ] ) && '' !== trim( $_GET[ $key ] ) ) {
                // Saneamiento estricto de entrada
                $utm_params[ $key ] = sanitize_text_field( wp_unslash( $_GET[ $key ] ) );
                $has_utm = true;
            }
        }
${
  config.captureAdIds
    ? `
        // Capturar click IDs publicitarios comunes (Google Ads, Facebook/Instagram Ads, TikTok Ads)
        $ad_click_id = '';
        if ( isset( $_GET['gclid'] ) && '' !== trim( $_GET['gclid'] ) ) {
            $ad_click_id = 'gclid:' . sanitize_text_field( wp_unslash( $_GET['gclid'] ) );
        } elseif ( isset( $_GET['fbclid'] ) && '' !== trim( $_GET['fbclid'] ) ) {
            $ad_click_id = 'fbclid:' . sanitize_text_field( wp_unslash( $_GET['fbclid'] ) );
        } elseif ( isset( $_GET['ttclid'] ) && '' !== trim( $_GET['ttclid'] ) ) {
            $ad_click_id = 'ttclid:' . sanitize_text_field( wp_unslash( $_GET['ttclid'] ) );
        }
`
    : `        $ad_click_id = '';`
}
        // Inspeccionar HTTP Referer
        $http_referer    = isset( $_SERVER['HTTP_REFERER'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_REFERER'] ) ) : '';
        $is_external_ref = false;
        $clean_referrer  = '';

        if ( ! empty( $http_referer ) ) {
            $ref_host  = wp_parse_url( $http_referer, PHP_URL_HOST );
            $site_host = wp_parse_url( home_url(), PHP_URL_HOST );

            // Si el host del referer es diferente al del propio sitio web, es una fuente externa
            if ( ! empty( $ref_host ) && strtolower( $ref_host ) !== strtolower( $site_host ) ) {
                $is_external_ref = true;
                $clean_referrer  = esc_url_raw( $http_referer );
            }
        }

        // Si no hay UTMs ni referrer externo${config.captureAdIds ? ' ni click IDs' : ''}
        if ( ! $has_utm && ! $is_external_ref && empty( $ad_click_id ) ) {
${
  config.defaultDirectFallback
    ? `            // Tráfico directo puro en primera visita: registrar direct / none
            $utm_params['utm_source']   = 'direct';
            $utm_params['utm_medium']   = 'none';
            $utm_params['utm_campaign'] = '(direct)';`
    : `            // No se registran datos sin fuentes identificadas
            return;`
}
        } elseif ( ! $has_utm && $is_external_ref ) {
            // Referrer orgánico sin UTMs (ej. google.com, bing.com, instagram.com)
            $source = $this->derive_source_from_host( $ref_host );
            $medium = $this->derive_medium_from_host( $ref_host );

            $utm_params['utm_source']   = $source;
            $utm_params['utm_medium']   = $medium;
            $utm_params['utm_campaign'] = '(referral)';
        }

        // Capturar URL de aterrizaje (Landing Page)
        $landing_page = ${config.captureLandingPage ? '$this->get_current_clean_url()' : "''"};

        // Estructura completa de atribución First-Click
        $first_click_payload = array(
            'utm_source'             => $utm_params['utm_source'],
            'utm_medium'             => $utm_params['utm_medium'],
            'utm_campaign'           => $utm_params['utm_campaign'],
            'utm_term'               => $utm_params['utm_term'],
            'utm_content'            => $utm_params['utm_content'],
            'referrer'               => $clean_referrer,
            'landing_page'           => $landing_page,
            'ad_click_id'            => $ad_click_id,
            'first_visit_timestamp'  => time(),
            'first_visit_date_utc'   => gmdate( 'Y-m-d H:i:s' ),
        );

        $this->cached_first_click_data = $first_click_payload;

        // Persistir en Cookie de ${config.cookieDays} días (HttpOnly para máxima seguridad)
        $this->set_first_click_cookie( $first_click_payload );
    }

    /**
     * Establece la cookie HttpOnly de forma segura.
     *
     * @param array $data
     */
    private function set_first_click_cookie( array $data ) {
        if ( headers_sent() ) {
            return;
        }

        $json_payload = wp_json_encode( $data );
        if ( false === $json_payload ) {
            return;
        }

        $expire_time   = time() + self::COOKIE_LIFESPAN;
        $cookie_path   = defined( 'COOKIEPATH' ) && COOKIEPATH ? COOKIEPATH : '/';
        $cookie_domain = defined( 'COOKIE_DOMAIN' ) && COOKIE_DOMAIN ? COOKIE_DOMAIN : '';
        $is_secure     = is_ssl();

        if ( PHP_VERSION_ID >= 70300 ) {
            setcookie(
                self::COOKIE_NAME,
                $json_payload,
                array(
                    'expires'  => $expire_time,
                    'path'     => $cookie_path,
                    'domain'   => $cookie_domain,
                    'secure'   => $is_secure,
                    'httponly' => true, // Requisito estricto de seguridad: previene robo de cookie vía scripts
                    'samesite' => 'Lax', // Permite que la cookie sea enviada al hacer click desde redes/anuncios
                )
            );
        } else {
            setcookie(
                self::COOKIE_NAME,
                $json_payload,
                $expire_time,
                $cookie_path . '; samesite=Lax',
                $cookie_domain,
                $is_secure,
                true
            );
        }

        $_COOKIE[ self::COOKIE_NAME ] = $json_payload;
    }

    /**
     * Recupera y deserializa de forma segura los datos de la cookie First-Click.
     *
     * @return array|null
     */
    public function get_first_click_data() {
        if ( null !== $this->cached_first_click_data ) {
            return $this->cached_first_click_data;
        }

        if ( empty( $_COOKIE[ self::COOKIE_NAME ] ) ) {
            return null;
        }

        $raw_cookie = wp_unslash( $_COOKIE[ self::COOKIE_NAME ] );
        $decoded = json_decode( $raw_cookie, true );

        if ( ! is_array( $decoded ) ) {
            return null;
        }

        // Sanitización defensiva de cada clave al leer la cookie
        $clean_data = array(
            'utm_source'            => isset( $decoded['utm_source'] ) ? sanitize_text_field( $decoded['utm_source'] ) : '',
            'utm_medium'            => isset( $decoded['utm_medium'] ) ? sanitize_text_field( $decoded['utm_medium'] ) : '',
            'utm_campaign'          => isset( $decoded['utm_campaign'] ) ? sanitize_text_field( $decoded['utm_campaign'] ) : '',
            'utm_term'              => isset( $decoded['utm_term'] ) ? sanitize_text_field( $decoded['utm_term'] ) : '',
            'utm_content'           => isset( $decoded['utm_content'] ) ? sanitize_text_field( $decoded['utm_content'] ) : '',
            'referrer'              => isset( $decoded['referrer'] ) ? esc_url_raw( $decoded['referrer'] ) : '',
            'landing_page'          => isset( $decoded['landing_page'] ) ? esc_url_raw( $decoded['landing_page'] ) : '',
            'ad_click_id'           => isset( $decoded['ad_click_id'] ) ? sanitize_text_field( $decoded['ad_click_id'] ) : '',
            'first_visit_timestamp' => isset( $decoded['first_visit_timestamp'] ) ? absint( $decoded['first_visit_timestamp'] ) : 0,
            'first_visit_date_utc'  => isset( $decoded['first_visit_date_utc'] ) ? sanitize_text_field( $decoded['first_visit_date_utc'] ) : '',
        );

        $this->cached_first_click_data = $clean_data;
        return $clean_data;
    }

    /**
     * VINCULACIÓN CON EL PEDIDO (CRUD WooCommerce):
     * Hook: woocommerce_checkout_create_order
     *
     * @param WC_Order $order
     * @param array    $data
     */
    public function attach_first_click_to_order( $order, $data ) {
        if ( ! $order instanceof WC_Order ) {
            return;
        }

        $first_click = $this->get_first_click_data();

        if ( empty( $first_click ) || ! is_array( $first_click ) ) {
            $order->update_meta_data( '_first_click_utm_source', 'direct' );
            $order->update_meta_data( '_first_click_utm_medium', 'none' );
            $order->update_meta_data( '_first_click_utm_campaign', '(direct)' );
            $order->update_meta_data( '_first_click_status', 'no_cookie_found' );
            return;
        }

        // Guardado seguro mediante la API CRUD nativa de WooCommerce (sin SQL directo $wpdb)
        $order->update_meta_data( '_first_click_utm_source',   $first_click['utm_source'] );
        $order->update_meta_data( '_first_click_utm_medium',   $first_click['utm_medium'] );
        $order->update_meta_data( '_first_click_utm_campaign', $first_click['utm_campaign'] );
        $order->update_meta_data( '_first_click_utm_term',     $first_click['utm_term'] );
        $order->update_meta_data( '_first_click_utm_content',  $first_click['utm_content'] );
        $order->update_meta_data( '_first_click_referrer',     $first_click['referrer'] );
        $order->update_meta_data( '_first_click_landing_page', $first_click['landing_page'] );
        $order->update_meta_data( '_first_click_ad_click_id',  $first_click['ad_click_id'] );
        $order->update_meta_data( '_first_click_timestamp',    $first_click['first_visit_timestamp'] );
        $order->update_meta_data( '_first_click_date_utc',     $first_click['first_visit_date_utc'] );

        // Cálculo y almacenamiento de la latencia de conversión (Lag Time en días)
        if ( ! empty( $first_click['first_visit_timestamp'] ) ) {
            $conversion_seconds = time() - $first_click['first_visit_timestamp'];
            $lag_days = round( $conversion_seconds / DAY_IN_SECONDS, 2 );
            $order->update_meta_data( '_first_click_lag_days', (string) $lag_days );
        }
    }

    /**
     * VISUALIZACIÓN EN EL ADMIN DE WOOCOMMERCE:
     * Hook: woocommerce_admin_order_data_after_billing_address
     *
     * @param WC_Order $order
     */
    public function render_admin_order_attribution_fields( $order ) {
        if ( ! $order instanceof WC_Order ) {
            return;
        }

        $source    = $order->get_meta( '_first_click_utm_source' );
        $medium    = $order->get_meta( '_first_click_utm_medium' );
        $campaign  = $order->get_meta( '_first_click_utm_campaign' );
        $term      = $order->get_meta( '_first_click_utm_term' );
        $content   = $order->get_meta( '_first_click_utm_content' );
        $referrer  = $order->get_meta( '_first_click_referrer' );
        $landing   = $order->get_meta( '_first_click_landing_page' );
        $date_utc  = $order->get_meta( '_first_click_date_utc' );
        $lag_days  = $order->get_meta( '_first_click_lag_days' );
        $ad_id     = $order->get_meta( '_first_click_ad_click_id' );

        if ( empty( $source ) && empty( $referrer ) ) {
            echo '<p class="form-field form-field-wide"><strong>' . esc_html__( 'First-Click Atribución:', 'woo-first-click' ) . '</strong> <em>' . esc_html__( 'Sin datos capturados para este pedido.', 'woo-first-click' ) . '</em></p>';
            return;
        }
        ?>
        <div class="order_data_column" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
            <h4 style="margin: 0 0 10px 0; color: #1d2327; display: flex; align-items: center; gap: 6px;">
                <span class="dashicons dashicons-chart-pie" style="color: #2271b1;"></span>
                <?php esc_html_e( 'Atribución de Marketing (First-Click)', 'woo-first-click' ); ?>
            </h4>
            <div style="background: #f6f7f7; border: 1px solid #c3c4c7; border-left: 4px solid #2271b1; padding: 10px 12px; border-radius: 4px; font-size: 13px; line-height: 1.6;">
                <p style="margin: 0 0 6px 0;">
                    <strong><?php esc_html_e( 'Fuente (UTM Source):', 'woo-first-click' ); ?></strong>
                    <span class="badge" style="background: #e7f3ff; color: #185a9d; padding: 2px 6px; border-radius: 3px; font-weight: 600;">
                        <?php echo esc_html( $source ?: '—' ); ?>
                    </span>
                </p>
                <p style="margin: 0 0 6px 0;">
                    <strong><?php esc_html_e( 'Medio (UTM Medium):', 'woo-first-click' ); ?></strong>
                    <span class="badge" style="background: #f0f0f1; color: #2c3338; padding: 2px 6px; border-radius: 3px;">
                        <?php echo esc_html( $medium ?: '—' ); ?>
                    </span>
                </p>
                <p style="margin: 0 0 6px 0;">
                    <strong><?php esc_html_e( 'Campaña (UTM Campaign):', 'woo-first-click' ); ?></strong>
                    <code><?php echo esc_html( $campaign ?: '—' ); ?></code>
                </p>
                <?php if ( ! empty( $term ) ) : ?>
                    <p style="margin: 0 0 6px 0;">
                        <strong><?php esc_html_e( 'Término (UTM Term):', 'woo-first-click' ); ?></strong>
                        <?php echo esc_html( $term ); ?>
                    </p>
                <?php endif; ?>
                <?php if ( ! empty( $content ) ) : ?>
                    <p style="margin: 0 0 6px 0;">
                        <strong><?php esc_html_e( 'Contenido (UTM Content):', 'woo-first-click' ); ?></strong>
                        <?php echo esc_html( $content ); ?>
                    </p>
                <?php endif; ?>
                <?php if ( ! empty( $ad_id ) ) : ?>
                    <p style="margin: 0 0 6px 0;">
                        <strong><?php esc_html_e( 'Click ID (Ad Identifier):', 'woo-first-click' ); ?></strong>
                        <code><?php echo esc_html( $ad_id ); ?></code>
                    </p>
                <?php endif; ?>
                <?php if ( ! empty( $referrer ) ) : ?>
                    <p style="margin: 0 0 6px 0; word-break: break-all;">
                        <strong><?php esc_html_e( 'Referer Inicial:', 'woo-first-click' ); ?></strong>
                        <a href="<?php echo esc_url( $referrer ); ?>" target="_blank" rel="noopener noreferrer">
                            <?php echo esc_html( $referrer ); ?>
                        </a>
                    </p>
                <?php endif; ?>
                <?php if ( ! empty( $landing ) ) : ?>
                    <p style="margin: 0 0 6px 0; word-break: break-all;">
                        <strong><?php esc_html_e( 'Landing Page Inicial:', 'woo-first-click' ); ?></strong>
                        <a href="<?php echo esc_url( $landing ); ?>" target="_blank" rel="noopener noreferrer">
                            <?php echo esc_html( $landing ); ?>
                        </a>
                    </p>
                <?php endif; ?>
                <?php if ( ! empty( $date_utc ) ) : ?>
                    <p style="margin: 0 0 6px 0;">
                        <strong><?php esc_html_e( 'Primer Contacto (UTC):', 'woo-first-click' ); ?></strong>
                        <?php echo esc_html( $date_utc ); ?>
                    </p>
                <?php endif; ?>
                <?php if ( '' !== $lag_days && null !== $lag_days ) : ?>
                    <p style="margin: 0;">
                        <strong><?php esc_html_e( 'Latencia de Conversión:', 'woo-first-click' ); ?></strong>
                        <span style="font-weight: 600; color: #135e96;">
                            <?php printf( esc_html__( '%s días entre primer clic y compra', 'woo-first-click' ), esc_html( $lag_days ) ); ?>
                        </span>
                    </p>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    /**
     * Registra un Meta Box dedicado tanto para pantallas clásicas como para HPOS.
     */
    public function register_admin_attribution_metabox() {
        $screen = class_exists( '\\Automattic\\WooCommerce\\Internal\\DataStores\\Orders\\CustomOrdersTableController' ) &&
                  wc_get_container()->get( \\Automattic\\WooCommerce\\Internal\\DataStores\\Orders\\CustomOrdersTableController::class )->custom_orders_table_usage_is_enabled()
                  ? wc_get_page_screen_id( 'shop_order' )
                  : 'shop_order';

        add_meta_box(
            'wc_first_click_attribution_metabox',
            __( 'Atribución de Marketing (First-Touch)', 'woo-first-click' ),
            array( $this, 'render_attribution_metabox_content' ),
            $screen,
            '${config.metaBoxPosition}',
            'default'
        );
    }

    /**
     * Renderiza el contenido del Meta Box lateral.
     *
     * @param WP_Post|WC_Order $post_or_order
     */
    public function render_attribution_metabox_content( $post_or_order ) {
        $order = ( $post_or_order instanceof WC_Order ) ? $post_or_order : wc_get_order( $post_or_order->ID );
        if ( ! $order ) {
            return;
        }

        $source   = $order->get_meta( '_first_click_utm_source' );
        $medium   = $order->get_meta( '_first_click_utm_medium' );
        $campaign = $order->get_meta( '_first_click_utm_campaign' );
        $lag_days = $order->get_meta( '_first_click_lag_days' );
        $date_utc = $order->get_meta( '_first_click_date_utc' );

        if ( empty( $source ) ) {
            echo '<p style="color: #646970;">' . esc_html__( 'Sin datos de First-Click registrados en este pedido.', 'woo-first-click' ) . '</p>';
            return;
        }
        ?>
        <div style="font-size: 12px; line-height: 1.5;">
            <p><strong><?php esc_html_e( 'Canal Original:', 'woo-first-click' ); ?></strong><br>
                <code style="display:inline-block; margin-top:2px;"><?php echo esc_html( $source . ' / ' . ( $medium ?: 'none' ) ); ?></code>
            </p>
            <p><strong><?php esc_html_e( 'Campaña:', 'woo-first-click' ); ?></strong><br>
                <span><?php echo esc_html( $campaign ?: '(not set)' ); ?></span>
            </p>
            <?php if ( '' !== $lag_days ) : ?>
                <p><strong><?php esc_html_e( 'Días hasta la compra:', 'woo-first-click' ); ?></strong><br>
                    <span><?php echo esc_html( $lag_days ); ?> <?php esc_html_e( 'días', 'woo-first-click' ); ?></span>
                </p>
            <?php endif; ?>
            <?php if ( ! empty( $date_utc ) ) : ?>
                <p><strong><?php esc_html_e( 'Fecha Primer Clic:', 'woo-first-click' ); ?></strong><br>
                    <span style="color:#646970;"><?php echo esc_html( $date_utc ); ?></span>
                </p>
            <?php endif; ?>
        </div>
        <?php
    }

    /**
     * INYECCIÓN EN EL DATA LAYER DE GOOGLE TAG MANAGER:
     * Hook: wp_head con prioridad 1 (ejecuta antes de que cargue el script del contenedor de GTM).
     *
     * Anti-duplicidad con sessionStorage:
     * - Verifica si sessionStorage.getItem('first_click_pushed') existe.
     * - Si no existe, ejecuta window.dataLayer.push({ event: 'first_click_ready', ... }).
     * - Define sessionStorage.setItem('first_click_pushed', 'true').
     *
     * Seguridad estricta:
     * - Sanitización de variables.
     * - Codificación mediante wp_json_encode() para prevenir XSS.
     */
    public function inject_gtm_data_layer_script() {
        if ( is_admin() || is_feed() ) {
            return;
        }

        $first_click = $this->get_first_click_data();

        $dl_data = array(
            'event'                => 'first_click_ready',
            'first_click_source'   => ! empty( $first_click['utm_source'] ) ? $first_click['utm_source'] : 'direct',
            'first_click_medium'   => ! empty( $first_click['utm_medium'] ) ? $first_click['utm_medium'] : 'none',
            'first_click_campaign' => ! empty( $first_click['utm_campaign'] ) ? $first_click['utm_campaign'] : '(direct)',
            'first_click_term'     => ! empty( $first_click['utm_term'] ) ? $first_click['utm_term'] : '',
            'first_click_content'  => ! empty( $first_click['utm_content'] ) ? $first_click['utm_content'] : '',
            'first_click_referrer' => ! empty( $first_click['referrer'] ) ? $first_click['referrer'] : '',
            'first_click_landing'  => ! empty( $first_click['landing_page'] ) ? $first_click['landing_page'] : '',
            'first_click_timestamp'=> ! empty( $first_click['first_visit_timestamp'] ) ? $first_click['first_visit_timestamp'] : 0,
            'first_click_date_utc' => ! empty( $first_click['first_visit_date_utc'] ) ? $first_click['first_visit_date_utc'] : '',
        );

        $json_dl_payload = wp_json_encode( $dl_data );
        if ( false === $json_dl_payload ) {
            return;
        }
        ?>
<!-- WooCommerce First-Click Marketing Attribution -> GTM Data Layer (Priority 1) -->
<script id="woo-first-click-datalayer">
(function() {
    'use strict';
    try {
        var storageKey = 'first_click_pushed';
        // Validación Anti-Duplicidad: verificar si ya fue disparado en esta sesión de navegación
        if (!window.sessionStorage || !window.sessionStorage.getItem(storageKey)) {
            window.dataLayer = window.dataLayer || [];
            
            // Inyección del evento first_click_ready con payload saneado
            var firstClickPayload = <?php echo $json_dl_payload; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>;
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
</script>
<!-- /WooCommerce First-Click Marketing Attribution -->
        <?php
    }

    /**
     * Deriva una fuente amigable a partir del host del referer.
     *
     * @param string $host
     * @return string
     */
    private function derive_source_from_host( $host ) {
        if ( empty( $host ) ) {
            return 'direct';
        }
        $host = strtolower( $host );
        if ( strpos( $host, 'google.' ) !== false ) {
            return 'google';
        }
        if ( strpos( $host, 'instagram.com' ) !== false ) {
            return 'instagram';
        }
        if ( strpos( $host, 'facebook.com' ) !== false || strpos( $host, 'fb.com' ) !== false ) {
            return 'facebook';
        }
        if ( strpos( $host, 'tiktok.com' ) !== false ) {
            return 'tiktok';
        }
        if ( strpos( $host, 'youtube.com' ) !== false ) {
            return 'youtube';
        }
        if ( strpos( $host, 'linkedin.com' ) !== false ) {
            return 'linkedin';
        }
        if ( strpos( $host, 't.co' ) !== false || strpos( $host, 'x.com' ) !== false || strpos( $host, 'twitter.com' ) !== false ) {
            return 'twitter';
        }
        if ( strpos( $host, 'bing.com' ) !== false ) {
            return 'bing';
        }
        if ( strpos( $host, 'pinterest.' ) !== false ) {
            return 'pinterest';
        }
        return preg_replace( '/^www\\./', '', $host );
    }

    /**
     * Deriva el medio (medium) a partir del host.
     *
     * @param string $host
     * @return string
     */
    private function derive_medium_from_host( $host ) {
        if ( empty( $host ) ) {
            return 'none';
        }
        $host = strtolower( $host );
        if ( strpos( $host, 'google.' ) !== false || strpos( $host, 'bing.' ) !== false || strpos( $host, 'yahoo.' ) !== false ) {
            return 'organic';
        }
        if ( strpos( $host, 'instagram.com' ) !== false || strpos( $host, 'facebook.com' ) !== false || strpos( $host, 'tiktok.com' ) !== false || strpos( $host, 'linkedin.com' ) !== false || strpos( $host, 't.co' ) !== false || strpos( $host, 'x.com' ) !== false ) {
            return 'social';
        }
        return 'referral';
    }

    /**
     * Obtiene la URL actual saneada para registrar como Landing Page.
     *
     * @return string
     */
    private function get_current_clean_url() {
        $scheme = is_ssl() ? 'https://' : 'http://';
        $host   = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';
        $uri    = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
        return esc_url_raw( $scheme . $host . $uri );
    }
}

/**
 * Inicialización segura del plugin mediante singleton una vez que los plugins están cargados.
 */
add_action( 'plugins_loaded', function() {
    if ( class_exists( 'WooCommerce' ) ) {
        WC_First_Click_Attribution::get_instance();
    } else {
        add_action( 'admin_notices', function() {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p><strong><?php esc_html_e( 'WooCommerce First-Click Marketing Attribution', 'woo-first-click' ); ?>:</strong> <?php esc_html_e( 'Requiere que WooCommerce esté instalado y activo para registrar la atribución en los pedidos.', 'woo-first-click' ); ?></p>
            </div>
            <?php
        } );
    }
} );
`;
}
