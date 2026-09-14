import { Platform } from 'react-native';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';

/**
 * RevenueCat is optional at boot, same pattern as Supabase: without an API
 * key the app runs fully (all core learning features are free — only
 * Finzy Pro quality-of-life perks are gated), it just can't sell Pro.
 *
 * Get keys from the RevenueCat dashboard after creating the project and
 * wiring an App Store Connect subscription group. iOS key goes in
 * EXPO_PUBLIC_REVENUECAT_API_KEY_IOS.
 */
const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '';

export const isPurchasesConfigured = Platform.OS === 'ios' && IOS_API_KEY.length > 0;

export const PRO_ENTITLEMENT_ID = 'pro';

let configured = false;

export async function initPurchases(appUserId?: string) {
  if (!isPurchasesConfigured || configured) return;
  Purchases.configure({ apiKey: IOS_API_KEY, appUserID: appUserId });
  configured = true;
}

export async function getProOfferings() {
  if (!isPurchasesConfigured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchaseProPackage(pkg: PurchasesPackage): Promise<boolean> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
}

export async function restorePurchases(): Promise<boolean> {
  if (!isPurchasesConfigured) return false;
  const customerInfo = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
}

export async function getIsProFromEntitlements(): Promise<boolean> {
  if (!isPurchasesConfigured) return false;
  const customerInfo = await Purchases.getCustomerInfo();
  return Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT_ID]);
}

/**
 * Consumable "Rip It" pack bundles. These are one-time (non-subscription)
 * StoreKit products, created in App Store Connect once a Developer account
 * exists. Granting the packs happens server-side via the RevenueCat
 * webhook (see supabase/functions/revenuecat-webhook) — this call only
 * starts the purchase; it does not itself increment any balance.
 */
export const PACK_BUNDLE_PRODUCT_IDS = {
  packs_1: 'com.finzy.app.packs.1',
  packs_5: 'com.finzy.app.packs.5',
  packs_15: 'com.finzy.app.packs.15',
} as const;

export async function getPackBundleProducts() {
  if (!isPurchasesConfigured) return [];
  return Purchases.getProducts(Object.values(PACK_BUNDLE_PRODUCT_IDS));
}

export async function purchasePackBundle(productId: string): Promise<void> {
  const [product] = await Purchases.getProducts([productId]);
  if (!product) throw new Error(`Pack product ${productId} not found in the current offering`);
  await Purchases.purchaseStoreProduct(product);
}
