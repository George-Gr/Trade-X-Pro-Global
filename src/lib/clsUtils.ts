/**
 * Cumulative Layout Shift (CLS) Prevention Utilities
 *
 * This module provides utilities to prevent layout shifts by ensuring
 * consistent sizing and proper space reservation for dynamic content.
 */

/**
 * Common aspect ratios for different content types
 */
export const ASPECT_RATIOS = {
  // Video/Chart ratios
  VIDEO: '16/9',
  SQUARE: '1/1',
  PORTRAIT: '4/3',
  WIDE: '21/9',

  // Image ratios
  INSTAGRAM: '1/1',
  STORY: '9/16',
  BANNER: '3/1',

  // Document ratios
  A4: '1/1.414',
  LETTER: '1/1.294',
} as const;

/**
 * CLS-safe dimensions for common components
 */
export const CLS_DIMENSIONS = {
  // Charts
  CHART_HEIGHT: '280px',
  CHART_MIN_HEIGHT: '200px',

  // Images
  IMAGE_HEIGHT: '200px',
  PROFILE_IMAGE_HEIGHT: '80px',

  // Cards
  CARD_MIN_HEIGHT: '120px',
  FEATURE_CARD_HEIGHT: '160px',

  // Lists
  LIST_ITEM_HEIGHT: '48px',
  TABLE_ROW_HEIGHT: '40px',
} as const;

/**
 * Utility to get aspect ratio class name
 */
export const getAspectRatioClass = (ratio: string): string => {
  return `aspect-[${ratio}]`;
};

/**
 * Utility to get minimum height style
 */
export const getMinHeightStyle = (height: string): React.CSSProperties => {
  return {
    minHeight: height,
    minWidth: '100%',
  };
};

/**
 * Utility to get chart container styles
 */
export const getChartContainerStyles = (
  height: string = CLS_DIMENSIONS.CHART_HEIGHT
): React.CSSProperties => {
  return {
    height,
    minHeight: height,
    width: '100%',
    position: 'relative',
  };
};

/**
 * Utility to get skeleton styles with exact dimensions
 */
export const getSkeletonStyles = (
  height: string | number,
  width: string | number
): React.CSSProperties => {
  const heightValue = typeof height === 'string' ? height : `${height}px`;
  const widthValue = typeof width === 'string' ? width : `${width}px`;

  return {
    height: heightValue,
    width: widthValue,
    minHeight: heightValue,
    minWidth: widthValue,
  };
};

/**
 * Utility to prevent layout shifts during image loading
 */
export const getImageLoadingStyles = (
  aspectRatio: string
): React.CSSProperties => {
  return {
    aspectRatio,
    minHeight: CLS_DIMENSIONS.IMAGE_HEIGHT,
    width: '100%',
  };
};

export default {
  ASPECT_RATIOS,
  CLS_DIMENSIONS,
  getAspectRatioClass,
  getMinHeightStyle,
  getChartContainerStyles,
  getSkeletonStyles,
  getImageLoadingStyles,
};
