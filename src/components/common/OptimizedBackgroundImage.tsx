import { useEffect, useState } from 'react';

interface OptimizedBackgroundImageProps {
  src: string;
  webpSrc?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedBackgroundImage = ({
  src,
  webpSrc,
  alt,
  className,
  style = {},
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
}: OptimizedBackgroundImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Check if WebP is supported
        const supportsWebP = await checkWebPSupport();

        // Use WebP if supported and available, otherwise fallback to original
        const finalSrc = supportsWebP && webpSrc ? webpSrc : src;

        // Preload the image to ensure it's loaded before setting
        const img = new Image();
        img.onload = () => {
          setImageSrc(finalSrc);
          setIsLoading(false);
          onLoad?.();
        };
        img.onerror = () => {
          // If WebP fails, fallback to original
          if (supportsWebP && webpSrc && finalSrc === webpSrc) {
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              setImageSrc(src);
              setIsLoading(false);
              onLoad?.();
            };
            fallbackImg.onerror = () => {
              setIsLoading(false);
              setHasError(true);
              onError?.();
            };
            fallbackImg.src = src;
          } else {
            setIsLoading(false);
            setHasError(true);
            onError?.();
          }
        };

        // Add loading priority hint if specified
        if (priority) {
          img.fetchPriority = 'high';
        }

        img.src = finalSrc;
      } catch (error) {
        setIsLoading(false);
        setHasError(true);
        onError?.();
      }
    };

    loadImage();
  }, [src, webpSrc, priority, onLoad, onError]);

  // Check WebP support
  const checkWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  };

  // Show loading placeholder or error state
  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#f3f4f6', // Light gray placeholder
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Loading image"
      >
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: '#fee2e2', // Light red error state
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Image failed to load"
      >
        <span className="text-red-600 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundImage: `url(${imageSrc})`,
      }}
      aria-label={alt}
    />
  );
};
