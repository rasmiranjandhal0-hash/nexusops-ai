// Customer & Authentication Manager for PRIVACYGUARD AI

const CUSTOMER_STORAGE_KEY = 'privacyguard_customer';
const TOKEN_STORAGE_KEY = 'privacyguard_token';

export const DEFAULT_CUSTOMER = {
  id: 'demo@privacyguard.ai',
  email: 'demo@privacyguard.ai',
  name: 'Security Officer (Demo)',
};

/**
 * Returns the currently active customer profile
 */
export function getCurrentCustomer() {
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return {
          ...parsed,
          id: (parsed.id || parsed.email).trim().toLowerCase(),
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored customer:', e);
  }
  return DEFAULT_CUSTOMER;
}

/**
 * Sets the active customer and dispatches an event for reactive UI updates
 */
export function setCurrentCustomer(customer, token) {
  try {
    const normalized = {
      ...customer,
      id: (customer.id || customer.email).trim().toLowerCase(),
      email: (customer.email || '').trim().toLowerCase(),
    };
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(normalized));
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
    // Dispatch event for reactive cross-component state synchronization
    window.dispatchEvent(new CustomEvent('privacyguard_auth_change', { detail: normalized }));
    return normalized;
  } catch (e) {
    console.error('Failed to set current customer:', e);
    return DEFAULT_CUSTOMER;
  }
}

/**
 * Signs out the current customer and resets to demo profile
 */
export function logoutCustomer() {
  localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('privacyguard_auth_change', { detail: DEFAULT_CUSTOMER }));
}

/**
 * Hook or helper to subscribe to customer changes
 */
export function subscribeToAuth(callback) {
  const handler = (e) => {
    callback(e.detail || getCurrentCustomer());
  };
  window.addEventListener('privacyguard_auth_change', handler);
  return () => window.removeEventListener('privacyguard_auth_change', handler);
}

