import { useState, useEffect, useCallback } from 'react';
import { AppRoute } from '../types';

function normalizeRoute(pathname: string): AppRoute {
  if (pathname.endsWith('/admin') || pathname.includes('/admin')) return '/admin';
  if (pathname.endsWith('/dor-fisica/resultado')) return '/dor-fisica/resultado';
  if (pathname.endsWith('/dor-fisica')) return '/dor-fisica';
  if (pathname.endsWith('/dor-problema/resultado')) return '/dor-problema/resultado';
  if (pathname.endsWith('/dor-problema')) return '/dor-problema';
  return '/';
}

function checkAndStoreTrafficSource() {
  if (typeof window === 'undefined') return;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const srcParam = urlParams.get('src');
    const isCarPath = window.location.pathname.includes('/car');

    if (srcParam === 'car' || isCarPath) {
      localStorage.setItem('qual_e_a_sua_dor:source', 'car');
      localStorage.setItem('qual_e_a_sua_dor:source_timestamp', new Date().toISOString());
    }
  } catch {
    // ignore
  }
}

export function useNavigation() {
  useEffect(() => {
    checkAndStoreTrafficSource();
  }, []);

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      checkAndStoreTrafficSource();
      return normalizeRoute(window.location.pathname);
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(normalizeRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((route: AppRoute) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', route);
      } catch {
        // Fallback for iframe restricted history
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return {
    currentRoute,
    navigate,
  };
}
