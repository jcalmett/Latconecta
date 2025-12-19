import React from 'react';
import { getImageUrl, useImageFallback } from '../utils/imageHelper';

/**
 * Componente de imagen con fallback automatico
 * 
 * @example
 * <ImageWithFallback 
 *   src={product.product_photo} 
 *   entityType="product"
 *   alt="Producto"
 *   className="w-full h-48 object-cover"
 * />
 */
export const ImageWithFallback = ({ src, entityType = 'default', alt = '', className = '', ...props }) => {
  const handleError = useImageFallback(entityType);
  const imageUrl = getImageUrl(src, entityType);

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;
