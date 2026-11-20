export const APP_CONSTANTS = {
  BRAND_NAME: 'Café de Barrio',
  CURRENCY_SYMBOL: 'S/',
  CART_STORAGE_KEY: 'cafe_barrio_cart_v1',
  AUTH_ACCESS_KEY: 'cafe_barrio_access_token',
  AUTH_REFRESH_KEY: 'cafe_barrio_refresh_token',
  AUTH_USER_KEY: 'cafe_barrio_admin_user',
  FALLBACK_IMAGE: '/assets/fallback-coffee.svg',
  HTTP_TIMEOUT_MS: 15000,
  LOW_STOCK_THRESHOLD: 10
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado'
};

export const ORDER_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: []
};
