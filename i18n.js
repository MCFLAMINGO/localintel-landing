/**
 * i18n.js — LocalIntel owner backend translations
 * ─────────────────────────────────────────────────────────────────────────────
 * RULE: Every key MUST have both 'en' and 'es' entries.
 *       Any future string added to the owner backend must be added here first
 *       in both languages before it appears in any HTML or JS file.
 *
 * Usage:
 *   t('key')           → translated string in current language
 *   setLang('es')      → switch to Spanish, save to localStorage + business record
 *   getLang()          → 'en' | 'es'
 *   applyAll()         → swap all [data-i18n] elements on the page
 */

'use strict';

const STRINGS = {

  // ── GLOBAL NAV / LANG TOGGLE ──────────────────────────────────────────────
  lang_toggle_en:          { en: 'English', es: 'Inglés' },
  lang_toggle_es:          { en: 'Español', es: 'Español' },
  back_home:               { en: 'Back to home', es: 'Volver al inicio' },

  // ── CLAIM FLOW ─────────────────────────────────────────────────────────────

  // Language selector (step 0)
  lang_step_heading:       { en: 'Choose your language', es: 'Elige tu idioma' },
  lang_step_sub:           { en: 'You can change this any time from your dashboard.', es: 'Puedes cambiarlo en cualquier momento desde tu panel.' },
  lang_btn_english:        { en: 'Continue in English', es: 'Continuar en inglés' },
  lang_btn_spanish:        { en: 'Continuar en Español', es: 'Continuar en Español' },

  // Merchant portal card
  merchant_card_heading:   { en: 'Merchant dashboard', es: 'Panel de comerciante' },
  merchant_card_sub:       { en: "Enter your email — we'll send you a private link to your dashboard, or claim a new listing.", es: 'Ingresa tu correo — te enviaremos un enlace privado a tu panel o para reclamar un negocio.' },
  merchant_email_label:    { en: 'Email', es: 'Correo electrónico' },
  merchant_email_ph:       { en: 'you@example.com', es: 'tu@correo.com' },
  merchant_name_label:     { en: 'Business name', es: 'Nombre del negocio' },
  merchant_name_ph:        { en: 'e.g. Sunset Plumbing', es: 'ej. Plomería Sunset' },
  merchant_zip_label:      { en: 'ZIP', es: 'Código postal' },
  merchant_phone_label:    { en: 'Phone (optional)', es: 'Teléfono (opcional)' },
  merchant_address_label:  { en: 'Address (optional)', es: 'Dirección (opcional)' },
  merchant_category_label: { en: 'Category', es: 'Categoría' },
  merchant_category_ph:    { en: 'plumber, restaurant, salon, etc.', es: 'plomero, restaurante, salón, etc.' },
  merchant_new_sub:        { en: "We didn't find your business — fill these in to claim a new listing.", es: 'No encontramos tu negocio — completa estos campos para crear un perfil.' },
  merchant_send_btn:       { en: 'Send my dashboard link →', es: 'Enviar mi enlace al panel →' },
  merchant_sending_btn:    { en: 'Sending…', es: 'Enviando…' },
  merchant_sent_ok:        { en: "Check your inbox — your dashboard link is on the way.", es: 'Revisa tu correo — tu enlace al panel está en camino.' },
  merchant_or_claim:       { en: 'Or claim a Florida Sunbiz business below', es: 'O reclama un negocio registrado en Florida Sunbiz abajo' },

  // Step 1 — Find business
  step1_progress:          { en: 'Step 1 of 5', es: 'Paso 1 de 5' },
  step1_heading:           { en: 'Find your business listing', es: 'Encuentra tu negocio' },
  step1_sub:               { en: "Enter your business name or Florida Sunbiz document number. We'll find your listing in the state database.", es: 'Ingresa el nombre de tu negocio o el número de documento de Sunbiz de Florida. Lo buscaremos en la base de datos estatal.' },
  biz_name_label:          { en: 'Business name', es: 'Nombre del negocio' },
  biz_name_ph:             { en: 'e.g. McFlamingo', es: 'ej. McFlamingo' },
  zip_label:               { en: 'ZIP code', es: 'Código postal' },
  zip_ph:                  { en: 'e.g. 32082', es: 'ej. 32082' },
  or_divider:              { en: 'or', es: 'o' },
  sunbiz_label:            { en: 'Sunbiz document number', es: 'Número de documento Sunbiz' },
  sunbiz_ph:               { en: 'e.g. L21000012345', es: 'ej. L21000012345' },
  sunbiz_hint:             { en: 'Found on your Florida state business registration.', es: 'Lo encuentras en tu registro estatal de Florida.' },
  find_btn:                { en: 'Find My Business →', es: 'Buscar mi negocio →' },
  not_listed:              { en: 'Not listed?', es: '¿No apareces?' },
  contact_us:              { en: 'Contact us →', es: 'Contáctanos →' },
  confirm_btn:             { en: 'This is my business →', es: 'Este es mi negocio →' },
  not_my_biz:              { en: 'Not my business — search again', es: 'No es mi negocio — buscar de nuevo' },

  // Step 2 — Verify ownership
  step2_progress:          { en: 'Step 2 of 5', es: 'Paso 2 de 5' },
  step2_heading:           { en: 'Confirm you own this business', es: 'Confirma que eres el dueño' },
  step2_sub:               { en: 'Enter your Florida Sunbiz document number to verify ownership. This is the unique number on your state registration.', es: 'Ingresa tu número de documento Sunbiz de Florida para verificar la propiedad. Es el número único en tu registro estatal.' },
  sunbiz_helper:           { en: 'Find your number at search.sunbiz.org under your business registration — it starts with a letter followed by numbers (e.g. L21000012345).', es: 'Encuentra tu número en search.sunbiz.org bajo tu registro — comienza con una letra seguida de números (ej. L21000012345).' },
  sunbiz_lookup_link:      { en: 'Look up my Sunbiz number →', es: 'Buscar mi número Sunbiz →' },
  sunbiz_format_hint:      { en: 'Format: one letter + 11 digits (e.g. L21000012345)', es: 'Formato: una letra + 11 dígitos (ej. L21000012345)' },
  sunbiz_error:            { en: 'Enter a valid Sunbiz number (e.g. L21000012345)', es: 'Ingresa un número Sunbiz válido (ej. L21000012345)' },
  privacy_sunbiz:          { en: "We only use this to confirm you're the registered agent or owner. We never share it.", es: 'Solo usamos esto para confirmar que eres el agente registrado o dueño. Nunca lo compartimos.' },
  verify_btn:              { en: 'Verify Ownership →', es: 'Verificar propiedad →' },

  // Step 3 — Payment
  step3_progress:          { en: 'Step 3 of 5', es: 'Paso 3 de 5' },
  step3_heading:           { en: 'How do you want to get paid?', es: '¿Cómo quieres recibir pagos?' },
  step3_sub:               { en: 'Choose one or more. You can add others later from your account settings.', es: 'Elige uno o más. Puedes agregar otros después en la configuración.' },
  surge_title:             { en: 'Surge Wallet', es: 'Billetera Surge' },
  surge_rec:               { en: 'RECOMMENDED', es: 'RECOMENDADO' },
  surge_desc:              { en: 'Receive agent payments in USDC on Base — instantly, on-chain.', es: 'Recibe pagos de agentes en USDC en Base — al instante, en cadena.' },
  surge_sub:               { en: 'Create your free Surge merchant account, then paste your wallet address below.', es: 'Crea tu cuenta gratuita de comerciante en Surge, luego pega tu dirección de billetera abajo.' },
  surge_create_btn:        { en: 'Create Surge Account →', es: 'Crear cuenta Surge →' },
  surge_wallet_label:      { en: 'Your Surge wallet address', es: 'Tu dirección de billetera Surge' },
  surge_wallet_hint:       { en: 'Already have an EVM wallet? Paste any 0x address — MetaMask, Coinbase, or other.', es: '¿Ya tienes una billetera EVM? Pega cualquier dirección 0x — MetaMask, Coinbase u otra.' },
  bank_title:              { en: 'Bank Account (ACH)', es: 'Cuenta bancaria (ACH)' },
  bank_desc:               { en: 'Direct deposit to your checking account. 1–2 business days.', es: 'Depósito directo a tu cuenta de cheques. 1–2 días hábiles.' },
  routing_label:           { en: 'Routing number', es: 'Número de ruta' },
  routing_ph:              { en: '9 digits', es: '9 dígitos' },
  account_label:           { en: 'Account number', es: 'Número de cuenta' },
  account_ph:              { en: 'Account #', es: 'N.º de cuenta' },
  account_type_label:      { en: 'Account type', es: 'Tipo de cuenta' },
  account_type_default:    { en: 'Select type', es: 'Seleccionar tipo' },
  account_checking:        { en: 'Checking', es: 'Cheques' },
  account_savings:         { en: 'Savings', es: 'Ahorros' },
  bank_privacy:            { en: 'Powered by secure ACH transfer. Bank details encrypted and never stored in plain text.', es: 'Transferencia ACH segura. Los datos bancarios están cifrados y nunca se almacenan en texto plano.' },
  both_title:              { en: 'Use Both', es: 'Usar ambos' },
  both_desc:               { en: 'Crypto for instant payouts, bank for amounts over $100. Best of both.', es: 'Cripto para pagos instantáneos, banco para montos mayores a $100. Lo mejor de ambos.' },
  more_options_label:      { en: 'More options coming', es: 'Más opciones próximamente' },
  more_options_sub:        { en: 'Stripe, Toast, Square, and other POS integrations. Connect any payment method you already use.', es: 'Stripe, Toast, Square y otras integraciones POS. Conecta cualquier método de pago que ya uses.' },
  continue_btn:            { en: 'Continue →', es: 'Continuar →' },

  // Step 4 — Notifications
  step4_progress:          { en: 'Step 4 of 5', es: 'Paso 4 de 5' },
  step4_heading:           { en: 'How should we reach you when a job comes in?', es: '¿Cómo te avisamos cuando llegue un trabajo?' },
  step4_sub:               { en: 'Jobs post fast. The faster we reach you, the better your chances of claiming it.', es: 'Los trabajos se publican rápido. Cuanto antes te avisemos, mejor tus posibilidades.' },
  sms_title:               { en: 'SMS', es: 'SMS' },
  sms_aria:                { en: 'Enable SMS notifications', es: 'Activar notificaciones SMS' },
  sms_phone_label:         { en: 'Phone number', es: 'Número de teléfono' },
  sms_phone_ph:            { en: '+1 (904) 555-0100', es: '+1 (904) 555-0100' },
  sms_hint:                { en: 'Fastest. We text you when a matching job posts.', es: 'Más rápido. Te enviamos un SMS cuando se publica un trabajo.' },
  email_title:             { en: 'Email', es: 'Correo electrónico' },
  email_aria:              { en: 'Enable email notifications', es: 'Activar notificaciones por correo' },
  email_addr_label:        { en: 'Email address', es: 'Dirección de correo' },
  email_addr_ph:           { en: 'you@example.com', es: 'tu@correo.com' },
  email_hint:              { en: 'Good for daily job digests and weekly summaries.', es: 'Ideal para resúmenes diarios y semanales de trabajos.' },
  push_title:              { en: 'Push Notifications', es: 'Notificaciones push' },
  push_aria:               { en: 'Enable push notifications', es: 'Activar notificaciones push' },
  push_sub:                { en: "Browser and app notifications when you're online. Instant, no number needed.", es: 'Notificaciones del navegador cuando estés en línea. Instantáneo, sin número de teléfono.' },
  almost_done_btn:         { en: 'Almost done →', es: 'Casi listo →' },

  // Step 5 — Verify code
  step5_heading:           { en: 'Enter your verification code', es: 'Ingresa tu código de verificación' },
  step5_sub:               { en: 'We sent a 6-digit code to your contact. Enter it below.', es: 'Enviamos un código de 6 dígitos a tu contacto. Ingrésalo abajo.' },
  code_label:              { en: '6-digit code', es: 'Código de 6 dígitos' },
  verify_claim_btn:        { en: 'Verify & Claim →', es: 'Verificar y reclamar →' },
  didnt_get_it:            { en: "Didn't get it?", es: '¿No lo recibiste?' },
  resend_code:             { en: 'Resend code', es: 'Reenviar código' },

  // Step wallet — fund wallet
  wallet_progress:         { en: 'Almost there', es: 'Casi listo' },
  wallet_heading:          { en: 'Add job credits', es: 'Agregar créditos de trabajo' },
  wallet_sub:              { en: 'LocalIntel uses a small digital balance to route jobs to your business — like a prepaid account. $50 covers hundreds of job requests.', es: 'LocalIntel usa un pequeño saldo digital para enrutar trabajos a tu negocio — como una cuenta prepagada. $50 cubre cientos de solicitudes de trabajo.' },
  wallet_why_label:        { en: 'Why is this needed?', es: '¿Por qué es necesario?' },
  wallet_why_body:         { en: 'When a homeowner or agent sends a job request, LocalIntel charges a small fee ($0.01–$0.05) to route it to you. Your balance covers that fee. You only pay when you get leads.', es: 'Cuando un propietario o agente envía una solicitud de trabajo, LocalIntel cobra una pequeña tarifa ($0.01–$0.05) para enrutarla a ti. Tu saldo cubre esa tarifa. Solo pagas cuando recibes clientes potenciales.' },
  wallet_addr_label:       { en: 'Your deposit address', es: 'Tu dirección de depósito' },
  wallet_addr_sub:         { en: '(send USDC or pathUSD here)', es: '(envía USDC o pathUSD aquí)' },
  wallet_copy_btn:         { en: 'Copy', es: 'Copiar' },
  wallet_copied:           { en: 'Copied!', es: '¡Copiado!' },
  wallet_min:              { en: 'Minimum:', es: 'Mínimo:' },
  wallet_min_amount:       { en: '$50 to activate', es: '$50 para activar' },
  wallet_checking:         { en: 'Checking for deposit…', es: 'Verificando depósito…' },
  wallet_skip:             { en: 'Skip for now →', es: 'Omitir por ahora →' },
  wallet_qr_label:         { en: 'QR code', es: 'Código QR' },

  // Step 6 — Success
  success_title:           { en: "You're in the network.", es: 'Estás en la red.' },
  success_sub:             { en: 'Your listing is claimed and live in LocalIntel. Here\'s what happens next:', es: 'Tu perfil está reclamado y activo en LocalIntel. Esto es lo que sigue:' },
  success_item1:           { en: "When an agent queries your ZIP and category, you'll get notified — via whatever channels you selected.", es: 'Cuando un agente consulte tu código postal y categoría, recibirás una notificación — por los canales que elegiste.' },
  success_item2:           { en: 'Market intelligence lands in your inbox automatically. No dashboard to check. It comes to you.', es: 'La inteligencia de mercado llega a tu bandeja automáticamente. Sin necesidad de revisar un panel. Llega a ti.' },
  success_item3:           { en: 'Your business is now a verified node in the LocalIntel network. Confidence badge applied to every record tied to your Sunbiz ID.', es: 'Tu negocio es ahora un nodo verificado en la red de LocalIntel. Se aplica una insignia de confianza a cada registro vinculado a tu ID de Sunbiz.' },
  back_to_home_btn:        { en: 'Back to home', es: 'Volver al inicio' },
  open_inbox_btn:          { en: 'Open your job inbox →', es: 'Abrir tu bandeja de trabajos →' },

  // ── INBOX (BUSINESS DASHBOARD) ────────────────────────────────────────────

  inbox_title:             { en: 'Business Dashboard', es: 'Panel de negocio' },
  inbox_nav_requests:      { en: 'Requests', es: 'Solicitudes' },
  inbox_nav_intel:         { en: 'Intel', es: 'Inteligencia' },
  inbox_nav_profile:       { en: 'Profile', es: 'Perfil' },
  inbox_nav_settings:      { en: 'Settings', es: 'Configuración' },
  inbox_sign_out:          { en: 'Sign out', es: 'Cerrar sesión' },

  inbox_req_heading:       { en: 'Job Requests', es: 'Solicitudes de trabajo' },
  inbox_req_empty:         { en: 'No requests yet. When agents query your area, they\'ll appear here.', es: 'Aún no hay solicitudes. Cuando los agentes consulten tu área, aparecerán aquí.' },
  inbox_req_accept:        { en: 'Accept', es: 'Aceptar' },
  inbox_req_decline:       { en: 'Decline', es: 'Rechazar' },
  inbox_req_quote:         { en: 'Send Quote', es: 'Enviar cotización' },
  inbox_req_new:           { en: 'New', es: 'Nuevo' },
  inbox_req_pending:       { en: 'Pending', es: 'Pendiente' },
  inbox_req_accepted:      { en: 'Accepted', es: 'Aceptado' },
  inbox_req_declined:      { en: 'Declined', es: 'Rechazado' },
  inbox_req_completed:     { en: 'Completed', es: 'Completado' },

  inbox_intel_heading:     { en: 'Market Intelligence', es: 'Inteligencia de mercado' },
  inbox_intel_empty:       { en: 'Intelligence reports will appear here as agents query your market.', es: 'Los informes de inteligencia aparecerán aquí cuando los agentes consulten tu mercado.' },

  inbox_profile_heading:   { en: 'Your Profile', es: 'Tu perfil' },
  profile_name_label:      { en: 'Business name', es: 'Nombre del negocio' },
  profile_phone_label:     { en: 'Phone', es: 'Teléfono' },
  profile_address_label:   { en: 'Address', es: 'Dirección' },
  profile_website_label:   { en: 'Website', es: 'Sitio web' },
  profile_hours_label:     { en: 'Hours', es: 'Horario' },
  profile_category_label:  { en: 'Category', es: 'Categoría' },
  profile_save_btn:        { en: 'Save changes', es: 'Guardar cambios' },
  profile_saving_btn:      { en: 'Saving…', es: 'Guardando…' },
  profile_saved_ok:        { en: 'Saved.', es: 'Guardado.' },

  inbox_settings_heading:  { en: 'Settings', es: 'Configuración' },
  settings_lang_label:     { en: 'Language', es: 'Idioma' },
  settings_notif_label:    { en: 'Notifications', es: 'Notificaciones' },
  settings_sms_label:      { en: 'SMS alerts', es: 'Alertas SMS' },
  settings_email_label:    { en: 'Email alerts', es: 'Alertas por correo' },
  settings_push_label:     { en: 'Push alerts', es: 'Alertas push' },
  settings_save_btn:       { en: 'Save settings', es: 'Guardar configuración' },

  // Notifications (SMS / Email body strings — server-side mirror in notificationQueue.js)
  notif_verify_subject:    { en: 'Your LocalIntel verification code', es: 'Tu código de verificación de LocalIntel' },
  notif_verify_body:       { en: 'Your LocalIntel code: {code}. Expires in 30 minutes.', es: 'Tu código de LocalIntel: {code}. Expira en 30 minutos.' },
  notif_welcome_subject:   { en: 'Welcome to LocalIntel — {name}', es: 'Bienvenido a LocalIntel — {name}' },
  notif_welcome_body:      { en: "Your listing is claimed. You'll receive market intelligence when agents query your area.", es: 'Tu perfil está reclamado. Recibirás inteligencia de mercado cuando los agentes consulten tu área.' },
  notif_job_subject:       { en: 'New job request — {category} in {zip}', es: 'Nueva solicitud de trabajo — {category} en {zip}' },
  notif_job_body:          { en: 'A new job request has been posted in your area. Open your inbox to respond.', es: 'Se publicó una nueva solicitud de trabajo en tu área. Abre tu bandeja para responder.' },
  notif_job_cta:           { en: 'View Request →', es: 'Ver solicitud →' },
  notif_intel_subject:     { en: 'Market update for {zip}', es: 'Actualización de mercado para {zip}' },
  notif_intel_body:        { en: 'New market intelligence is available for your area. Log in to view.', es: 'Nueva inteligencia de mercado disponible para tu área. Ingresa para ver.' },
  notif_unsubscribe:       { en: 'unsubscribe', es: 'cancelar suscripción' },

  // ── GENERIC ──────────────────────────────────────────────────────────────
  loading:                 { en: 'Loading…', es: 'Cargando…' },
  error_generic:           { en: 'Something went wrong. Please try again.', es: 'Algo salió mal. Por favor intenta de nuevo.' },
  copied:                  { en: 'Copied!', es: '¡Copiado!' },
  view_on_map:             { en: '📍 Verify pin on OpenStreetMap →', es: '📍 Verificar pin en OpenStreetMap →' },
  view_on_sunbiz:          { en: '🏛️ View on Sunbiz →', es: '🏛️ Ver en Sunbiz →' },
};

