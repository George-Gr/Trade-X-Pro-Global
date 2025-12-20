import React, { useEffect, useRef, useState } from 'react';

/**
 * Image Optimization Utilities
 *
 * Provides WebP conversion, lazy loading, responsive images,
 * and SVG optimization for TradeX Pro.
 */

/**
 * Responsive Image Component with WebP Support
 */
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function ResponsiveImage({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  sizes = '100vw',
  loading = 'lazy',
  priority = false,
  quality = 80,
  onLoad,
  onError,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate WebP and AVIF sources
  const sources = generateImageSources(src, quality);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <picture className={className}>
      {/* AVIF - Best compression */}
      {sources.avif && (
        <source srcSet={sources.avif} type="image/avif" sizes={sizes} />
      )}

      {/* WebP - Good compression, wide support */}
      {sources.webp && (
        <source srcSet={sources.webp} type="image/webp" sizes={sizes} />
      )}

      {/* Fallback to original format */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : loading}
        decoding="async"
        className={`
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${hasError ? 'hidden' : ''}
          transition-opacity duration-300
          ${className || ''}
        `}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          transition: 'opacity 300ms ease-in-out',
        }}
      />

      {/* Placeholder while loading */}
      {!isLoaded && placeholder && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'blur(2px)' }}
        />
      )}

      {/* Fallback text if image fails */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          Failed to load image
        </div>
      )}
    </picture>
  );
}

/**
 * Generate optimized image sources
 */
function generateImageSources(src: string, quality: number) {
  const sources: { webp?: string; avif?: string } = {};

  try {
    // Check if we're using a CDN that supports image optimization
    const isCDN =
      src.includes('cdn') ||
      src.includes('cloudfront') ||
      src.includes('vercel');

    if (isCDN) {
      // CDN optimization parameters
      const params = `?q=${quality}&fm=webp`;
      sources.webp = src + params;
      sources.avif = src + '?q=' + quality + '&fm=avif';
    } else {
      // For local images, try to find optimized versions
      const baseName = src.replace(/\.[^/.]+$/, '');

      sources.webp = `${baseName}.webp`;
      sources.avif = `${baseName}.avif`;
    }
  } catch (error) {
    // Silently handle - fallback to original src if source generation fails
  }
  return sources;
}

/**
 * Lazy Loading Hook for Images
 */
export function useImageLazyLoading() {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, shouldLoad: isInView };
}

/**
 * SVG Optimizer Component
 */
export interface SvgOptimizerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  preserveAspectRatio?: string;
}

export function SvgOptimizer({
  children,
  className,
  title,
  preserveAspectRatio = 'xMidYMid meet',
}: SvgOptimizerProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      preserveAspectRatio={preserveAspectRatio}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

/**
 * Image Preloader
 */
export class ImagePreloader {
  private cache = new Map<string, HTMLImageElement>();
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>();

  preload(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!);
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.decoding = 'async';
      img.src = src;
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  preloadMultiple(srcs: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(srcs.map((src) => this.preload(src)));
  }

  isCached(src: string): boolean {
    return this.cache.has(src);
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

/**
 * Image Quality Optimizer
 */
export const ImageOptimizer = {
  // Optimize image for different screen densities
  getOptimizedSrc: (
    src: string,
    density: number = window.devicePixelRatio || 1
  ) => {
    const baseName = src.replace(/\.[^/.]+$/, '');
    const extension = src.split('.').pop();

    // For high DPI screens, try to get higher resolution images
    if (density >= 3) {
      return `${baseName}@3x.${extension}`;
    } else if (density >= 2) {
      return `${baseName}@2x.${extension}`;
    }

    return src;
  },
  // Generate responsive image srcSet
  generateSrcSet: (src: string, sizes: number[]) => {
    return sizes.map((size) => `${src} ${size}w`).join(', ');
  },

  // Check if WebP is supported
  supportsWebP: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  // Check if AVIF is supported
  supportsAVIF: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src =
        'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    });
  },
};

/**
 * BlurHash Placeholder Component
 */
export interface BlurHashProps {
  hash: string;
  width: number;
  height: number;
  className?: string;
  punch?: number;
}

export function BlurHashPlaceholder({
  hash,
  width,
  height,
  className,
  punch = 1,
}: BlurHashProps) {
  // This would integrate with a BlurHash library
  // For now, provide a simple fallback
  return (
    <div
      className={`bg-linear-to-br from-primary/20 to-secondary/20 ${className}`}
      style={{
        width,
        height,
        backgroundSize: 'cover',
        filter: 'blur(1px)',
        transform: 'scale(1.05)',
      }}
    />
  );
}

/**
 * Progressive Image Loading Component
 */
export interface ProgressiveImageProps {
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  className,
  width,
  height,
}: ProgressiveImageProps) {
  const [isHQLoaded, setIsHQLoaded] = useState(false);
  const [isLQLoaded, setIsLQLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Low quality placeholder */}
      {!isLQLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      <img
        src={lowQualitySrc}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isLQLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLQLoaded(true)}
      />

      {/* High quality image */}
      <img
        src={highQualitySrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isHQLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsHQLoaded(true)}
      />
    </div>
  );
}

export default {
  ResponsiveImage,
  SvgOptimizer,
  ImagePreloader,
  ImageOptimizer,
  BlurHashPlaceholder,
  ProgressiveImage,
  useImageLazyLoading,
};
