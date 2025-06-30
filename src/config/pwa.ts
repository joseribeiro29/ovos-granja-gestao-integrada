
export const PWA_CONFIG = {
  name: 'Sistema de Gestão Avícola',
  shortName: 'Gestão Avícola',
  description: 'Sistema completo de gestão para granjas de ovos',
  themeColor: '#3b82f6',
  backgroundColor: '#ffffff',
  display: 'standalone',
  startUrl: '/',
  scope: '/',
  orientation: 'portrait-primary',
  categories: ['business', 'productivity'],
  lang: 'pt-BR',
  dir: 'ltr'
} as const;

export const ICON_SIZES = [
  72, 96, 128, 144, 152, 192, 384, 512
] as const;

export const CACHE_NAMES = {
  static: 'avicola-static-v1.0.0',
  dynamic: 'avicola-dynamic-v1.0.0',
  runtime: 'avicola-runtime-v1.0.0'
} as const;

export const OFFLINE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json'
] as const;