// ─── CORE ─────────────────────────────────────────────────────────────────────

function getLang() {
  return localStorage.getItem('owner_language') || 'en';
}

function t(key, vars = {}) {
  const lang = getLang();
  const entry = STRINGS[key];
  if (!entry) {
    console.warn('[i18n] missing key:', key);
    return key;
  }
  let str = entry[lang] ?? entry['en'] ?? key;
  // Variable interpolation: {name}, {code}, {zip}, {category}
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return str;
}

function setLang(lang) {
  if (lang !== 'en' && lang !== 'es') return;
  localStorage.setItem('owner_language', lang);
  applyAll();
  persistLangToServer(lang);
}

// Swap all [data-i18n] elements to the current language
function applyAll() {
  const lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const attr = el.getAttribute('data-i18n-attr'); // e.g. "placeholder", "aria-label"
    const vars = {};
    // Read data-i18n-var-* attributes for interpolation
    for (const a of el.attributes) {
      if (a.name.startsWith('data-i18n-var-')) {
        vars[a.name.replace('data-i18n-var-', '')] = a.value;
      }
    }
    const val = t(key, vars);
    if (attr) {
      el.setAttribute(attr, val);
    } else {
      el.textContent = val;
    }
  });
  // Update lang toggle button labels
  const btnEn = document.getElementById('lang-btn-en');
  const btnEs = document.getElementById('lang-btn-es');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  if (btnEs) btnEs.classList.toggle('active', lang === 'es');
  // Update <html lang>
  document.documentElement.lang = lang;
}

