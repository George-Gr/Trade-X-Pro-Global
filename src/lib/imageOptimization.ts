/**
 * Image Optimization Utilities
 * Provides lazy loading, responsive images, and optimization helpers
 */

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface HeroImageConfig {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const HERO_IMAGES: Record<string, HeroImageConfig> = {
  trading: {
    key: 'trading',
    src: '/images/hero-trading.jpg',
    alt: 'Trading Platform',
    width: 1920,
    height: 1080,
  },
  dashboard: {
    key: 'dashboard',
    src: '/images/hero-dashboard.jpg',
    alt: 'Trading Dashboard',
    width: 1920,
    height: 1080,
  },
  markets: {
    key: 'markets',
    src: '/images/hero-markets.jpg',
    alt: 'Financial Markets',
    width: 1920,
    height: 1080,
  },
};

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string {
  return widths.map(w => `${src} ${w}w`).join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints: Record<string, string> = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
  }
): string {
  const sizeValues = Object.entries(breakpoints).map(([_, size]) => size);
  return sizeValues.join(', ') || '100vw';
}

/**
 * Get optimized image URL (placeholder for CDN integration)
 */
export function getOptimizedImageUrl(
  src: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  const params = new URLSearchParams();
  if (options?.width) params.set('w', String(options.width));
  if (options?.height) params.set('h', String(options.height));
  if (options?.quality) params.set('q', String(options.quality));
  
  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
}

/**
 * Alias for getOptimizedImageUrl for backward compatibility
 */
export function getOptimizedImageSrc(
  src: string,
  options?: { width?: number; height?: number; quality?: number }
): string {
  return getOptimizedImageUrl(src, options);
}

/**
 * Calculate image dimensions maintaining aspect ratio
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number
): ImageDimensions {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  if (maxWidth && width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  return {
    width: Math.round(width),
    height: Math.round(height),
    aspectRatio,
  };
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(_src: string): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';
}

export default {
  HERO_IMAGES,
  generateSrcSet,
  generateSizes,
  getOptimizedImageUrl,
  getOptimizedImageSrc,
  calculateDimensions,
  generateBlurPlaceholder,
};
