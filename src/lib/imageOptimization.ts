// Image optimization utilities for responsive images
export interface ImageVariant {
  src: string;
  webpSrc?: string;
  width: number;
  height: number;
  quality?: number;
}

export interface HeroImageConfig {
  baseName: string;
  variants: ImageVariant[];
}

// Configuration for hero images with optimized variants
export const HERO_IMAGES: Record<string, HeroImageConfig> = {
  heroTrading: {
    baseName: 'hero-trading',
    variants: [
      {
        src: '/assets/hero-trading-mobile.jpg',
        webpSrc: '/assets/hero-trading-mobile.webp',
        width: 768,
        height: 800,
        quality: 80,
      },
      {
        src: '/assets/hero-trading-tablet.jpg',
        webpSrc: '/assets/hero-trading-tablet.webp',
        width: 1200,
        height: 900,
        quality: 85,
      },
      {
        src: '/assets/hero-trading-desktop.jpg',
        webpSrc: '/assets/hero-trading-desktop.webp',
        width: 1920,
        height: 1080,
        quality: 90,
      },
      {
        src: '/assets/hero-trading-ultra.jpg',
        webpSrc: '/assets/hero-trading-ultra.webp',
        width: 2560,
        height: 1440,
        quality: 95,
      },
    ],
  },
  globalMarketsMap: {
    baseName: 'global-markets-map',
    variants: [
      {
        src: '/assets/global-markets-map-mobile.jpg',
        webpSrc: '/assets/global-markets-map-mobile.webp',
        width: 768,
        height: 600,
        quality: 80,
      },
      {
        src: '/assets/global-markets-map-tablet.jpg',
        webpSrc: '/assets/global-markets-map-tablet.webp',
        width: 1200,
        height: 800,
        quality: 85,
      },
      {
        src: '/assets/global-markets-map-desktop.jpg',
        webpSrc: '/assets/global-markets-map-desktop.webp',
        width: 1920,
        height: 1080,
        quality: 90,
      },
      {
        src: '/assets/global-markets-map-ultra.jpg',
        webpSrc: '/assets/global-markets-map-ultra.webp',
        width: 2560,
        height: 1440,
        quality: 95,
      },
    ],
  },
  securityBg: {
    baseName: 'security-bg',
    variants: [
      {
        src: '/assets/security-bg-mobile.jpg',
        webpSrc: '/assets/security-bg-mobile.webp',
        width: 768,
        height: 600,
        quality: 80,
      },
      {
        src: '/assets/security-bg-tablet.jpg',
        webpSrc: '/assets/security-bg-tablet.webp',
        width: 1200,
        height: 800,
        quality: 85,
      },
      {
        src: '/assets/security-bg-desktop.jpg',
        webpSrc: '/assets/security-bg-desktop.webp',
        width: 1920,
        height: 1080,
        quality: 90,
      },
      {
        src: '/assets/security-bg-ultra.jpg',
        webpSrc: '/assets/security-bg-ultra.webp',
        width: 2560,
        height: 1440,
        quality: 95,
      },
    ],
  },
};

// Get the best image variant based on viewport width
export const getBestImageVariant = (
  variants: ImageVariant[],
  viewportWidth: number = window.innerWidth
): ImageVariant => {
  // Sort variants by width (smallest first)
  const sortedVariants = [...variants].sort((a, b) => a.width - b.width);

  // Find the first variant that is >= viewport width
  const suitableVariant = sortedVariants.find(
    (variant) => variant.width >= viewportWidth
  );

  // If no suitable variant found, use the largest one
  return suitableVariant || sortedVariants[sortedVariants.length - 1];
};

// Generate srcSet string for responsive images
export const generateSrcSet = (variants: ImageVariant[]): string => {
  return variants
    .map((variant) => `${variant.src} ${variant.width}w`)
    .join(', ');
};

// Generate WebP srcSet string for responsive images
export const generateWebPSrcSet = (variants: ImageVariant[]): string => {
  const webpVariants = variants.filter((variant) => variant.webpSrc);
  return webpVariants
    .map((variant) => `${variant.webpSrc} ${variant.width}w`)
    .join(', ');
};

// Get image sizes attribute for responsive images
export const getImageSizes = (): string => {
  return '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, (max-width: 1920px) 100vw, 1920px';
};

// Check if WebP format is supported
export const checkWebPSupport = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Get optimized image source based on WebP support
export const getOptimizedImageSrc = async (
  fallbackSrc: string,
  webpSrc?: string
): Promise<string> => {
  const supportsWebP = await checkWebPSupport();
  return supportsWebP && webpSrc ? webpSrc : fallbackSrc;
};
