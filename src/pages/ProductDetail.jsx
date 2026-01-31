import React from 'react';
import { useLiveTheme } from '../hooks/useLiveTheme';
import ArchitecturalProductDetail from '../designs/architectural/ArchitecturalProductDetail';
import StandardProductDetail from './StandardProductDetail';

const ProductDetail = (props) => {
  // We pass darkMode explicitly if it's passed in props, but useLiveTheme also handles it internally for the check using context usually.
  // Actually, useLiveTheme takes (darkMode) as arg in some impls?
  // Let's check the hook usage in previous file: `const { ... } = useLiveTheme(darkMode);`
  // So we should pass props.darkMode if available.

  const { activeDesignId } = useLiveTheme(props.darkMode);

  if (activeDesignId === 'architectural') {
    return <ArchitecturalProductDetail {...props} />;
  }

  return <StandardProductDetail {...props} />;
};

export default ProductDetail;