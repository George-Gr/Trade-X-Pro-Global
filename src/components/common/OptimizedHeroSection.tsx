import { useEffect, useState } from "react";
import { OptimizedBackgroundImage } from "@/components/common/OptimizedBackgroundImage";
import { HERO_IMAGES, getOptimizedImageSrc } from "@/lib/imageOptimization";

interface HeroSectionProps {
  children: React.ReactNode;
  imageKey: keyof typeof HERO_IMAGES;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  overlay?: boolean;
  minHeight?: string;
}

export const OptimizedHeroSection = ({
  children,
  imageKey,
  className = "",
  style = {},
  priority = false,
  overlay = true,
  minHeight = "80vh",
}: HeroSectionProps) => {
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [webpImage, setWebpImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      const imageConfig = HERO_IMAGES[imageKey];
      
      if (!imageConfig) {
        console.error(`Image configuration not found for key: ${imageKey}`);
        setIsLoading(false);
        return;
      }

      try {
        // Get the best variant based on current viewport
        const bestVariant = imageConfig.variants[imageConfig.variants.length - 1]; // Use largest for now
        
        // Determine if WebP is supported and set appropriate sources
        const optimizedSrc = await getOptimizedImageSrc(bestVariant.src, bestVariant.webpSrc);
        
        setBackgroundImage(bestVariant.src);
        setWebpImage(bestVariant.webpSrc || "");
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load hero image:", error);
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imageKey]);

  // Handle window resize for responsive images
  useEffect(() => {
    let resizeTimer: number;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Reload image on significant resize
        if (window.innerWidth > 1024) {
          // Desktop
          const imageConfig = HERO_IMAGES[imageKey];
          if (imageConfig) {
            const desktopVariant = imageConfig.variants.find(v => v.width >= 1920) || 
                                  imageConfig.variants[imageConfig.variants.length - 1];
            setBackgroundImage(desktopVariant.src);
            setWebpImage(desktopVariant.webpSrc || "");
          }
        } else if (window.innerWidth > 768) {
          // Tablet
          const imageConfig = HERO_IMAGES[imageKey];
          if (imageConfig) {
            const tabletVariant = imageConfig.variants.find(v => v.width >= 1200) || 
                                  imageConfig.variants[1];
            setBackgroundImage(tabletVariant.src);
            setWebpImage(tabletVariant.webpSrc || "");
          }
        } else {
          // Mobile
          const imageConfig = HERO_IMAGES[imageKey];
          if (imageConfig) {
            const mobileVariant = imageConfig.variants[0];
            setBackgroundImage(mobileVariant.src);
            setWebpImage(mobileVariant.webpSrc || "");
          }
        }
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [imageKey]);

  return (
    <section 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        minHeight,
        ...style 
      }}
    >
      {/* Background Image */}
      <OptimizedBackgroundImage
        src={backgroundImage}
        webpSrc={webpImage}
        alt=""
        className="absolute inset-0 z-0"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
      />

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 z-10 gradient-hero" />
      )}

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {children}
      </div>
    </section>
  );
};

// Specialized components for each hero section type
export const HeroTradingSection = ({ children, className, ...props }: Omit<HeroSectionProps, 'imageKey'>) => (
  <OptimizedHeroSection
    imageKey="heroTrading"
    className={`pt-24 pb-16 sm:pt-32 sm:pb-20 ${className}`}
    priority={true}
    {...props}
  >
    {children}
  </OptimizedHeroSection>
);

export const GlobalMarketsSection = ({ children, className, ...props }: Omit<HeroSectionProps, 'imageKey'>) => (
  <OptimizedHeroSection
    imageKey="globalMarketsMap"
    className={`py-16 sm:py-20 ${className}`}
    overlay={false}
    {...props}
  >
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
    <div className="relative z-10">
      {children}
    </div>
  </OptimizedHeroSection>
);

export const SecuritySection = ({ children, className, ...props }: Omit<HeroSectionProps, 'imageKey'>) => (
  <OptimizedHeroSection
    imageKey="securityBg"
    className={`py-16 sm:py-20 bg-foreground ${className}`}
    overlay={false}
    {...props}
  >
    <div className="absolute inset-0 bg-foreground/90 backdrop-blur-sm" />
    <div className="relative z-10">
      {children}
    </div>
  </OptimizedHeroSection>
);