// Persist language preference to business record (fire-and-forget)
function persistLangToServer(lang) {
  const token = localStorage.getItem('li_dispatch_token')
    || sessionStorage.getItem('li_dispatch_token');
  if (!token) return;
  const API = window.LI_API || 'https://gsb-swarm-production.up.railway.app/api/local-intel';
  fetch(`${API}/inbox/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, owner_language: lang }),
  }).catch(() => {}); // fire-and-forget
}

// Lang toggle widget HTML — inject into nav
function renderLangToggle() {
  const lang = getLang();
  return `<div class="lang-toggle" role="group" aria-label="Language / Idioma">
    <button id="lang-btn-en" class="lang-btn${lang === 'en' ? ' active' : ''}" onclick="setLang('en')" aria-pressed="${lang === 'en'}">🇺🇸 EN</button>
    <button id="lang-btn-es" class="lang-btn${lang === 'es' ? ' active' : ''}" onclick="setLang('es')" aria-pressed="${lang === 'es'}">🇲🇽 ES</button>
  </div>`;
}

// CSS for the toggle widget (injected once)
function injectLangStyles() {
  if (document.getElementById('i18n-styles')) return;
  const style = document.createElement('style');
  style.id = 'i18n-styles';
  style.textContent = `
    .lang-toggle {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .lang-btn {
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-2, #6B7280);
      background: transparent;
      border: 1px solid var(--border, #E5E7EB);
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      line-height: 1.4;
    }
    .lang-btn.active {
      background: var(--accent, #16A34A);
      color: #fff;
      border-color: var(--accent, #16A34A);
    }
    .lang-btn:hover:not(.active) {
      background: var(--bg-card, #F9FAFB);
      border-color: var(--accent, #16A34A);
      color: var(--accent, #16A34A);
    }
    /* Language selector step (step 0) */
    .lang-select-step {
      text-align: center;
      padding: 48px 24px 36px;
    }
    .lang-select-step h2 {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    .lang-select-step p {
      font-size: 14px;
      color: var(--text-2, #6B7280);
      margin-bottom: 28px;
    }
    .lang-choice-btns {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 280px;
      margin: 0 auto;
    }
    .lang-choice-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      border: 2px solid transparent;
    }
    .lang-choice-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .lang-choice-btn.en {
      background: var(--accent, #16A34A);
      color: #fff;
    }
    .lang-choice-btn.es {
      background: var(--bg-card, #F9FAFB);
      color: var(--text, #111827);
      border-color: var(--border, #E5E7EB);
    }
  `;
  document.head.appendChild(style);
}

// Auto-apply on DOM ready
if (typeof document !== 'undefined') {
  injectLangStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }
}

// Export for both browser globals and potential module use
if (typeof window !== 'undefined') {
  window.i18n = { t, setLang, getLang, applyAll, renderLangToggle };
  window.t = t;
  window.setLang = setLang;
  window.getLang = getLang;
}
