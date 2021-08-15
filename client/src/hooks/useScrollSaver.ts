import { useEffect, useRef } from 'react';

export const useScrollSaver = (location: string, path: string) => {
  const scrollLocation = useRef(0);
  useEffect(() => {
    if (scrollLocation.current > 0) {
      window.scrollTo(0, scrollLocation.current);
    }
    const handleScroll = () => {
      if (location === path) scrollLocation.current = window.pageYOffset;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);
};
