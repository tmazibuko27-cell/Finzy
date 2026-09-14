// Supabase Edge Function: revenuecat-webhook
// Receives RevenueCat webhook events and syncs Finzy Pro entitlement status
// onto profiles.is_pro / pro_active_until. This is what makes Pro status
// server-authoritative instead of trusting the client's local entitlement
// check (which is only used for optimistic UI).
//
// Setup:
//  1. supabase functions deploy revenuecat-webhook
//  2. supabase secrets set REVENUECAT_WEBHOOK_SECRET=<value>
//  3. In the RevenueCat dashboard, add a webhook pointing at this function's
//     URL with an Authorization header "Bearer <REVENUECAT_WEBHOOK_SECRET>".
//  4. Set each Purchases.configure(appUserID: ...) call client-side to the
//     Supabase auth user id, so `app_user_id` here matches `profiles.id`.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;

const ACTIVE_EVENTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE']);
const INACTIVE_EVENTS = new Set(['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE']);

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${WEBHOOK_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await req.json();
  const event = payload?.event;
  const appUserId = event?.app_user_id;
  const eventType = event?.type;
  const expirationMs = event?.expiration_at_ms;

  if (!appUserId || !eventType) {
    return new Response(JSON.stringify({ error: 'Malformed payload' }), { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  if (ACTIVE_EVENTS.has(eventType)) {
    await admin
      .from('profiles')
      .update({
        is_pro: true,
        pro_active_until: expirationMs ? new Date(expirationMs).toISOString() : null,
      })
      .eq('id', appUserId);
  } else if (INACTIVE_EVENTS.has(eventType)) {
    await admin.from('profiles').update({ is_pro: false }).eq('id', appUserId);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
