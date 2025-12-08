import * as React from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  webpSrc?: string;
  fallbackSrc: string;
  alt: string;
}

export const OptimizedImage: React.FC<Props> = ({ webpSrc, fallbackSrc, alt, ...rest }) => {
  // If no WebP source provided, use regular img
  if (!webpSrc) {
    return <img src={fallbackSrc} alt={alt} loading="lazy" {...rest} />;
  }

  // Use picture element for WebP + fallback
  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={fallbackSrc} alt={alt} loading="lazy" {...rest} />
    </picture>
  );
};

export default OptimizedImage;
