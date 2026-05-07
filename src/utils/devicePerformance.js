const getConnection = () => {
  if (typeof navigator === 'undefined') return null;
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

export const isTouchDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  if (window.matchMedia?.('(pointer: coarse)').matches) return true;

  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod|Android/i.test(ua)) return true;
  if (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1) return true;

  return false;
};

export const shouldLimitNetworkWarmup = () => {
  const connection = getConnection();
  if (!connection) return false;
  if (connection.saveData) return true;
  return /(^|-)2g$/.test(connection.effectiveType || '');
};

export const isLowPowerMobileDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const touch = isTouchDevice();
  const smallViewport = window.innerWidth <= 767 || window.matchMedia?.('(max-width: 767px)').matches;
  if (!touch && !smallViewport) return false;

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return true;
  if (shouldLimitNetworkWarmup()) return true;

  const memory = Number(navigator.deviceMemory || 0);
  if (memory > 0 && memory <= 4) return true;

  const cores = Number(navigator.hardwareConcurrency || 0);
  if (cores > 0 && cores <= 4) return true;

  const ua = navigator.userAgent || '';
  const screenWidth = Math.min(window.innerWidth, window.screen?.width || window.innerWidth);
  const dpr = window.devicePixelRatio || 1;

  if (/Android/i.test(ua) && screenWidth <= 540) return true;
  if (screenWidth <= 430 && dpr >= 2.75) return true;

  return false;
};

export const applyDevicePerformanceClasses = () => {
  if (typeof document === 'undefined') {
    return { touch: false, lowPowerMobile: false };
  }

  const touch = isTouchDevice();
  const lowPowerMobile = isLowPowerMobileDevice();
  const root = document.documentElement;

  root.classList.toggle('tat-touch-device', touch);
  root.classList.toggle('tat-low-power-mobile', lowPowerMobile);

  return { touch, lowPowerMobile };
};
